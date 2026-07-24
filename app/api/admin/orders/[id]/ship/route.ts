import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { generateDeliveryNotePdf, type DeliveryNoteForPdf } from "@/lib/pdf";
import { sendDeliveryNotePdf } from "@/lib/mailer";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const orderId = parseInt(id);
  if (!Number.isFinite(orderId))
    return NextResponse.json({ error: "잘못된 주문 ID" }, { status: 400 });

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD)
    return NextResponse.json({ error: "메일 환경변수 미설정" }, { status: 503 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      quote: {
        include: {
          items: { include: { product: { select: { partNo: true, description: true, category: true } } } },
        },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  if (order.status === "CANCELLED") return NextResponse.json({ error: "취소된 주문입니다" }, { status: 400 });
  if (order.status === "PENDING") return NextResponse.json({ error: "먼저 주문을 확정해주세요" }, { status: 400 });

  const email = order.user.email ?? order.quote.guestEmail;
  if (!email) return NextResponse.json({ error: "수신자 이메일이 없습니다" }, { status: 400 });

  const company = order.user.company ?? order.quote.guestCompany ?? "";
  const contactName = order.user.name ?? order.quote.guestName ?? "담당자";

  // 거래명세표 PDF 생성
  const data: DeliveryNoteForPdf = {
    order: { id: order.id, createdAt: order.createdAt, confirmedAt: order.confirmedAt, status: order.status },
    quote: { id: order.quote.id, taxInvoiceRequested: order.quote.taxInvoiceRequested },
    user: { name: contactName, company, email, phone: order.user.phone ?? order.quote.guestPhone ?? null, businessNo: order.user.businessNo ?? null },
    items: order.quote.items.map((it) => ({
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      product: {
        partNo: it.customPartNo ?? it.product?.partNo ?? "",
        description: it.customDescription ?? it.product?.description ?? "",
        category: it.product?.category ?? null,
      },
    })),
  };

  const pdf = await generateDeliveryNotePdf(data);
  const year = order.createdAt.getFullYear();
  const noteNo = `SMT-${year}-D-${String(order.id).padStart(6, "0")}`;

  const subtotal = order.quote.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  // 이메일 발송
  try {
    await sendDeliveryNotePdf(email, pdf as unknown as Buffer, noteNo, { company, contactName, subtotal });
  } catch (e) {
    console.error("[ship/mail]", e);
    return NextResponse.json({ error: "메일 발송 실패: " + (e instanceof Error ? e.message : "알 수 없음") }, { status: 500 });
  }

  // DB 업데이트
  const now = new Date();
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "SHIPPED",
      shippedAt: now,
      deliveryNoteIssuedAt: now,
      deliveryNoteCount: { increment: 1 },
      deliveryEmailSentAt: now,
      deliveryEmailCount: { increment: 1 },
    },
  });

  await logAudit({
    userId: admin.userId,
    action: "order.ship",
    target: "Order",
    targetId: orderId,
    payload: { noteNo, sentTo: email },
  });

  return NextResponse.json({ ok: true, noteNo, sentTo: email });
}
