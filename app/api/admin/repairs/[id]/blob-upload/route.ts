import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

type Params = { params: Promise<{ id: string }> };

function isAdmin(session: Session | null) {
  return (session?.user as { tier?: string })?.tier === "ADMIN";
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const repairId = Number(id);
  if (isNaN(repairId)) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });

  const body = await req.json();

  // DB 저장 단계 (클라이언트가 업로드 완료 후 직접 호출)
  if (body.phase === "save") {
    const { url, filename, fileType, fileSize } = body as {
      url: string; filename: string; fileType: string; fileSize: number;
    };
    try {
      await prisma.repairFile.create({
        data: { repairId, fileType, fileName: filename, fileUrl: url, fileSize: fileSize ?? 0, uploadedBy: "admin" },
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
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "image/heic",
          "image/heif",
          "application/pdf",
          "video/mp4",
          "video/quicktime",
          "application/zip",
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
