import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

// PATCH — 발주업체 수정 / 입고완료 확정 / 확정 되돌리기
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId))
    return NextResponse.json({ error: "잘못된 id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "요청 본문이 없습니다" }, { status: 400 });

  const data: { supplier?: string | null; status?: string; deliveredAt?: Date | null } = {};

  if (typeof body.supplier === "string") {
    data.supplier = body.supplier.trim() || null;
  }

  if (body.action === "confirmDelivered") {
    data.status = "DELIVERED";
    data.deliveredAt = new Date();
  } else if (body.action === "reopen") {
    // 확정 실수로 눌렀을 때 되돌리기 — OPEN으로 복귀
    data.status = "OPEN";
    data.deliveredAt = null;
  }

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: "변경할 내용이 없습니다" }, { status: 400 });

  const updated = await prisma.edwardsOpenOrder.update({
    where: { id: orderId },
    data,
  });

  return NextResponse.json(updated);
}
