import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { generateManualPurchaseOrderPdf } from "@/lib/pdf";
import { sendManualPurchaseOrder } from "@/lib/mailer";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const order = await prisma.manualPurchaseOrder.findUnique({
    where: { id: parseInt(id) },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!order) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  const toEmail = body.toEmail ?? order.toEmail;
  if (!toEmail?.trim())
    return NextResponse.json({ error: "수신 이메일을 입력해주세요." }, { status: 400 });

  const ccList = (body.ccEmails ?? order.ccEmails ?? "")
    .split(",")
    .map((e: string) => e.trim())
    .filter(Boolean);

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

  await sendManualPurchaseOrder({
    to: toEmail.trim(),
    cc: ccList.length > 0 ? ccList : undefined,
    pdfBuffer: pdf,
    orderNo: order.orderNo,
    toCompany: order.toCompany,
    bodyText: body.bodyText ?? undefined,
  });

  await prisma.manualPurchaseOrder.update({
    where: { id: order.id },
    data: { status: "SENT", sentAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
