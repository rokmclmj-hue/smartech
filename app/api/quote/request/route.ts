import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMultiplier } from "@/lib/pricing";
import { sendQuotePdf } from "@/lib/mailer";
import { notifyNewQuote, notifyBulkOrder } from "@/lib/solapi";
import { generateQuotePdf } from "@/lib/pdf";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);
  const tier = (session.user as any).tier as string;
  const userName = session.user.name ?? "고객";
  const userEmail = session.user.email ?? "";

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "요청 형식이 잘못되었습니다." }, { status: 400 });
  }

  const {
    items,
    taxInvoiceRequested = false,
    note,
  }: {
    items: { productId: number; quantity: number }[];
    taxInvoiceRequested: boolean;
    note?: string;
  } = body;

  if (!items?.length) {
    return NextResponse.json({ error: "품목이 없습니다." }, { status: 400 });
  }

  // PENDING/미승인 등급은 견적 요청 불가
  if (tier === "PENDING") {
    return NextResponse.json(
      { error: "관리자 승인 후 견적 요청이 가능합니다." },
      { status: 403 }
    );
  }

  const multiplier = await getMultiplier(tier);

  // 각 제품 조회 및 단가 계산
  const quoteItemData: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[] = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      return NextResponse.json(
        { error: `제품 ID ${item.productId}를 찾을 수 없습니다.` },
        { status: 400 }
      );
    }
    const unitPrice = Math.round(product.costPrice * multiplier);
    quoteItemData.push({ productId: item.productId, quantity: item.quantity, unitPrice });
  }

  // totalAmount 계산
  const totalAmount = quoteItemData.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );

  // 유효기간: 발행일 + 14일
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  // Quote 생성
  const quote = await prisma.quote.create({
    data: {
      userId,
      note: note ?? null,
      status: "SENT",
      taxInvoiceRequested,
      totalAmount,
      expiresAt,
      items: {
        create: quoteItemData,
      },
    },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });

  // PDF 생성 & 이메일 발송 (실패해도 견적 생성은 성공 처리)
  try {
    const pdfBuffer = await generateQuotePdf({
      ...quote,
      user: {
        name: quote.user?.name ?? "",
        company: quote.user?.company ?? "",
        email: quote.user?.email ?? "",
        phone: quote.user?.phone ?? null,
      },
      items: quote.items.map((it) => ({
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        product: {
          partNo: it.customPartNo ?? it.product?.partNo ?? "",
          description: it.customDescription ?? it.product?.description ?? "",
          category: it.product?.category ?? null,
        },
      })),
    });
    const quoteNo = `Q-${quote.id}-${formatDate(quote.createdAt)}`;
    if (userEmail) {
      await sendQuotePdf(userEmail, pdfBuffer, quoteNo);
    }
  } catch (err) {
    console.error("[Quote PDF/Mail] 오류:", err);
  }

  // 관리자 알림톡
  try {
    await notifyNewQuote(quote.id, userName, totalAmount);
  } catch (err) {
    console.error("[Quote SMS] 알림 오류:", err);
  }

  // 대량 주문 조건: 총 수량 10개 이상 AND 총금액 5,000,000원 이상
  const totalQty = quoteItemData.reduce((sum, i) => sum + i.quantity, 0);
  if (totalQty >= 10 && totalAmount >= 5_000_000) {
    try {
      await notifyBulkOrder(quote.id, userName, totalQty, totalAmount);
    } catch (err) {
      console.error("[BulkOrder SMS] 알림 오류:", err);
    }
  }

  return NextResponse.json({
    quoteId: quote.id,
    downloadUrl: `/api/quote/${quote.id}/pdf`,
  });
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}
