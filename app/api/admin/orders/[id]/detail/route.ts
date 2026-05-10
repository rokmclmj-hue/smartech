import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { VAT_RATE } from "@/lib/constants";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (!Number.isFinite(orderId)) {
    return NextResponse.json({ error: "잘못된 주문 ID" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          company: true,
          phone: true,
          businessNo: true,
          tier: true,
        },
      },
      quote: {
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  partNo: true,
                  description: true,
                  category: true,
                  costPrice: true,
                  stock: true,
                },
              },
            },
          },
          createdByAdmin: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  }

  const subtotal = order.quote.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const vat = Math.round(subtotal * VAT_RATE);
  const grandTotal = subtotal + vat;

  const year = order.createdAt.getFullYear();
  const noteNo = `SMT-${year}-D-${String(order.id).padStart(6, "0")}`;
  const quoteYear = order.quote.createdAt.getFullYear();
  const quoteNo = `SMT-${quoteYear}-Q-${String(order.quote.id).padStart(6, "0")}`;

  return NextResponse.json({
    ...order,
    subtotal,
    vat,
    grandTotal,
    noteNo,
    quoteNo,
  });
}
