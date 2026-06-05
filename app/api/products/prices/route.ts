import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const TIER_MULTIPLIER: Record<string, number> = {
  ENDUSER: 1.40,
  OEM: 1.25,
  DEALER: 1.20,
  KEY_DEALER: 1.15,
  VIP_DEALER: 1.10,
  ADMIN: 1.00,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const tier = (session.user as any).tier as string;
  if (tier === "PENDING") {
    return NextResponse.json({ error: "승인 대기 중입니다" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const productIds: number[] = Array.isArray(body.productIds) ? body.productIds : [];

  if (productIds.length === 0) return NextResponse.json({ prices: {} });

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, costPrice: true },
  });

  const multiplier = TIER_MULTIPLIER[tier] ?? 1.40;
  const prices: Record<number, number> = {};
  for (const p of products) {
    prices[p.id] = Math.round(p.costPrice * multiplier);
  }

  return NextResponse.json({ prices, tier });
}
