import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

// GET — PO 번호별 "전량출고 필요" 설정 전체 조회
export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const settings = await prisma.edwardsPoGroupSetting.findMany();
  return NextResponse.json({ settings });
}

// PATCH — 특정 PO의 "전량출고 필요" 설정 저장 (없으면 생성)
export async function PATCH(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const poNumber = typeof body?.poNumber === "string" ? body.poNumber.trim() : "";
  if (!poNumber)
    return NextResponse.json({ error: "poNumber가 필요합니다" }, { status: 400 });
  if (typeof body?.requireFullShipment !== "boolean")
    return NextResponse.json({ error: "requireFullShipment가 필요합니다" }, { status: 400 });

  const updated = await prisma.edwardsPoGroupSetting.upsert({
    where: { poNumber },
    create: { poNumber, requireFullShipment: body.requireFullShipment },
    update: { requireFullShipment: body.requireFullShipment },
  });

  return NextResponse.json(updated);
}
