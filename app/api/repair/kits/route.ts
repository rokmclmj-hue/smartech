import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/repair/kits — 수리 키트 목록 (펌프 종류별 그룹화)
export async function GET() {
  const kits = await prisma.repairKit.findMany({
    where: { isActive: true },
    include: {
      parts: { orderBy: { sortOrder: "asc" } },
      extraParts: true,
    },
    orderBy: [{ pumpFamily: "asc" }, { pumpModel: "asc" }],
  });

  // 펌프 계열별로 그룹화
  const grouped: Record<string, typeof kits> = {};
  for (const kit of kits) {
    if (!grouped[kit.pumpFamily]) grouped[kit.pumpFamily] = [];
    grouped[kit.pumpFamily].push(kit);
  }

  return NextResponse.json({ kits, grouped });
}
