import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { generateManualPurchaseOrderPdf } from "@/lib/pdf";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const nId = parseInt(id);
  if (isNaN(nId)) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });

  const order = await prisma.manualPurchaseOrder.findUnique({
    where: { id: nId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!order) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  let pdf: Buffer;
  try {
    pdf = await generateManualPurchaseOrderPdf({
      orderNo: order.orderNo,
      department: order.department,
      orderDate: order.orderDate,
      requestedDate: order.requestedDate,
      toCompany: order.toCompany,
      toName: order.toName,
      message: order.message,
      items: order.items.map((i) => ({
        partNo: i.partNo,
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    });
  } catch (e) {
    console.error("[purchase-order pdf] 생성 실패:", e);
    const msg = e instanceof Error
      ? `${e.message}\n\n${e.stack ?? ""}`
      : String(e);
    return new Response(`[발주서 PDF 오류]\n\n${msg}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const preview = req.nextUrl.searchParams.get("preview") === "1";
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": preview
        ? `inline; filename="발주서_${order.orderNo}.pdf"`
        : `attachment; filename="발주서_${order.orderNo}.pdf"`,
    },
  });
}
