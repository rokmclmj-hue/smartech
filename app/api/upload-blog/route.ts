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
  const { title, content, naverContent, metaDesc, tags, category, sourceFile, faqSchema } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "title과 content는 필수입니다" }, { status: 400 });
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      content,
      naverContent: naverContent ?? "",
      metaDesc:     metaDesc     ?? "",
      tags:         tags         ?? "",
      category:     category     ?? "기술문의",
      faqSchema:    faqSchema    ?? "",
      status:       "PUBLISHED",
      publishedAt:  new Date(),
      sourceFile:   sourceFile   ?? null,
    },
  });

  return NextResponse.json({
    ok:  true,
    id:  post.id,
    url: `https://www.smartechvacuum.com/blog/${post.id}`,
  });
}

// 본문에서 특정 텍스트 제거 (비밀 키 인증)
export async function PATCH(req: Request) {
  const secret = process.env.BLOG_UPLOAD_SECRET;
  const auth = req.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const { id, remove } = await req.json();
  if (!id || !remove) {
    return NextResponse.json({ error: "id와 remove는 필수" }, { status: 400 });
  }

  const post = await prisma.blogPost.findUnique({ where: { id: Number(id) } });
  if (!post) return NextResponse.json({ error: "글 없음" }, { status: 404 });

  const newContent = post.content.replace(remove, "");
  await prisma.blogPost.update({ where: { id: Number(id) }, data: { content: newContent } });

  return NextResponse.json({ ok: true, id: Number(id) });
}
