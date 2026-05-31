import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

// GET: 블로그 목록 (또는 단일 글)
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const rows = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT id, title, category, status, "metaDesc", tags, content, "naverContent", "sourceFile", photos,
             "publishedAt", "createdAt", "updatedAt"
      FROM "BlogPost" WHERE id = ${Number(id)}
    `;
    if (!rows.length) return NextResponse.json({ error: "글 없음" }, { status: 404 });
    return NextResponse.json(rows[0]);
  }

  const statusFilter = searchParams.get("status");
  const posts = await prisma.blogPost.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      sourceFile: true,
    },
  });
  return NextResponse.json({ posts });
}

// POST: 새 글 직접 작성
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json();
  const { title, content, metaDesc, tags, category } = body;
  if (!title || !content) {
    return NextResponse.json({ error: "제목과 본문은 필수입니다" }, { status: 400 });
  }

  const post = await prisma.blogPost.create({
    data: { title, content, metaDesc: metaDesc ?? "", tags: tags ?? "", category: category ?? "일반", status: "DRAFT" },
  });
  return NextResponse.json({ id: post.id });
}

// PATCH: 글 수정 / 발행 / 아카이브
export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

  // 발행 처리 시 publishedAt 자동 세팅
  if (updates.status === "PUBLISHED") {
    const existing = await prisma.blogPost.findUnique({ where: { id: Number(id) } });
    if (existing && !existing.publishedAt) {
      updates.publishedAt = new Date();
    }
  }

  // photos 필드는 신규 추가 컬럼 — raw SQL로 별도 처리
  if ("photos" in updates) {
    const photosVal = updates.photos ?? null;
    await prisma.$executeRaw`
      UPDATE "BlogPost" SET photos = ${photosVal}, "updatedAt" = NOW() WHERE id = ${Number(id)}
    `;
    delete updates.photos;
  }

  // 나머지 필드 업데이트
  if (Object.keys(updates).length > 0) {
    await prisma.blogPost.update({ where: { id: Number(id) }, data: updates });
  }

  return NextResponse.json({ id: Number(id) });
}

// DELETE: 글 삭제
export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

  await prisma.blogPost.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
