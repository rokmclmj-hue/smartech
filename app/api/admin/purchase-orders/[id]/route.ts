import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

// GET — 단건 조회
export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const order = await prisma.manualPurchaseOrder.findUnique({
    where: { id: parseInt(id) },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!order) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });
  return NextResponse.json(order);
}

// PATCH — 상태 변경
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const updated = await prisma.manualPurchaseOrder.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.sentAt !== undefined && { sentAt: body.sentAt }),
    },
  });
  return NextResponse.json({ ok: true, order: updated });
}

// DELETE — 삭제
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  await prisma.manualPurchaseOrder.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
