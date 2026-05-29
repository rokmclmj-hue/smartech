import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendBusinessDocRequest } from "@/lib/mailer";
import { notifyOrderConfirmed } from "@/lib/solapi";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);
  const tier = (session.user as any).tier as string;
  const isAdmin = tier === "ADMIN";

  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId },
    include: {
      quote: {
        include: {
          items: {
            include: { product: { select: { partNo: true, description: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);
  const userName = session.user.name ?? "고객";
  const userEmail = session.user.email ?? "";

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "요청 형식이 잘못되었습니다." }, { status: 400 });
  }

  const {
    quoteId,
    deliveryIssue = false,
    contactName,
    contactPhone,
  }: {
    quoteId: number;
    deliveryIssue: boolean;
    contactName?: string;
    contactPhone?: string;
  } = body;

  if (!quoteId) {
    return NextResponse.json({ error: "견적 ID가 필요합니다." }, { status: 400 });
  }

  // 견적 존재 및 본인 소유 확인
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { items: { include: { product: true } } },
  });

  if (!quote) {
    return NextResponse.json({ error: "견적을 찾을 수 없습니다." }, { status: 404 });
  }

  if (quote.userId !== userId) {
    return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
  }

  // 이미 주문이 있는지 확인
  const existingOrder = await prisma.order.findUnique({ where: { quoteId } });
  if (existingOrder) {
    return NextResponse.json(
      { error: "이미 주문이 접수된 견적입니다.", orderId: existingOrder.id },
      { status: 409 }
    );
  }

  const orderStatus = deliveryIssue ? "PENDING" : "CONFIRMED";

  // 트랜잭션으로 Order 생성 + Quote 상태 변경 + 재고 차감
  const order = await prisma.$transaction(async (tx) => {
    // Order 생성
    const newOrder = await tx.order.create({
      data: {
        quoteId,
        userId,
        status: orderStatus,
        deliveryIssue,
        contactName: contactName ?? null,
        contactPhone: contactPhone ?? null,
        confirmedAt: deliveryIssue ? null : new Date(),
      },
    });

    if (!deliveryIssue) {
      // Quote 상태 → CONFIRMED
      await tx.quote.update({
        where: { id: quoteId },
        data: { status: "CONFIRMED" },
      });

      // 재고 차감
      for (const item of quote.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return newOrder;
  });

  // 사이드이펙트: 이메일, SMS (실패해도 주문은 성공)

  if (!deliveryIssue) {
    // 주문 확정: 사업자등록증 이메일 요청
    try {
      if (userEmail) {
        await sendBusinessDocRequest(userEmail, userName);
      }
    } catch (err) {
      console.error("[Order] 사업자등록증 이메일 오류:", err);
    }
  }

  // 관리자 알림톡
  try {
    await notifyOrderConfirmed(order.id, userName);
  } catch (err) {
    console.error("[Order] 관리자 알림톡 오류:", err);
  }

  return NextResponse.json({ orderId: order.id, status: order.status });
}
