import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { matchesQuery } from "@/lib/hangul-search";

const ELIGIBLE_TIERS = ["ENDUSER", "OEM", "DEALER", "KEY_DEALER"];

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length === 0) return NextResponse.json({ items: [] });

  const candidates = await prisma.user.findMany({
    where: { tier: { in: ELIGIBLE_TIERS } },
    select: {
      id: true,
      name: true,
      company: true,
      phone: true,
      email: true,
      businessNo: true,
      tier: true,
    },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const matched = candidates.filter(
    (u) =>
      matchesQuery(u.company, q) ||
      matchesQuery(u.name, q) ||
      matchesQuery(u.phone, q) ||
      matchesQuery(u.businessNo, q)
  );

  return NextResponse.json({ items: matched.slice(0, 10) });
}
