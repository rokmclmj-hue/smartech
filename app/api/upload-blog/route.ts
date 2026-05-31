import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 블로그 클로드 에이전트가 글 완성 후 자동 업로드하는 전용 엔드포인트
// 어드민 세션 불필요 — 비밀 키(BLOG_UPLOAD_SECRET)로 인증
export async function POST(req: Request) {
  const secret = process.env.BLOG_UPLOAD_SECRET;
  const auth = req.headers.get("Authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const body = await req.json();
  const { title, content, metaDesc, tags, category, sourceFile } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "title과 content는 필수입니다" }, { status: 400 });
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      content,
      metaDesc:    metaDesc    ?? "",
      tags:        tags        ?? "",
      category:    category    ?? "AI콘텐츠",
      status:      "PUBLISHED",
      publishedAt: new Date(),
      sourceFile:  sourceFile  ?? null,
    },
  });

  return NextResponse.json({
    ok:  true,
    id:  post.id,
    url: `https://www.smartechvacuum.com/blog/${post.id}`,
  });
}
