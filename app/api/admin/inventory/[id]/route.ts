import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

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

  const item = await prisma.inventoryItem.update({
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
