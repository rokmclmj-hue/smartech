import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { matchesQuery } from "@/lib/hangul-search";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ items: [] });

  const candidates = await prisma.knownCompany.findMany({
    include: { contacts: true },
    orderBy: { companyName: "asc" },
    take: 500,
  });

  const matched = candidates
    .filter((c) =>
      matchesQuery(c.companyName, q) ||
      matchesQuery(c.phone, q) ||
      matchesQuery(c.email, q) ||
      c.contacts.some((ct) => matchesQuery(ct.name, q) || matchesQuery(ct.mobile, q))
    )
    .slice(0, 10);

  return NextResponse.json({ items: matched });
}
