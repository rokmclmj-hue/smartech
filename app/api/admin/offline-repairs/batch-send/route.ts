import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { generateRepairQuotePdf, generateRepairInspectionPdf } from "@/lib/pdf";
import { sendRepairQuoteBatch } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const ids: number[] = body?.ids ?? [];
  const email: string = body?.email ?? "";
  if (!ids.length || !email.trim())
    return NextResponse.json({ error: "ids와 email이 필요합니다." }, { status: 400 });

  const jobs = await prisma.offlineRepairJob.findMany({
    where: { id: { in: ids } },
    include: {
      company: { select: { companyName: true } },
      inspectionItems: { orderBy: { sortOrder: "asc" } },
      files: { where: { isSelected: true, fileType: "PHOTO" }, orderBy: { uploadedAt: "asc" } },
    },
    orderBy: { id: "asc" },
  });
  if (!jobs.length) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  // 각 건별 PDF 생성 (병렬)
  const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
  await Promise.all(jobs.map(async (job) => {
    const [quotePdf, inspectionPdf] = await Promise.all([
      generateRepairQuotePdf({
        jobNo: job.jobNo, pumpMaker: job.pumpMaker, pumpModel: job.pumpModel,
        serialNo: job.serialNo, voltage: job.voltage, repairReason: job.repairReason,
        receivedDate: job.receivedDate, requestedDate: job.requestedDate,
        companyName: job.company?.companyName ?? null,
        contactName: job.contactName, contactEmail: job.contactEmail, contactPhone: job.contactPhone,
        repairCost: job.repairCost, repairPartsText: job.repairPartsText, inspectorName: job.inspectorName,
        quoteRemarks: job.quoteRemarks,
      }),
      generateRepairInspectionPdf({
        jobNo: job.jobNo, pumpMaker: job.pumpMaker, pumpModel: job.pumpModel,
        serialNo: job.serialNo, voltage: job.voltage, receivedDate: job.receivedDate,
        companyName: job.company?.companyName ?? null,
        contactName: job.contactName, inspectorName: job.inspectorName,
        inspectionItems: job.inspectionItems,
        selectedPhotos: job.files.map(f => ({ fileName: f.fileName, fileUrl: f.fileUrl })),
      }),
    ]);
    attachments.push(
      { filename: `수리견적서_${job.jobNo}.pdf`, content: quotePdf, contentType: "application/pdf" },
      { filename: `검사성적서_${job.jobNo}.pdf`, content: inspectionPdf, contentType: "application/pdf" },
    );
  }));

  const first = jobs[0];
  try {
    await sendRepairQuoteBatch({
      to: email,
      jobs: jobs.map(j => ({ jobNo: j.jobNo, pumpMaker: j.pumpMaker, pumpModel: j.pumpModel, serialNo: j.serialNo })),
      companyName: first.company?.companyName ?? first.contactName ?? "고객",
      contactName: first.contactName,
      attachments,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "이메일 발송 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  await prisma.offlineRepairJob.updateMany({
    where: { id: { in: ids } },
    data: { status: "QUOTE_SENT" },
  });

  return NextResponse.json({ ok: true, count: jobs.length });
}
