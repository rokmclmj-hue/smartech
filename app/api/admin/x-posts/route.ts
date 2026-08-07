import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { postToX } from "@/lib/x-post";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { tier?: string })?.tier === "ADMIN";
}

// ─── GET: 목록 조회 ───────────────────────────
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "PENDING";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const [posts, total] = await Promise.all([
    prisma.xPost.findMany({
      where: status === "ALL" ? {} : { status },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.xPost.count({
      where: status === "ALL" ? {} : { status },
    }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

// ─── PATCH: 승인 / 반려 ──────────────────────
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const body = await req.json();
  const { id, action, adminNote } = body;
  // action: "approve" | "reject"

  const postId = Number(id);
  if (!id || isNaN(postId)) {
    return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });
  }

  const post = await prisma.xPost.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: "글 없음" }, { status: 404 });

  if (action === "approve") {
    await prisma.xPost.update({
      where: { id: postId },
      data: { status: "APPROVED", adminNote: adminNote ?? null, approvedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    await prisma.xPost.update({
      where: { id: postId },
      data: { status: "REJECTED", adminNote: adminNote ?? null },
    });
    return NextResponse.json({ ok: true });
  }

  // 실제 X 게시 — 승인된 글에 대해 관리자가 명시적으로 "게시" 버튼을 눌렀을 때만 호출됨
  if (action === "publish") {
    if (post.status !== "APPROVED") {
      return NextResponse.json({ error: "승인된 글만 게시할 수 있습니다" }, { status: 400 });
    }
    try {
      const result = await postToX(post.content);
      await prisma.xPost.update({
        where: { id: postId },
        data: { status: "POSTED", postedAt: new Date(), tweetId: result.id },
      });
      return NextResponse.json({ ok: true, tweetId: result.id });
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "잘못된 action" }, { status: 400 });
}

// ─── DELETE: 삭제 ──────────────────────
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });

  await prisma.xPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
