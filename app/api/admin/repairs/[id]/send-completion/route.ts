import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { generateManualDeliveryNotePdf } from "@/lib/pdf";
import { sendRepairCompletion } from "@/lib/mailer";

type Params = { params: Promise<{ id: string }> };

// 파일 URL → Buffer 변환 (Vercel Blob public URL)
async function fetchFileBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`파일 다운로드 실패: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function contentTypeFromName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "application/pdf";
  if (["jpg", "jpeg"].includes(ext)) return "image/jpeg";
  if (ext === "png") return "image/png";
  return "application/octet-stream";
}

export async function POST(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const repair = await prisma.repairRequest.findUnique({
    where: { id: Number(id) },
    include: { files: true },
  });

  if (!repair) return NextResponse.json({ error: "접수 없음" }, { status: 404 });
  if (!repair.contactEmail) return NextResponse.json({ error: "이메일 없음" }, { status: 400 });
  if (repair.totalAmount <= 0) return NextResponse.json({ error: "금액 미입력" }, { status: 400 });

  // 1. 거래명세표 PDF 생성
  const deliveryNotePdf = await generateManualDeliveryNotePdf({
    noteNo: repair.repairNo,
    createdAt: new Date(),
    toCompany: repair.company ?? repair.contactName,
    toName: repair.contactName,
    toEmail: repair.contactEmail,
    toPhone: repair.contactPhone,
    includeBankInfo: true,
    items: [
      {
        partNo: "-",
        description: `진공펌프 수리 (${repair.pumpMaker} ${repair.pumpModel})`,
        quantity: 1,
        unitPrice: Math.round(repair.totalAmount / 1.1), // 부가세 역산
      },
    ],
  });

  // 2. 업로드 파일 첨부 (검사성적서, 분해사진, 통장사본)
  const ATTACH_TYPES = ["inspection_cert", "disassembly_photo", "bank_copy"];
  const extraAttachments: { filename: string; content: Buffer; contentType: string }[] = [];

  const counters: Record<string, number> = {};
  for (const file of repair.files) {
    if (!ATTACH_TYPES.includes(file.fileType)) continue;
    if (!file.fileUrl.startsWith("https://")) continue;
    try {
      const buf = await fetchFileBuffer(file.fileUrl);
      counters[file.fileType] = (counters[file.fileType] ?? 0) + 1;
      const idx = counters[file.fileType];
      const label =
        file.fileType === "inspection_cert" ? `검사성적서_${repair.repairNo}` :
        file.fileType === "disassembly_photo" ? `분해사진_${String(idx).padStart(2, "0")}` :
        `통장사본_${repair.repairNo}`;
      const ext = file.fileName.split(".").pop() ?? "bin";
      extraAttachments.push({
        filename: `${label}.${ext}`,
        content: buf,
        contentType: contentTypeFromName(file.fileName),
      });
    } catch {
      // 개별 파일 실패는 건너뜀 (나머지는 계속 발송)
    }
  }

  // 3. 이메일 발송
  await sendRepairCompletion({
    to: repair.contactEmail,
    jobNo: repair.repairNo,
    companyName: repair.company ?? repair.contactName,
    contactName: repair.contactName,
    deliveryNotePdfBuffer: deliveryNotePdf,
    extraAttachments,
  });

  // 4. 발송 이력 기록
  await prisma.repairRequest.update({
    where: { id: Number(id) },
    data: { docsSentAt: new Date(), docsSentCount: { increment: 1 } },
  });

  return NextResponse.json({
    ok: true,
    sentTo: repair.contactEmail,
    attachedFiles: extraAttachments.map((a) => a.filename),
  });
}

// GET: 발송 전 미리보기 (업로드된 파일 현황 확인)
export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const repair = await prisma.repairRequest.findUnique({
    where: { id: Number(id) },
    include: { files: { orderBy: { createdAt: "asc" } } },
  });

  if (!repair) return NextResponse.json({ error: "접수 없음" }, { status: 404 });

  const summary = {
    hasEmail: !!repair.contactEmail,
    hasAmount: repair.totalAmount > 0,
    deliveryNote: true, // 항상 자동 생성
    inspectionCert: repair.files.some((f) => f.fileType === "inspection_cert"),
    disassemblyPhotos: repair.files.filter((f) => f.fileType === "disassembly_photo").length,
    bankCopy: repair.files.some((f) => f.fileType === "bank_copy"),
  };

  return NextResponse.json(summary);
}
