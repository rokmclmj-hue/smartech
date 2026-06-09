import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { notifyOrderConfirmed } from "@/lib/solapi";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { id } = await params;
  const quoteId = parseInt(id);
  if (!Number.isFinite(quoteId)) {
    return NextResponse.json({ error: "잘못된 견적 ID" }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      user: { select: { name: true } },
      items: { select: { productId: true, quantity: true } },
      order: { select: { id: true } },
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "견적을 찾을 수 없습니다" }, { status: 404 });
  }

  const quotedUserId = quote.userId;
  if (!quotedUserId) {
    return NextResponse.json({ error: "견적에 사용자 정보가 없습니다" }, { status: 400 });
  }

  if (quote.order) {
    return NextResponse.json(
      { error: "이미 발주가 확정된 견적입니다", orderId: quote.order.id },
      { status: 409 }
    );
  }

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        quoteId,
        userId: quotedUserId,
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    });

    await tx.quote.update({
      where: { id: quoteId },
      data: { status: "CONFIRMED" },
    });

    for (const item of quote.items) {
      if (!item.productId) continue;
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  try {
    await notifyOrderConfirmed(order.id, quote.user?.name ?? "고객");
  } catch {
    // SMS 실패해도 확정은 유지
  }

  return NextResponse.json({ ok: true, orderId: order.id });
}
