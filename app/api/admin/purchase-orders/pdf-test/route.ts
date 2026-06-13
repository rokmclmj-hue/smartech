import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { generateManualPurchaseOrderPdf } from "@/lib/pdf";
import path from "path";
import fs from "fs";

export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const results: Record<string, unknown> = {
    cwd: process.cwd(),
    nodeVersion: process.version,
    platform: process.platform,
  };

  // 폰트 파일 존재 확인
  const fontR = path.join(process.cwd(), "public", "fonts", "Pretendard-Regular.ttf");
  const fontB = path.join(process.cwd(), "public", "fonts", "Pretendard-Bold.ttf");
  results.fontRegularExists = fs.existsSync(fontR);
  results.fontBoldExists = fs.existsSync(fontB);
  results.fontRegularPath = fontR;

  // 가장 최근 발주서로 PDF 생성 테스트
  try {
    const order = await prisma.manualPurchaseOrder.findFirst({
      orderBy: { id: "desc" },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    if (!order) {
      results.pdfTest = "no orders found";
    } else {
      results.orderId = order.id;
      results.orderNo = order.orderNo;
      results.itemCount = order.items.length;

      try {
        const buf = await generateManualPurchaseOrderPdf({
          orderNo: order.orderNo,
          department: order.department,
          orderDate: order.orderDate,
          requestedDate: order.requestedDate,
          toCompany: order.toCompany,
          toName: order.toName,
          message: order.message,
          items: order.items.map(i => ({
            partNo: i.partNo,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        });
        results.pdfTest = "SUCCESS";
        results.pdfBytes = buf.length;
      } catch (e) {
        results.pdfTest = "FAILED";
        results.pdfError = e instanceof Error
          ? { name: e.name, message: e.message, stack: e.stack }
          : String(e);
      }
    }
  } catch (e) {
    results.dbError = e instanceof Error
      ? { name: e.name, message: e.message }
      : String(e);
  }

  return NextResponse.json(results, { status: 200 });
}
