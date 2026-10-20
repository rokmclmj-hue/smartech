import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMultiplier } from "@/lib/pricing";
import { notifyNewQuote } from "@/lib/solapi";

// 로그인 없이 홈 견적서 카트에서 "주문 요청" (2026-10-20 대표님 승인)
// - 주문(Order)은 회원 계정이 있어야 만들어지므로, 직접 입력 견적과 같은 형태(guest*)로 견적 목록에 저장한다.
// - 가격은 서버에서 공개가(PUBLIC)로 다시 계산한다. 응답에는 접수번호만 보낸다(원가·내부 정보 없음).
// - 대표님께 회원 발주 요청과 같은 "🔴 발주 요청" 문자.

const MAX_ITEMS = 50;
const MAX_QTY = 999;

function text(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "요청 형식이 잘못되었습니다." }, { status: 400 });

  // 사람에게는 보이지 않는 칸 — 채워져 있으면 자동 입력(스팸)으로 보고 저장하지 않는다
  if (text(body.website, 200)) return NextResponse.json({ ok: true, quoteNo: "" });

  const company = text(body.company, 100);
  const name = text(body.name, 50);
  const phone = text(body.phone, 30);
  const email = text(body.email, 120);
  const note = text(body.note, 1000);

  if (!company || !name) return NextResponse.json({ error: "회사명과 담당자를 입력해 주세요." }, { status: 400 });
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 11) {
    return NextResponse.json({ error: "연락처를 정확히 입력해 주세요." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "이메일 형식을 확인해 주세요." }, { status: 400 });
  }

  const rawItems: unknown = body.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > MAX_ITEMS) {
    return NextResponse.json({ error: "품목을 확인해 주세요." }, { status: 400 });
  }
  const items: { productId: number; quantity: number }[] = [];
  for (const it of rawItems) {
    const productId = Number((it as { productId?: unknown })?.productId);
    const quantity = Number((it as { quantity?: unknown })?.quantity);
    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      return NextResponse.json({ error: "품목 수량을 확인해 주세요." }, { status: 400 });
    }
    items.push({ productId, quantity });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    select: { id: true, costPrice: true },
  });
  if (products.length !== new Set(items.map((i) => i.productId)).size) {
    return NextResponse.json({ error: "찾을 수 없는 제품이 있습니다. 카트를 다시 확인해 주세요." }, { status: 400 });
  }
  const multiplier = await getMultiplier("PUBLIC");
  const costById = new Map(products.map((p) => [p.id, p.costPrice]));
  const itemData = items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    unitPrice: Math.round((costById.get(i.productId) ?? 0) * multiplier),
  }));
  const totalAmount = itemData.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const quote = await prisma.quote.create({
    data: {
      status: "SENT",
      note: `[홈페이지 주문 요청]${note ? `\n${note}` : ""}`,
      inquirySource: "WEB",
      totalAmount,
      expiresAt,
      guestName: name,
      guestCompany: company,
      guestPhone: phone,
      guestEmail: email || null,
      guestTier: "PUBLIC",
      items: { create: itemData },
    },
    select: { id: true, createdAt: true },
  });

  try {
    await notifyNewQuote(quote.id, `${company} ${name} (홈페이지·비회원)`, totalAmount, true);
  } catch (err) {
    console.error("[Guest order SMS] 알림 오류:", err);
  }

  const quoteNo = `SMT-${quote.createdAt.getFullYear()}-Q-${String(quote.id).padStart(6, "0")}`;
  return NextResponse.json({ ok: true, quoteNo });
}
