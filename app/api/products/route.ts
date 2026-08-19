import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getMultiplier } from "@/lib/pricing";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const importantOnly = searchParams.get("important") === "true";
  const diverse = searchParams.get("diverse") === "true";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "24"), 2000);

  const idsParam = searchParams.get("ids");

  const where: any = {};
  if (idsParam) {
    const ids = idsParam.split(",").map(Number).filter((n) => !isNaN(n) && n > 0);
    if (ids.length > 0) where.id = { in: ids };
  }
  if (q) {
    // 공백·하이픈·슬래시를 제거한 정규화 버전도 함께 검색
    // 예: "AIM200 S NW25" → "AIM200-S-NW25" 도 찾음, "tstation" → "T-Station" 도 찾음
    const normalize = (s: string) => s.replace(/[\s\-\/]/g, "").toLowerCase();
    const qNorm = normalize(q);
    const qHyphen = q.replace(/\s+/g, "-");   // 공백 → 하이픈
    const qSpace  = q.replace(/[-\/]/g, " ");  // 하이픈/슬래시 → 공백

    const searchVariants = Array.from(new Set([q, qHyphen, qSpace, qNorm]));
    where.OR = searchVariants.flatMap((v) => [
      { partNo:      { contains: v, mode: "insensitive" as const } },
      { description: { contains: v, mode: "insensitive" as const } },
    ]);
  }
  if (category) where.category = category;
  if (importantOnly) where.isImportant = true;

  let products: any[];
  let total: number;

  if (diverse) {
    const all = await prisma.product.findMany({
      where,
      orderBy: [{ isImportant: "desc" }, { partNo: "asc" }],
    });
    const seen = new Set<string>();
    products = [];
    for (const p of all) {
      const key = p.category ?? "기타";
      if (seen.has(key)) continue;
      seen.add(key);
      products.push(p);
      if (products.length >= limit) break;
    }
    total = products.length;
  } else {
    [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isImportant: "desc" }, { partNo: "asc" }],
      }),
      prisma.product.count({ where }),
    ]);
  }

  const session = await auth();
  const tier = (session?.user as any)?.tier ?? "PUBLIC";
  const showPrice = tier !== "PENDING" && tier !== "REJECTED";
  const multiplier = showPrice ? await getMultiplier(tier) : null;

  const result = products.map((p) => ({
    ...p,
    displayPrice: showPrice && multiplier ? Math.round(p.costPrice * multiplier) : null,
    priceStatus: !showPrice ? "pending" : "visible",
  }));

  return NextResponse.json({ products: result, total, page, limit });
}
