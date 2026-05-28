// 공개 현장 사진 서빙 — 블로그 본문 이미지용 (인증 불필요)
// Vercel 환경에서는 파일 없음 → 404 반환 (로컬에서만 사진 제공)
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const serve = new URL(req.url).searchParams.get("serve");
  if (!serve) return NextResponse.json({ error: "파일 없음" }, { status: 400 });

  try {
    const fs = await import("fs");
    const path = await import("path");
    const PHOTO_BASE = path.join(process.cwd(), "data", "현장사진");
    const safePath = path.join(PHOTO_BASE, serve.replace(/\.\./g, ""));

    if (!fs.existsSync(safePath)) return NextResponse.json({ error: "파일 없음" }, { status: 404 });

    const buf = fs.readFileSync(safePath);
    const ext = path.extname(safePath).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return new NextResponse(buf, {
      headers: { "Content-Type": mime, "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return NextResponse.json({ error: "파일 없음" }, { status: 404 });
  }
}
