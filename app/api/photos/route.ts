// 공개 현장 사진 서빙 — 블로그 본문 이미지용 (인증 불필요)
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PHOTO_BASE = path.join(process.cwd(), "data", "현장사진");

export async function GET(req: NextRequest) {
  const serve = new URL(req.url).searchParams.get("serve");
  if (!serve) return NextResponse.json({ error: "파일 없음" }, { status: 400 });

  const safePath = path.join(PHOTO_BASE, serve.replace(/\.\./g, ""));
  if (!fs.existsSync(safePath)) return NextResponse.json({ error: "파일 없음" }, { status: 404 });

  const buf = fs.readFileSync(safePath);
  const ext = path.extname(safePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return new NextResponse(buf, {
    headers: { "Content-Type": mime, "Cache-Control": "public, max-age=86400" },
  });
}
