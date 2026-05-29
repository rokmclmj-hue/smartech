import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const quoteId = parseInt(id);
  if (isNaN(quoteId)) {
    return NextResponse.json({ error: "잘못된 견적 ID입니다." }, { status: 400 });
  }

  const userId = parseInt((session.user as any).id);
  const tier = (session.user as any).tier as string;
  const isAdmin = tier === "ADMIN";

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { order: true },
  });

  if (!quote) {
    return NextResponse.json({ error: "견적을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!isAdmin && quote.userId !== userId) {
    return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
  }

  // 이미 주문된 견적은 삭제 불가
  if (quote.order) {
    return NextResponse.json(
      { error: "주문이 확정된 견적은 삭제할 수 없습니다." },
      { status: 409 }
    );
  }

  await prisma.quote.delete({ where: { id: quoteId } });

  return NextResponse.json({ ok: true });
}
