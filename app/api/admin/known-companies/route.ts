import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { tier?: string } | undefined)?.tier === "ADMIN";
}

// GET /api/admin/known-companies — 목록 + 통계
export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const [companies, counts] = await Promise.all([
    prisma.knownCompany.findMany({
      orderBy: { companyName: "asc" },
      include: { contacts: { orderBy: { createdAt: "asc" } } },
    }),
    prisma.knownCompany.groupBy({ by: ["tier"], _count: { tier: true } }),
  ]);

  const stats: Record<string, number> = { DEALER: 0, OEM: 0, ENDUSER: 0, total: companies.length };
  for (const c of counts) {
    if (c.tier in stats) stats[c.tier] = c._count.tier;
  }

  return NextResponse.json({ companies, stats });
}

// PATCH /api/admin/known-companies?id=N — 회사 정보 수정
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const id = parseInt(new URL(req.url).searchParams.get("id") ?? "");
  if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const updated = await prisma.knownCompany.update({
    where: { id },
    data: {
      ...(body.companyName !== undefined && { companyName: body.companyName }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.tier !== undefined && { tier: body.tier }),
      ...(body.paymentTerm !== undefined && { paymentTerm: body.paymentTerm }),
      ...(body.businessNo !== undefined && { businessNo: body.businessNo || null }),
    },
  });
  return NextResponse.json({ ok: true, company: updated });
}

// DELETE /api/admin/known-companies — 전체 초기화 (재임포트 전 사용)
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    await prisma.knownCompany.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ ok: true });
  }

  // id 없으면 전체 삭제
  const { count } = await prisma.knownCompany.deleteMany();
  return NextResponse.json({ ok: true, deleted: count });
}
