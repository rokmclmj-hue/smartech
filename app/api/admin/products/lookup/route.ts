import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

const TIER_MULTIPLIER: Record<string, number> = {
  ENDUSER: 1.40,
  OEM: 1.25,
  DEALER: 1.20,
  KEY_DEALER: 1.15,
  VIP_DEALER: 1.10,
};

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const partNos: string[] = body?.partNos ?? [];
  const tier: string = body?.tier ?? "ENDUSER";

  if (!Array.isArray(partNos) || partNos.length === 0) {
    return NextResponse.json({ found: [], notFound: [] });
  }

  const upper = partNos.map((p) => p.trim().toUpperCase());
  const products = await prisma.product.findMany({
    where: { partNo: { in: upper } },
    select: { id: true, partNo: true, description: true, costPrice: true, stock: true },
  });

  const mult = TIER_MULTIPLIER[tier] ?? 1.40;
  const found = products.map((p) => ({
    id: p.id,
    partNo: p.partNo,
    description: p.description,
    unitPrice: Math.round(p.costPrice * mult),
    stock: p.stock,
  }));

  const foundSet = new Set(products.map((p) => p.partNo));
  const notFound = upper.filter((p) => !foundSet.has(p));

  return NextResponse.json({ found, notFound });
}
