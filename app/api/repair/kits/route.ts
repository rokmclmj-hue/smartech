import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { REPAIR_EXTRA_MARGIN, getRepairBaseMargin } from "@/lib/repairPricing";

// GET /api/repair/kits — 수리 키트 목록 (펌프 종류별 그룹화)
// 관리자(오프라인 수리 화면)는 원가 그대로 받아 직접 마진을 곱한다.
// 그 외(공개 /repair 페이지)는 서버에서 고객가만 계산해 보낸다 — 원가·마진 노출 방지(2026-09-24).
export async function GET() {
  const kits = await prisma.repairKit.findMany({
    where: { isActive: true },
    include: {
      parts: { orderBy: { sortOrder: "asc" } },
      extraParts: true,
    },
    orderBy: [{ pumpFamily: "asc" }, { pumpModel: "asc" }],
  });

  const session = await auth();
  const isAdmin = (session?.user as { tier?: string } | undefined)?.tier === "ADMIN";
  if (isAdmin) {
    return NextResponse.json({ kits });
  }

  const publicKits = kits.map((k) => ({
    id: k.id,
    pumpFamily: k.pumpFamily,
    pumpMaker: k.pumpMaker,
    pumpModel: k.pumpModel,
    modelGroup: k.modelGroup,
    description: k.description,
    customerPrice: k.basePrice > 0 ? Math.round(k.basePrice * getRepairBaseMargin(k.pumpModel)) : 0,
    parts: k.parts.map((p) => ({ id: p.id, name: p.name, quantity: p.quantity })),
    extraParts: k.extraParts.map((e) => ({
      id: e.id,
      category: e.category,
      name: e.name,
      customerPrice: e.price > 0 ? Math.round(e.price * REPAIR_EXTRA_MARGIN) : 0,
    })),
  }));

  return NextResponse.json({ kits: publicKits });
}
