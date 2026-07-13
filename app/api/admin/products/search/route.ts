import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { matchesQuery } from "@/lib/hangul-search";
import { getMultiplier } from "@/lib/pricing";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const tier = searchParams.get("tier") ?? "ENDUSER";
  if (q.length === 0) return NextResponse.json({ items: [] });

  const candidates = await prisma.product.findMany({
    select: {
      id: true,
      partNo: true,
      description: true,
      category: true,
      stock: true,
      imageUrl: true,
      costPrice: true,
    },
    orderBy: { partNo: "asc" },
    take: 1000,
  });

  const matched = candidates.filter(
    (p) => matchesQuery(p.partNo, q) || matchesQuery(p.description, q)
  );

  const multiplier = await getMultiplier(tier);

  const items = matched.slice(0, 30).map((p) => ({
    id: p.id,
    partNo: p.partNo,
    description: p.description,
    category: p.category,
    stock: p.stock,
    imageUrl: p.imageUrl,
    costPrice: p.costPrice,
    unitPrice: Math.round(p.costPrice * multiplier),
  }));

  return NextResponse.json({ items });
}
