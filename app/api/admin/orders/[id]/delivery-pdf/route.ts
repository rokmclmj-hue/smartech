import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { generateDeliveryNotePdf, type DeliveryNoteForPdf } from "@/lib/pdf";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { id } = await params;
  const orderId = parseInt(id);
  if (!Number.isFinite(orderId)) {
    return NextResponse.json({ error: "잘못된 주문 ID" }, { status: 400 });
  }

  const preview = req.nextUrl.searchParams.get("preview") === "1";

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      quote: {
        include: { items: { include: { product: true } } },
      },
      user: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  }

  if (order.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "확정된 주문만 거래명세표를 발행할 수 있습니다" },
      { status: 400 }
    );
  }

  if (order.quote.items.length === 0) {
    return NextResponse.json({ error: "품목이 없는 주문입니다" }, { status: 400 });
  }

  try {
    const data: DeliveryNoteForPdf = {
      order: {
        id: order.id,
        createdAt: order.createdAt,
        confirmedAt: order.confirmedAt,
        status: order.status,
      },
      quote: {
        id: order.quote.id,
        taxInvoiceRequested: order.quote.taxInvoiceRequested,
      },
      user: {
        name: order.user.name,
        company: order.user.company,
        email: order.user.email,
        phone: order.user.phone,
        businessNo: order.user.businessNo,
      },
      items: order.quote.items.map((it) => ({
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        product: {
          partNo: it.product.partNo,
          description: it.product.description,
          category: it.product.category,
        },
      })),
    };

    const pdf = await generateDeliveryNotePdf(data);
    const year = order.createdAt.getFullYear();
    const seq = String(order.id).padStart(6, "0");
    const noteNo = `SMT-${year}-D-${seq}`;

    if (!preview) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          deliveryNoteIssuedAt: new Date(),
          deliveryNoteCount: { increment: 1 },
        },
      });

      await logAudit({
        userId: admin.userId,
        action: "order.delivery_pdf",
        target: "Order",
        targetId: orderId,
        payload: { noteNo, count: order.deliveryNoteCount + 1 },
      });
    }

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${preview ? "inline" : "attachment"}; filename="delivery_note_${noteNo}.pdf"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("[delivery-pdf]", e);
    return NextResponse.json(
      { error: "PDF 생성 실패: " + (e instanceof Error ? e.message : "알 수 없는 오류") },
      { status: 500 }
    );
  }
}
