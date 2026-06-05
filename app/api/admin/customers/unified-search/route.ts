import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { matchesQuery } from "@/lib/hangul-search";

const ELIGIBLE_TIERS = ["ENDUSER", "OEM", "DEALER", "KEY_DEALER", "VIP_DEALER"];

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ items: [] });

  // 1. 홈페이지 등록 회원
  const users = await prisma.user.findMany({
    where: { tier: { in: ELIGIBLE_TIERS } },
    select: { id: true, name: true, company: true, phone: true, email: true, tier: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const matchedUsers = users
    .filter((u) =>
      matchesQuery(u.company, q) || matchesQuery(u.name, q) ||
      matchesQuery(u.phone, q)
    )
    .slice(0, 5)
    .map((u) => ({
      source: "user" as const,
      id: u.id,
      company: u.company,
      name: u.name,
      phone: u.phone ?? "",
      email: u.email ?? "",
      tier: u.tier,
      contacts: [] as { name: string; title: string | null; mobile: string | null; email: string | null }[],
    }));

  // 2. 거래처 마스터 (KnownCompany)
  const companies = await prisma.knownCompany.findMany({
    include: { contacts: { take: 5 } },
    take: 500,
  });
  const matchedCompanies = companies
    .filter((c) =>
      matchesQuery(c.companyName, q) || matchesQuery(c.phone, q) ||
      matchesQuery(c.email, q) ||
      c.contacts.some((ct) => matchesQuery(ct.name, q) || matchesQuery(ct.mobile, q))
    )
    .slice(0, 5)
    .map((c) => ({
      source: "known" as const,
      id: c.id,
      company: c.companyName,
      name: c.contacts[0]?.name ?? "",
      phone: c.contacts[0]?.mobile ?? c.contacts[0]?.tel ?? c.phone ?? "",
      email: c.contacts[0]?.email ?? c.email ?? "",
      tier: c.tier,
      contacts: c.contacts.map((ct) => ({
        name: ct.name, title: ct.title,
        mobile: ct.mobile, email: ct.email,
      })),
    }));

  // 회원 먼저, 거래처 다음 (회원 우선순위)
  const items = [...matchedUsers, ...matchedCompanies].slice(0, 10);
  return NextResponse.json({ items });
}
