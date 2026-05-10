import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as any)?.tier === "ADMIN";
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { partNo: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { partNo: "asc" },
    select: {
      id: true,
      partNo: true,
      description: true,
      category: true,
      costPrice: true,
      stock: true,
      isImportant: true,
    },
  });

  return NextResponse.json(products);
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { productId, stock, costPrice } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId 필요" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (typeof stock === "number") data.stock = stock;
  if (typeof costPrice === "number") data.costPrice = costPrice;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "변경할 데이터 없음" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data,
  });

  return NextResponse.json({ ok: true, product });
}
