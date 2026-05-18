import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as any)?.tier === "ADMIN";
}

// GET /api/admin/known-companies — 목록 + 통계
export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const [companies, counts] = await Promise.all([
    prisma.knownCompany.findMany({ orderBy: { companyName: "asc" } }),
    prisma.knownCompany.groupBy({ by: ["tier"], _count: { tier: true } }),
  ]);

  const stats = { DEALER: 0, OEM: 0, ENDUSER: 0, total: companies.length };
  for (const c of counts) {
    if (c.tier in stats) (stats as any)[c.tier] = c._count.tier;
  }

  return NextResponse.json({ companies, stats });
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
