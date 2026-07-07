import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

// GET — 목록 조회 (isActive 필터)
export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const showHidden = searchParams.get("hidden") === "1";

  const items = await prisma.inventoryItem.findMany({
    where: showHidden ? { isActive: false } : { isActive: true },
    orderBy: [{ department: "asc" }, { category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(items);
}

// POST — 품목 추가 (관리자 세션 또는 BLOG_UPLOAD_SECRET Bearer 키로 인증 — 일괄 임포트 스크립트용)
export async function POST(req: NextRequest) {
  const secret = process.env.BLOG_UPLOAD_SECRET;
  const auth = req.headers.get("Authorization");
  const hasValidBearer = !!secret && auth === `Bearer ${secret}`;

  if (!hasValidBearer && !(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.partNo || !body?.name || !body?.department)
    return NextResponse.json({ error: "partNo, name, department 필수" }, { status: 400 });

  const item = await prisma.inventoryItem.create({
    data: {
      category:     body.category     ?? "기타",
      department:   body.department,
      partNo:       body.partNo,
      name:         body.name,
      currentStock: body.currentStock ?? 0,
      minStock:     body.minStock     ?? 0,
      orderQty:     body.orderQty     ?? 1,
      unitPrice:    body.unitPrice    ?? 0,
      leadTime:     body.leadTime     ?? null,
      supplier:     body.supplier     ?? null,
      memo:         body.memo         ?? null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
