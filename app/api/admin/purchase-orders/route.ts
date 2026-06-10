import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

// GET — 발주서 목록
export async function GET(_req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const orders = await prisma.manualPurchaseOrder.findMany({
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

// POST — 발주서 생성
export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const { department, toCompany, toName, toEmail, ccEmails, orderDate, requestedDate, message, memo, items } = body;

  if (!department?.trim())
    return NextResponse.json({ error: "부서를 선택해주세요." }, { status: 400 });
  if (!toCompany?.trim())
    return NextResponse.json({ error: "공급업체명을 입력해주세요." }, { status: 400 });
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json({ error: "품목을 1개 이상 추가해주세요." }, { status: 400 });

  for (const item of items) {
    if (item.unitPrice == null || isNaN(Number(item.unitPrice)))
      return NextResponse.json({ error: "모든 품목에 단가를 입력해주세요." }, { status: 400 });
  }

  const year = new Date().getFullYear();

  // 트랜잭션으로 TEMP 생성 → 실제 번호 업데이트를 원자적으로 처리
  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.manualPurchaseOrder.create({
      data: {
        orderNo: "TEMP",
        department: department.trim(),
        toCompany: toCompany.trim(),
        toName: toName?.trim() || null,
        toEmail: toEmail?.trim() || null,
        ccEmails: ccEmails?.trim() || null,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        requestedDate: requestedDate ? new Date(requestedDate) : null,
        message: message?.trim() || null,
        memo: memo?.trim() || null,
        items: {
          create: items.map((item: { partNo?: string; description?: string; quantity?: number; unitPrice: number; productId?: number; sortOrder?: number }, idx: number) => ({
            partNo: item.partNo?.trim() ?? "",
            description: item.description?.trim() ?? "",
            quantity: Number(item.quantity ?? 1),
            unitPrice: Number(item.unitPrice),
            productId: item.productId ?? null,
            sortOrder: item.sortOrder ?? idx,
          })),
        },
      },
    });
    const finalOrderNo = `SMT-${year}-P-${String(order.id).padStart(6, "0")}`;
    return tx.manualPurchaseOrder.update({
      where: { id: order.id },
      data: { orderNo: finalOrderNo },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
  });

  return NextResponse.json(updated, { status: 201 });
}
