import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const rules = await prisma.priceRule.findMany();
  return NextResponse.json(rules);
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body: unknown = await req.json();
  const { tier, multiplier } = body as { tier: unknown; multiplier: unknown };

  // 검증: tier
  if (!tier || typeof tier !== "string" || tier.trim() === "") {
    return NextResponse.json({ error: "tier가 비어있습니다" }, { status: 400 });
  }

  // 검증: multiplier
  if (typeof multiplier !== "number" || isNaN(multiplier)) {
    return NextResponse.json({ error: "multiplier가 유효한 숫자여야 합니다" }, { status: 400 });
  }

  if (multiplier < 0.5 || multiplier > 10) {
    return NextResponse.json({ error: "마진율은 0.5~10 사이여야 합니다" }, { status: 400 });
  }

  // 변경 전 값 조회
  const existing = await prisma.priceRule.findUnique({ where: { tier } });
  const prevMultiplier = existing?.multiplier ?? null;

  // upsert
  const rule = await prisma.priceRule.upsert({
    where: { tier },
    update: { multiplier },
    create: { tier, multiplier },
  });

  // 감사 로그
  await logAudit({
    userId: session.userId,
    action: "price_rule.update",
    target: "PriceRule",
    targetId: null,
    payload: { tier, before: prevMultiplier, after: multiplier },
  });

  return NextResponse.json({ ok: true, tier: rule.tier, multiplier: rule.multiplier });
}
