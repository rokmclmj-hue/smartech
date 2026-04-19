import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  const tier = (session?.user as any)?.tier;
  if (tier !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, company: true, tier: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  const { userId, tier } = await req.json();
  const validTiers = ["PENDING", "CONSUMER", "OEM", "DEALER", "ADMIN"];
  if (!validTiers.includes(tier)) return NextResponse.json({ error: "유효하지 않은 등급" }, { status: 400 });
  const user = await prisma.user.update({ where: { id: userId }, data: { tier } });
  return NextResponse.json({ ok: true, tier: user.tier });
}
