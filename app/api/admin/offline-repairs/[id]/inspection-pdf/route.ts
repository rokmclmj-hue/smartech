import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { generateRepairInspectionPdf, buildDownloadFilename } from "@/lib/pdf";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const job = await prisma.offlineRepairJob.findUnique({
    where: { id: Number(id) },
    include: {
      company: { select: { companyName: true } },
      inspectionItems: { orderBy: { sortOrder: "asc" } },
      files: { where: { isSelected: true, fileType: "PHOTO" }, orderBy: { uploadedAt: "asc" } },
    },
  });
  if (!job) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  try {
    const pdfBuffer = await generateRepairInspectionPdf({
      jobNo: job.jobNo,
      pumpMaker: job.pumpMaker,
      pumpModel: job.pumpModel,
      serialNo: job.serialNo,
      voltage: job.voltage,
      receivedDate: job.receivedDate,
      companyName: job.company?.companyName ?? null,
      contactName: job.contactName,
      inspectorName: job.inspectorName,
      remarks: job.quoteRemarks,
      inspectionItems: job.inspectionItems,
      selectedPhotos: job.files.map(f => ({ fileName: f.fileName, fileUrl: f.fileUrl })),
    });

    const smartFilename = buildDownloadFilename("검사성적서", job.company?.companyName ?? null, job.pumpModel);
    const encodedFilename = encodeURIComponent(smartFilename);

    return new NextResponse(Buffer.from(pdfBuffer).buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="inspection_${job.jobNo}.pdf"; filename*=UTF-8''${encodedFilename}`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error("[검사성적서 PDF 오류]", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
