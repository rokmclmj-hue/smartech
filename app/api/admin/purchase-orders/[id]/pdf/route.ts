import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { generateManualPurchaseOrderPdf } from "@/lib/pdf";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const order = await prisma.manualPurchaseOrder.findUnique({
    where: { id: parseInt(id) },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!order) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  const pdf = await generateManualPurchaseOrderPdf({
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
