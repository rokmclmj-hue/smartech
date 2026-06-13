import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

// GET — 발주 필요 품목 조회 (currentStock < minStock)
export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const items = await prisma.inventoryItem.findMany({
    where: { isActive: true },
    orderBy: [{ department: "asc" }, { category: "asc" }],
  });

  const lowStock = items.filter((i) => i.currentStock < i.minStock);

  const sv = lowStock.filter((i) => i.department === "SV");
  const ak = lowStock.filter((i) => i.department === "AK");

  return NextResponse.json({ sv, ak, total: lowStock.length });
}

// POST — 부서별 발주서 초안 생성
export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const dept = body?.department as "SV" | "AK" | undefined;
  if (!dept || !["SV", "AK"].includes(dept))
    return NextResponse.json({ error: "department(SV|AK) 필수" }, { status: 400 });

  // 발주 필요 품목 조회
  const items = await prisma.inventoryItem.findMany({
    where: { isActive: true, department: dept },
  });
  const lowStock = items.filter((i) => i.currentStock < i.minStock);

  if (lowStock.length === 0)
    return NextResponse.json({ error: "발주 필요 품목 없음" }, { status: 400 });

  // 부서 담당자 조회
  const contact = await prisma.departmentContact.findUnique({ where: { code: dept } });

  const DEPT_COMPANIES: Record<string, string> = {
    SV: "에드워드코리아SV",
    AK: "에드워드코리아AK",
  };

  // 발주서 번호: 트랜잭션으로 생성
  const order = await prisma.$transaction(async (tx) => {
    const po = await tx.manualPurchaseOrder.create({
      data: {
        orderNo:       "TEMP",
        status:        "DRAFT",
        department:    dept,
        toCompany:     DEPT_COMPANIES[dept] ?? dept,
        toName:        contact?.contactName  ?? "",
        toEmail:       contact?.contactEmail ?? "",
        ccEmails:      contact?.ccEmails     ?? null,
        message:       contact?.defaultMessage ?? null,
        items: {
          create: lowStock.map((item, idx) => ({
            partNo:      item.partNo,
            description: item.name,
            quantity:    item.orderQty,
            unitPrice:   item.unitPrice,
            sortOrder:   idx,
          })),
        },
      },
    });
    const year = new Date().getFullYear();
    const orderNo = `SMT-${year}-P-${String(po.id).padStart(6, "0")}`;
    return tx.manualPurchaseOrder.update({
      where: { id: po.id },
      data: { orderNo },
      include: { items: true },
    });
  });

  return NextResponse.json({ ok: true, order });
}
