import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { generateRepairQuotePdf, generateRepairInspectionPdf } from "@/lib/pdf";
import { sendRepairQuote } from "@/lib/mailer";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const overrideEmail: string | undefined = body.email;

  const job = await prisma.offlineRepairJob.findUnique({
    where: { id: Number(id) },
    include: {
      company: { select: { companyName: true } },
      inspectionItems: { orderBy: { sortOrder: "asc" } },
      files: { where: { isSelected: true, fileType: "PHOTO" }, orderBy: { uploadedAt: "asc" } },
    },
  });
  if (!job) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  const toEmail = overrideEmail || job.contactEmail;
  if (!toEmail) return NextResponse.json({ error: "수신 이메일이 없습니다." }, { status: 400 });

  const [quotePdf, inspectionPdf] = await Promise.all([
    generateRepairQuotePdf({
      jobNo: job.jobNo,
      pumpMaker: job.pumpMaker,
      pumpModel: job.pumpModel,
      serialNo: job.serialNo,
      voltage: job.voltage,
      repairReason: job.repairReason,
      receivedDate: job.receivedDate,
      requestedDate: job.requestedDate,
      companyName: job.company?.companyName ?? null,
      contactName: job.contactName,
      contactEmail: job.contactEmail,
      repairCost: job.repairCost,
      repairPartsText: job.repairPartsText,
      inspectorName: job.inspectorName,
    }),
    generateRepairInspectionPdf({
      jobNo: job.jobNo,
      pumpMaker: job.pumpMaker,
      pumpModel: job.pumpModel,
      serialNo: job.serialNo,
      voltage: job.voltage,
      receivedDate: job.receivedDate,
      companyName: job.company?.companyName ?? null,
      contactName: job.contactName,
      inspectorName: job.inspectorName,
      inspectionItems: job.inspectionItems,
      selectedPhotos: job.files.map(f => ({ fileName: f.fileName, fileUrl: f.fileUrl })),
    }),
  ]);

  await sendRepairQuote({
    to: toEmail,
    jobNo: job.jobNo,
    companyName: job.company?.companyName ?? job.contactName ?? "고객",
    contactName: job.contactName,
    quotePdfBuffer: quotePdf,
    inspectionPdfBuffer: inspectionPdf,
    bodyText: body.bodyText,
  });

  await prisma.offlineRepairJob.update({
    where: { id: Number(id) },
    data: { status: "QUOTE_SENT" },
  });

  return NextResponse.json({ ok: true });
}
