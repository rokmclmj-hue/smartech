import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";

// GET — 토큰 유효성 확인 (페이지 진입 시)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const uploadToken = await prisma.uploadToken.findUnique({
    where: { token },
    include: { repair: { select: { repairNo: true, pumpMaker: true, pumpModel: true, status: true } } },
  });

  if (!uploadToken) return NextResponse.json({ error: "링크를 찾을 수 없습니다." }, { status: 404 });
  if (uploadToken.expiresAt < new Date()) return NextResponse.json({ error: "만료된 링크입니다." }, { status: 410 });

  return NextResponse.json({
    repairNo: uploadToken.repair.repairNo,
    pumpMaker: uploadToken.repair.pumpMaker,
    pumpModel: uploadToken.repair.pumpModel,
    expiresAt: uploadToken.expiresAt,
  });
}

// POST — 파일 업로드 (외주업체, 로그인 없음)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const uploadToken = await prisma.uploadToken.findUnique({
    where: { token },
    include: { repair: true },
  });

  if (!uploadToken) return NextResponse.json({ error: "링크를 찾을 수 없습니다." }, { status: 404 });
  if (uploadToken.expiresAt < new Date()) return NextResponse.json({ error: "만료된 링크입니다." }, { status: 410 });

  const formData = await req.formData();
  const fileType = formData.get("fileType") as string; // disassembly_photo | inspection_cert
  const files = formData.getAll("files") as File[];

  if (!fileType || files.length === 0) {
    return NextResponse.json({ error: "파일 또는 타입 누락" }, { status: 400 });
  }

  const repair = uploadToken.repair;
  const saved: { fileName: string; fileUrl: string }[] = [];

  for (const file of files) {
    const blobName = `repairs/${repair.repairNo}/${fileType}/${Date.now()}-${file.name}`;

    let fileUrl: string;
    try {
      const blob = await put(blobName, file, { access: "public" });
      fileUrl = blob.url;
    } catch {
      fileUrl = `[BLOB 미설정] ${file.name}`;
    }

    await prisma.repairFile.create({
      data: {
        repairId: repair.id,
        fileType,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        uploadedBy: "outsource",
      },
    });
    saved.push({ fileName: file.name, fileUrl });
  }

  // 최초 업로드 시각 기록
  if (!uploadToken.usedAt) {
    await prisma.uploadToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });
  }

  // 관리자 SMS 알림
  const totalUploaded = await prisma.repairFile.count({ where: { repairId: repair.id } });
  try {
    const { notifyPartnerUpload } = await import("@/lib/solapi");
    await notifyPartnerUpload(repair.repairNo, totalUploaded);
  } catch {
    // SMS 실패해도 업로드는 성공
  }

  return NextResponse.json({ saved, count: saved.length });
}
