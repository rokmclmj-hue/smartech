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
  const partNosParam = searchParams.get("partNos");

  const where: any = {};
  if (partNosParam) {
    const partNos = partNosParam.split(",").map((s) => s.trim()).filter(Boolean);
    if (partNos.length > 0) where.partNo = { in: partNos };
  }
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
  // 홈 견적 문의 "지금 바로 출고 가능" 줄 (2026-10-19)
  if (searchParams.get("inStock") === "true") where.stock = { gt: 0 };

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

  // 원가·공급처 등 내부 정보는 관리자에게만 보낸다 (발주서 이력불러오기가 costPrice 사용).
  // 공개 응답에 ...p를 그대로 내보내 비로그인 방문자에게도 원가가 노출되던 문제 수정 — 2026-09-24.
  const isAdmin = tier === "ADMIN";
  // 딜러 회원 견적서의 "일반 공급가 → 우대 가격" 비교용: 일반(ENDUSER) 판매가를 DB 배율로 계산해 함께 보낸다.
  // 견적서 화면에 옛 고정 배율(1.40)이 박혀 할인액이 틀리던 문제(코드 리뷰 10/20). 딜러에게만, 원가는 보내지 않는다.
  const isDealer = ["DEALER", "KEY_DEALER", "VIP_DEALER"].includes(tier);
  const listMultiplier = isDealer ? await getMultiplier("ENDUSER") : null;
  const result = products.map((p) => {
    const { costPrice, supplierName, department, minStock, orderQty, ...publicFields } = p;
    const displayPrice = showPrice && multiplier ? Math.round(costPrice * multiplier) : null;
    const priceStatus = !showPrice ? "pending" : "visible";
    const listPrice = listMultiplier ? Math.round(costPrice * listMultiplier) : undefined;
    return isAdmin
      ? { ...publicFields, costPrice, supplierName, department, minStock, orderQty, displayPrice, priceStatus }
      : { ...publicFields, displayPrice, priceStatus, ...(listPrice !== undefined && { listPrice }) };
  });

  return NextResponse.json({ products: result, total, page, limit });
}
