import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  const tier = (session?.user as any)?.tier;
  if (tier !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const tierFilter = searchParams.get("tier");

  const where: Record<string, unknown> = {};
  if (tierFilter) where.tier = tierFilter;

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      company: true,
      tier: true,
      createdAt: true,
      phone: true,
      businessNo: true,
      businessFileUrl: true,
      cardImageUrl: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  const { userId, tier, action } = await req.json();

  const validTiers = ["PENDING", "CONSUMER", "OEM", "DEALER", "KEY_DEALER", "ENDUSER", "ADMIN"];

  if (action === "delete") {
    // 거절 처리: 계정 삭제
    if (!userId) return NextResponse.json({ error: "userId 필요" }, { status: 400 });
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true, action: "deleted" });
  }

  if (!validTiers.includes(tier)) {
    return NextResponse.json({ error: "유효하지 않은 등급" }, { status: 400 });
  }
  const user = await prisma.user.update({ where: { id: userId }, data: { tier } });
  return NextResponse.json({ ok: true, tier: user.tier });
}
