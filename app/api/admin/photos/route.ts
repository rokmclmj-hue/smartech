import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import fs from "fs";
import path from "path";

function isAdmin(session: Session | null) {
  return (session?.user as { tier?: string })?.tier === "ADMIN";
}

const PHOTO_BASE = path.join(process.cwd(), "data", "현장사진");

// GET /api/admin/photos?folder=04_수리정비   → 폴더 내 파일 목록
// GET /api/admin/photos?serve=04_수리정비/xxx.jpg → 이미지 바이너리 반환
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const serve = searchParams.get("serve");
  const folder = searchParams.get("folder");

  // 이미지 바이너리 서빙
  if (serve) {
    const safePath = path.join(PHOTO_BASE, serve.replace(/\.\./g, ""));
    if (!fs.existsSync(safePath)) return NextResponse.json({ error: "파일 없음" }, { status: 404 });
    const buf = fs.readFileSync(safePath);
    const ext = path.extname(safePath).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return new NextResponse(buf, { headers: { "Content-Type": mime, "Cache-Control": "public, max-age=3600" } });
  }

  // 폴더 목록 또는 전체 폴더 목록
  if (folder) {
    const folderPath = path.join(PHOTO_BASE, folder);
    if (!fs.existsSync(folderPath)) return NextResponse.json({ files: [] });
    const files = fs.readdirSync(folderPath)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .map(f => `${folder}/${f}`);
    return NextResponse.json({ files });
  }

  // 사용된 사진 목록 (중복 방지용)
  const usedParam = searchParams.get("used");
  if (usedParam === "1") {
    const { prisma } = await import("@/lib/db");
    const posts = await prisma.blogPost.findMany({ select: { photos: true } });
    const used: string[] = [];
    for (const post of posts) {
      if (post.photos) {
        try { used.push(...JSON.parse(post.photos)); } catch {}
      }
    }
    return NextResponse.json({ used: [...new Set(used)] });
  }

  // 전체 폴더 목록
  const folders = fs.existsSync(PHOTO_BASE)
    ? fs.readdirSync(PHOTO_BASE, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => {
          const count = fs.readdirSync(path.join(PHOTO_BASE, d.name))
            .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).length;
          return { name: d.name, count };
        })
    : [];
  return NextResponse.json({ folders });
}
