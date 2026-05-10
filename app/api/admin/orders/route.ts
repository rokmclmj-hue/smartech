import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as any)?.tier === "ADMIN";
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // 전체/CONFIRMED/CANCELLED/DELIVERY_INQUIRY

  const where = status && status !== "ALL" ? { status } : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, company: true, email: true, phone: true } },
      quote: {
        select: {
          totalAmount: true,
          taxInvoiceRequested: true,
          items: { select: { unitPrice: true, quantity: true } },
        },
      },
    },
  });

  const formatted = orders.map((o) => {
    const amount = o.quote.totalAmount
      ? o.quote.totalAmount
      : o.quote.items.reduce((s, item) => s + item.unitPrice * item.quantity, 0);
    return {
      id: o.id,
      quoteId: o.quoteId,
      company: o.user.company,
      contactName: o.contactName ?? o.user.name,
      contactPhone: o.contactPhone ?? o.user.phone,
      amount,
      taxInvoiceRequested: o.quote.taxInvoiceRequested,
      deliveryIssue: o.deliveryIssue,
      status: o.status,
      confirmedAt: o.confirmedAt?.toISOString() ?? null,
      createdAt: o.createdAt.toISOString(),
    };
  });

  return NextResponse.json(formatted);
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { orderId, action } = await req.json();

  if (!orderId || !action) {
    return NextResponse.json({ error: "orderId와 action이 필요합니다" }, { status: 400 });
  }

  const validActions = ["confirm", "cancel", "taxInvoiceDone"];
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: "유효하지 않은 action" }, { status: 400 });
  }

  if (action === "confirm") {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMED", confirmedAt: new Date() },
    });
    return NextResponse.json({ ok: true, status: order.status });
  }

  if (action === "cancel") {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ ok: true, status: order.status });
  }

  if (action === "taxInvoiceDone") {
    // 세금계산서 처리완료: Quote의 taxInvoiceRequested를 false로 (처리됨 표시)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { quoteId: true },
    });
    if (!order) return NextResponse.json({ error: "주문 없음" }, { status: 404 });
    await prisma.quote.update({
      where: { id: order.quoteId },
      data: { taxInvoiceRequested: false },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "처리 실패" }, { status: 500 });
}
