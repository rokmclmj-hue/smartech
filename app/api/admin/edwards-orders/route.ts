import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

// GET — 목록 조회 (status 필터: OPEN | PENDING_CONFIRM | DELIVERED, 없으면 OPEN+PENDING_CONFIRM만)
export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where = status
    ? { status }
    : { status: { in: ["OPEN", "PENDING_CONFIRM"] } };

  const items = await prisma.edwardsOpenOrder.findMany({
    where,
    orderBy: [{ currentMad: "asc" }],
  });

  return NextResponse.json({ items, total: items.length });
}
