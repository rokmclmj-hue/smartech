import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { generateRepairQuotePdf } from "@/lib/pdf";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const job = await prisma.offlineRepairJob.findUnique({
    where: { id: Number(id) },
    include: { company: { select: { companyName: true } } },
  });
  if (!job) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  const pdfBuffer = await generateRepairQuotePdf({
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
  });

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="수리견적서_${job.jobNo}.pdf"`,
    },
  });
}
