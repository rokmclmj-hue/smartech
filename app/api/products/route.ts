import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getMultiplier } from "@/lib/pricing";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const importantOnly = searchParams.get("important") === "true";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "24");

  const where: any = {};
  if (q) {
    where.OR = [
      { partNo: { contains: q } },
      { description: { contains: q } },
    ];
  }
  if (category) where.category = category;
  if (importantOnly) where.isImportant = true;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isImportant: "desc" }, { partNo: "asc" }],
    }),
    prisma.product.count({ where }),
  ]);

  const session = await auth();
  const tier = (session?.user as any)?.tier ?? "GUEST";
  const showPrice = tier !== "GUEST" && tier !== "PENDING";
  const multiplier = showPrice ? await getMultiplier(tier) : null;

  const result = products.map((p) => ({
    ...p,
    displayPrice: showPrice && multiplier ? Math.round(p.costPrice * multiplier) : null,
    priceStatus: tier === "GUEST" ? "login" : tier === "PENDING" ? "pending" : "visible",
  }));

  return NextResponse.json({ products: result, total, page, limit });
}
