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

  const data: {
    supplier?: string | null;
    status?: string;
    deliveredAt?: Date | null;
    hqReceived?: boolean;
    hqReceivedAt?: Date | null;
  } = {};

  if (typeof body.supplier === "string") {
    data.supplier = body.supplier.trim() || null;
  }

  if (body.action === "toggleHqReceived") {
    // 읽고-다시-쓰기 대신 DB가 한 번에 뒤집도록 해서 빠른 연속 클릭에도 토글이 씹히지 않게 함
    const [toggled] = await prisma.$queryRaw<{ id: number }[]>`
      UPDATE "EdwardsOpenOrder"
      SET "hqReceived" = NOT "hqReceived",
          "hqReceivedAt" = CASE WHEN NOT "hqReceived" THEN now() ELSE NULL END
      WHERE id = ${orderId}
      RETURNING id
    `;
    if (!toggled)
      return NextResponse.json({ error: "존재하지 않는 품목입니다" }, { status: 404 });
    const updated = await prisma.edwardsOpenOrder.findUnique({ where: { id: orderId } });
    return NextResponse.json(updated);
  } else if (body.action === "confirmDelivered") {
    // 안전장치: "입고완료 후보(PENDING_CONFIRM)" 상태일 때만 확정 가능 — UI는 이미 이 상태에서만
    // 버튼을 보여주지만, API 자체에서도 막아야 다른 경로(중복클릭·오래된 탭 등)로 우회 못 함
    const current = await prisma.edwardsOpenOrder.findUnique({ where: { id: orderId }, select: { status: true } });
    if (!current)
      return NextResponse.json({ error: "존재하지 않는 품목입니다" }, { status: 404 });
    if (current.status !== "PENDING_CONFIRM")
      return NextResponse.json(
        { error: "입고완료 후보 상태가 아닙니다 — 시트에서 사라진 품목만 확정할 수 있습니다" },
        { status: 400 }
      );
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
