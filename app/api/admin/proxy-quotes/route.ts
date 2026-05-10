import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

type LineInput = {
  productId: number;
  quantity: number;
  unitPrice: number;
};

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "요청 형식이 잘못되었습니다." }, { status: 400 });
  }

  const customerId = Number(body.customerId);
  const items = body.items as LineInput[] | undefined;
  const note = typeof body.note === "string" ? body.note : null;
  const taxInvoiceRequested = Boolean(body.taxInvoiceRequested);

  if (!Number.isFinite(customerId) || customerId <= 0) {
    return NextResponse.json({ error: "고객을 선택해주세요." }, { status: 400 });
  }
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "품목이 없습니다." }, { status: 400 });
  }

  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (!customer) {
    return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
  }

  const productIds = items.map((i) => Number(i.productId)).filter((n) => Number.isFinite(n));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true },
  });
  const validIds = new Set(products.map((p) => p.id));

  const itemData: { productId: number; quantity: number; unitPrice: number }[] = [];
  for (const i of items) {
    const pid = Number(i.productId);
    const qty = Number(i.quantity);
    const price = Number(i.unitPrice);
    if (!validIds.has(pid)) {
      return NextResponse.json({ error: `제품 ID ${pid}를 찾을 수 없습니다.` }, { status: 400 });
    }
    if (!Number.isFinite(qty) || qty < 1) {
      return NextResponse.json({ error: "수량이 올바르지 않습니다." }, { status: 400 });
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "단가가 올바르지 않습니다." }, { status: 400 });
    }
    itemData.push({ productId: pid, quantity: qty, unitPrice: price });
  }

  const totalAmount = itemData.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const quote = await prisma.quote.create({
    data: {
      userId: customer.id,
      createdByAdminId: admin.userId,
      status: "SENT",
      note,
      taxInvoiceRequested,
      totalAmount,
      expiresAt,
      items: { create: itemData },
    },
  });

  return NextResponse.json({ quoteId: quote.id });
}
