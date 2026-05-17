import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

// ─── GET: 검색 + 페이지네이션 ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const lowStock = searchParams.get("lowStock") === "1";
  const discontinued = searchParams.get("discontinued") === "1";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const rawLimit = parseInt(searchParams.get("limit") ?? "100", 10) || 100;
  const limit = Math.min(Math.max(1, rawLimit), 500);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { partNo: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (lowStock) where.stock = { lt: 5 };
  if (discontinued) where.isDiscontinued = true;

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { partNo: "asc" },
      skip,
      take: limit,
      select: {
        id: true,
        partNo: true,
        description: true,
        category: true,
        costPrice: true,
        stock: true,
        isImportant: true,
        isDiscontinued: true,
        imageUrl: true,
      },
    }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

// ─── POST: 신제품 추가 ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json();
  const { partNo, description, costPrice, category, stock } = body as {
    partNo: unknown;
    description: unknown;
    costPrice: unknown;
    category?: unknown;
    stock?: unknown;
  };

  // 필수 필드 검증
  if (!partNo || typeof partNo !== "string" || partNo.trim() === "") {
    return NextResponse.json({ error: "파트번호(partNo)는 필수입니다" }, { status: 400 });
  }
  if (!description || typeof description !== "string" || description.trim() === "") {
    return NextResponse.json({ error: "제품명(description)은 필수입니다" }, { status: 400 });
  }
  if (typeof costPrice !== "number" || isNaN(costPrice) || costPrice < 0) {
    return NextResponse.json({ error: "원가(costPrice)는 0 이상의 숫자여야 합니다" }, { status: 400 });
  }
  const stockNum = typeof stock === "number" ? stock : 0;
  if (stockNum < 0) {
    return NextResponse.json({ error: "재고(stock)는 0 이상이어야 합니다" }, { status: 400 });
  }
  const categoryStr = typeof category === "string" && category.trim() !== "" ? category.trim() : null;

  // partNo 중복 확인
  const existing = await prisma.product.findUnique({ where: { partNo: partNo.trim() } });
  if (existing) {
    return NextResponse.json(
      { error: "이미 존재하는 파트번호입니다", partNo: partNo.trim() },
      { status: 409 }
    );
  }

  const product = await prisma.product.create({
    data: {
      partNo: partNo.trim(),
      description: description.trim(),
      costPrice,
      stock: stockNum,
      ...(categoryStr !== null ? { category: categoryStr } : {}),
    },
  });

  await logAudit({
    userId: admin.userId,
    action: "product.create",
    target: "Product",
    targetId: product.id,
    payload: {
      partNo: product.partNo,
      description: product.description,
      costPrice: product.costPrice,
      category: product.category ?? null,
      stock: product.stock,
    },
  });

  return NextResponse.json(product, { status: 201 });
}

// ─── PATCH: 여러 필드 수정 ────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json();
  const { productId, stock, costPrice, description, category, partNo, isDiscontinued } = body as {
    productId: unknown;
    stock?: unknown;
    costPrice?: unknown;
    description?: unknown;
    category?: unknown;
    partNo?: unknown;
    isDiscontinued?: unknown;
  };

  if (typeof productId !== "number") {
    return NextResponse.json({ error: "productId가 필요합니다" }, { status: 400 });
  }

  // 변경할 데이터 수집 + 검증
  const data: Record<string, unknown> = {};

  if (stock !== undefined) {
    if (typeof stock !== "number" || isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: "재고(stock)는 0 이상의 숫자여야 합니다" }, { status: 400 });
    }
    data.stock = stock;
  }
  if (costPrice !== undefined) {
    if (typeof costPrice !== "number" || isNaN(costPrice) || costPrice < 0) {
      return NextResponse.json({ error: "원가(costPrice)는 0 이상의 숫자여야 합니다" }, { status: 400 });
    }
    data.costPrice = costPrice;
  }
  if (description !== undefined) {
    if (typeof description !== "string" || description.trim() === "") {
      return NextResponse.json({ error: "제품명(description)은 비워둘 수 없습니다" }, { status: 400 });
    }
    data.description = description.trim();
  }
  if (category !== undefined) {
    data.category = category === null || category === "" ? null : String(category).trim();
  }
  if (partNo !== undefined) {
    if (typeof partNo !== "string" || partNo.trim() === "") {
      return NextResponse.json({ error: "파트번호(partNo)는 비워둘 수 없습니다" }, { status: 400 });
    }
    data.partNo = partNo.trim();
  }
  if (isDiscontinued !== undefined) {
    if (typeof isDiscontinued !== "boolean") {
      return NextResponse.json({ error: "isDiscontinued는 true/false여야 합니다" }, { status: 400 });
    }
    data.isDiscontinued = isDiscontinued;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "변경할 데이터가 없습니다" }, { status: 400 });
  }

  // partNo 변경 시 중복 확인
  if (data.partNo !== undefined) {
    const dup = await prisma.product.findFirst({
      where: { partNo: data.partNo as string, NOT: { id: productId } },
    });
    if (dup) {
      return NextResponse.json(
        { error: "이미 존재하는 파트번호입니다", partNo: data.partNo },
        { status: 409 }
      );
    }
  }

  // 변경 전 값 조회
  const before = await prisma.product.findUnique({ where: { id: productId } });
  if (!before) {
    return NextResponse.json({ error: "존재하지 않는 제품입니다" }, { status: 404 });
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data,
  });

  // audit: 변경 전/후 스냅샷 (변경된 필드만)
  const beforeSnap: Record<string, unknown> = {};
  const afterSnap: Record<string, unknown> = {};
  for (const key of Object.keys(data)) {
    beforeSnap[key] = (before as Record<string, unknown>)[key] ?? null;
    afterSnap[key] = (updated as Record<string, unknown>)[key] ?? null;
  }

  // stock만 변경됐으면 stock_change, 그 외는 update
  const changedKeys = Object.keys(data);
  const isStockOnly = changedKeys.length === 1 && changedKeys[0] === "stock";

  await logAudit({
    userId: admin.userId,
    action: isStockOnly ? "product.stock_change" : "product.update",
    target: "Product",
    targetId: productId,
    payload: { before: beforeSnap, after: afterSnap },
  });

  return NextResponse.json({ ok: true, productId, ...updated });
}
