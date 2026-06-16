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

  try {
    const pdfBuffer = await generateManualPurchaseOrderPdf({
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
    const arrayBuf = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    ) as ArrayBuffer;

    const isEdwards = ["IV", "SV", "AK"].includes(order.department);
    let pdfName: string;
    if (isEdwards && order.items.length > 0) {
      const dateStr = new Date(order.orderDate).toISOString().slice(0, 10).replace(/-/g, "");
      const first = order.items[0];
      const itemStr = `${first.description} x ${first.quantity}ea`;
      const extra = order.items.length - 1;
      const itemPart = extra > 0 ? `${itemStr} 외 ${extra}건` : itemStr;
      pdfName = `발주서_${dateStr}_에드워드${order.department}(${itemPart}).pdf`;
    } else {
      pdfName = `PO_${order.orderNo}.pdf`;
    }
    const encodedName = encodeURIComponent(pdfName);

    return new NextResponse(arrayBuf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${preview ? "inline" : "attachment"}; filename*=UTF-8''${encodedName}`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (e) {
    console.error("[purchase-order pdf] 생성 실패:", e);
    return NextResponse.json(
      { error: "PDF 생성 실패", detail: String(e) },
      { status: 500 }
    );
  }
}
