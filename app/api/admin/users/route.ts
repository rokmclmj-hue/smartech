import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

const VALID_TIERS = [
  "PENDING",
  "REJECTED",
  "ENDUSER",
  "OEM",
  "DEALER",
  "KEY_DEALER",
  "ADMIN",
] as const;

type Tier = (typeof VALID_TIERS)[number];

function isValidTier(value: unknown): value is Tier {
  return VALID_TIERS.includes(value as Tier);
}

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const tierParam = searchParams.get("tier") ?? undefined;
  const search = searchParams.get("search")?.trim() ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));

  // tier 필터: REJECTED는 명시적으로 요청할 때만 포함
  let tierFilter: { tier: Tier } | { tier: { not: "REJECTED" } };
  if (tierParam && tierParam !== "ALL" && isValidTier(tierParam)) {
    tierFilter = { tier: tierParam };
  } else {
    tierFilter = { tier: { not: "REJECTED" } };
  }

  // 검색 조건
  const searchFilter = search
    ? {
        OR: [
          { company: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
          { businessNo: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const where = searchFilter
    ? { AND: [tierFilter, searchFilter] }
    : tierFilter;

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
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
        rejectedAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json();
  const { userId, tier, action } = body as {
    userId?: unknown;
    tier?: unknown;
    action?: unknown;
  };

  if (typeof userId !== "number") {
    return NextResponse.json({ error: "userId는 숫자여야 합니다" }, { status: 400 });
  }

  // 거절 처리 (soft delete)
  if (action === "delete") {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { tier: "REJECTED", rejectedAt: new Date() },
      select: { id: true, tier: true },
    });

    await logAudit({
      userId: admin.userId,
      action: "user.reject",
      target: "User",
      targetId: userId,
      payload: { prevTier: existing.tier },
    });

    return NextResponse.json({ ok: true, userId: updated.id, tier: updated.tier });
  }

  // 등급 변경
  if (!isValidTier(tier)) {
    return NextResponse.json({ error: "유효하지 않은 등급입니다" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
  }

  const prevTier = existing.tier as Tier;

  // REJECTED로 변경 시 rejectedAt 기록, 그 외엔 복구
  const rejectedAt = tier === "REJECTED" ? new Date() : null;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { tier, rejectedAt },
    select: { id: true, tier: true },
  });

  // 감사 로그 action 결정
  const auditAction =
    prevTier === "PENDING" ? "user.approve" : "user.tier_change";

  await logAudit({
    userId: admin.userId,
    action: auditAction,
    target: "User",
    targetId: userId,
    payload: { from: prevTier, to: tier },
  });

  return NextResponse.json({ ok: true, userId: updated.id, tier: updated.tier });
}
