import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const nId = parseInt(id);
  if (isNaN(nId)) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });

  const body = await req.json();

  // DB 저장 단계 (클라이언트가 업로드 완료 후 직접 호출)
  if (body.phase === "save") {
    const { url, filename } = body as { url: string; filename: string };
    try {
      const existing = await prisma.offlineRepairFile.findFirst({
        where: { jobId: nId, fileType: "PHOTO_ZIP" },
      });
      if (existing) await prisma.offlineRepairFile.delete({ where: { id: existing.id } });
      await prisma.offlineRepairFile.create({
        data: { jobId: nId, fileType: "PHOTO_ZIP", fileName: filename, fileUrl: url, isSelected: true },
      });
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  // 토큰 발급 단계 (upload() 가 자동 호출)
  // onUploadCompleted 제거 → 콜백 URL 없이 토큰 생성 → Vercel 400 에러 해소
  try {
    const jsonResponse = await handleUpload({
      body: body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "application/zip",
          "application/x-zip-compressed",
          "application/x-7z-compressed",
          "application/octet-stream",
        ],
        maximumSizeInBytes: 100 * 1024 * 1024,
      }),
    });
    return NextResponse.json(jsonResponse);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
