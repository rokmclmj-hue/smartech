import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { syncProductStock } from "@/lib/stock";

// PATCH — 수정 (재고 수량, 숨기기/복원, 모든 필드)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "body 필요" }, { status: 400 });
  // 제품 화면과 같은 기준 — 홈페이지 재고로 그대로 넘어가므로 0 이상 정수만(코드 리뷰 10/20)
  if (body.currentStock !== undefined && !(Number.isInteger(body.currentStock) && body.currentStock >= 0))
    return NextResponse.json({ error: "재고 수량은 0 이상의 정수여야 합니다" }, { status: 400 });

  // 재고를 고치면 제품(홈페이지 재고 표시)의 같은 파트번호도 같은 숫자로 (lib/stock.ts)
  const item = await prisma.$transaction(async (tx) => {
    const updated = await tx.inventoryItem.update({
      where: { id: Number(id) },
      data: {
        ...(body.category     !== undefined && { category:     body.category }),
        ...(body.department   !== undefined && { department:   body.department }),
        ...(body.partNo       !== undefined && { partNo:       body.partNo }),
        ...(body.name         !== undefined && { name:         body.name }),
        ...(body.currentStock !== undefined && { currentStock: body.currentStock }),
        ...(body.minStock     !== undefined && { minStock:     body.minStock }),
        ...(body.orderQty     !== undefined && { orderQty:     body.orderQty }),
        ...(body.unitPrice    !== undefined && { unitPrice:    body.unitPrice }),
        ...(body.leadTime     !== undefined && { leadTime:     body.leadTime }),
        ...(body.supplier     !== undefined && { supplier:     body.supplier }),
        ...(body.memo         !== undefined && { memo:         body.memo }),
        ...(body.isActive     !== undefined && { isActive:     body.isActive }),
      },
    });
    if (body.currentStock !== undefined) await syncProductStock(tx, updated.partNo, updated.currentStock);
    return updated;
  });

  return NextResponse.json(item);
}

// DELETE — 완전 삭제 (숨긴 품목만 허용)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.inventoryItem.findUnique({ where: { id: Number(id) } });

  if (!existing)
    return NextResponse.json({ error: "품목 없음" }, { status: 404 });
  if (existing.isActive)
    return NextResponse.json({ error: "숨기기 후 삭제 가능합니다" }, { status: 409 });

  await prisma.inventoryItem.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
