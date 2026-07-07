import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { VAT_RATE, QUOTE_VALID_DAYS } from "@/lib/constants";

export async function GET(
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
      createdByAdmin: { select: { id: true, name: true, email: true } },
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
      order: {
        select: {
          id: true,
          status: true,
          confirmedAt: true,
          deliveryNoteIssuedAt: true,
          deliveryNoteCount: true,
        },
      },
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "견적을 찾을 수 없습니다" }, { status: 404 });
  }

  const subtotal = quote.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const vat = Math.round(subtotal * VAT_RATE);
  const grandTotal = subtotal + vat;

  const year = quote.createdAt.getFullYear();
  const seq = String(quote.id).padStart(6, "0");
  const quoteNo = `SMT-${year}-Q-${seq}`;

  const expiresAt = quote.expiresAt
    ?? new Date(quote.createdAt.getTime() + QUOTE_VALID_DAYS * 24 * 60 * 60 * 1000);
  const isExpired = expiresAt < new Date();

  return NextResponse.json({
    ...quote,
    subtotal,
    vat,
    grandTotal,
    quoteNo,
    isExpired,
  });
}
