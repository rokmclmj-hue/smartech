import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { postToX, PostedButUnconfirmedError } from "@/lib/x-post";

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
  // action: "approve" | "reject" | "publish"

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
    // status를 원자적으로 APPROVED → PUBLISHING 으로 바꿔서 "선점"한다.
    // findUnique로 상태를 읽고 나서 update하는 방식은 두 요청(더블클릭·중복 탭)이 동시에
    // 통과해 같은 글이 X에 두 번 게시될 수 있어, updateMany의 where 조건 자체로 경쟁을 막는다.
    const claim = await prisma.xPost.updateMany({
      where: { id: postId, status: "APPROVED" },
      data: { status: "PUBLISHING" },
    });
    if (claim.count === 0) {
      return NextResponse.json({ error: "승인된 글만 게시할 수 있습니다 (이미 게시 중이거나 처리된 글입니다)" }, { status: 400 });
    }

    try {
      const result = await postToX(post.content);
      await prisma.xPost.update({
        where: { id: postId },
        data: { status: "POSTED", postedAt: new Date(), tweetId: result.id },
      });
      return NextResponse.json({ ok: true, tweetId: result.id });
    } catch (e) {
      if (e instanceof PostedButUnconfirmedError) {
        // X에 실제로 게시됐을 가능성이 있어 PUBLISHING 상태로 남겨 재게시(중복 게시)를 막는다.
        // 관리자가 X 계정에서 직접 확인한 뒤 수동으로 상태를 정리해야 한다.
        await prisma.xPost.update({
          where: { id: postId },
          data: { adminNote: `[확인 필요] ${e.message}` },
        });
        return NextResponse.json({ error: e.message, needsManualCheck: true }, { status: 502 });
      }
      // 게시 시도 자체가 실패한 경우(트윗이 올라가지 않음) — 재시도할 수 있도록 되돌린다
      await prisma.xPost.update({
        where: { id: postId },
        data: { status: "APPROVED" },
      });
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
