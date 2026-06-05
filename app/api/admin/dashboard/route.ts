import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as any)?.tier === "ADMIN";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  async function fetchAll() {
    return Promise.all([
      // 오늘 견적 요청 건수
      prisma.quote.count({
        where: { createdAt: { gte: todayStart } },
      }),

      // 이번 달 견적 요청 건수
      prisma.quote.count({
        where: { createdAt: { gte: monthStart } },
      }),

      // 이번 달 주문 확정 건수
      prisma.order.count({
        where: {
          status: "CONFIRMED",
          confirmedAt: { gte: monthStart },
        },
      }),

      // 이번 달 총 매출 (확정 주문의 견적 금액 합계)
      prisma.order.findMany({
        where: {
          status: "CONFIRMED",
          confirmedAt: { gte: monthStart },
        },
        include: { quote: { select: { totalAmount: true, items: { select: { unitPrice: true, quantity: true } } } } },
      }),

      // 승인 대기 회원 수
      prisma.user.count({ where: { tier: "PENDING" } }),

      // 미처리 견적 — 등록 고객의 견적 중 3일 이상 지났으나 주문으로 이어지지 않은 것
      // (대행견적/proxy는 온라인 주문 확정 없이 전화·메일로 처리되므로 제외)
      prisma.quote.count({
        where: {
          createdAt: { lte: threeDaysAgo },
          order: { is: null },
          userId: { not: null },      // 등록 고객 견적만
          createdByAdminId: null,     // 관리자 대행 견적 제외
        },
      }),

      // 최근 주문 5건
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { company: true } },
          quote: { select: { totalAmount: true, items: { select: { unitPrice: true, quantity: true } } } },
        },
      }),

      // 재고 부족 제품 (stock < 5)
      prisma.product.findMany({
        where: { stock: { lt: 5 } },
        select: { id: true, partNo: true, description: true, stock: true },
        orderBy: { stock: "asc" },
        take: 20,
      }),

      // 오늘 로그인한 업체
      prisma.user.findMany({
        where: {
          lastLoginAt: { gte: todayStart },
          tier: { notIn: ["ADMIN", "PENDING"] },
        },
        select: { id: true, name: true, company: true, tier: true, phone: true, lastLoginAt: true, loginCount: true },
        orderBy: { lastLoginAt: "desc" },
      }),

      // 이번 주 로그인한 업체 (7일)
      prisma.user.findMany({
        where: {
          lastLoginAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
          tier: { notIn: ["ADMIN", "PENDING"] },
        },
        select: { id: true, name: true, company: true, tier: true, phone: true, lastLoginAt: true, loginCount: true },
        orderBy: { lastLoginAt: "desc" },
        take: 50,
      }),

      // 이번 달 로그인한 업체
      prisma.user.findMany({
        where: {
          lastLoginAt: { gte: monthStart },
          tier: { notIn: ["ADMIN", "PENDING"] },
        },
        select: { id: true, name: true, company: true, tier: true, phone: true, lastLoginAt: true, loginCount: true },
        orderBy: { lastLoginAt: "desc" },
        take: 100,
      }),
    ]);
  }

  // Neon DB 콜드 스타트(잠든 DB 깨어나는 시간) 대응: 연결 실패 시 1회 재시도
  let results;
  try {
    results = await fetchAll();
  } catch (e: any) {
    if (e?.code === "P1001") {
      await new Promise((r) => setTimeout(r, 800));
      results = await fetchAll();
    } else {
      throw e;
    }
  }

  const [
    todayQuotes,
    monthQuotes,
    monthOrders,
    monthRevenue,
    pendingUsers,
    staleQuotes,
    recentOrders,
    lowStockProducts,
    todayVisitors,
    weekVisitors,
    monthVisitors,
  ] = results;

  // 매출 계산
  const revenueTotal = monthRevenue.reduce((sum, order) => {
    if (order.quote.totalAmount) return sum + order.quote.totalAmount;
    const itemTotal = order.quote.items.reduce(
      (s, item) => s + item.unitPrice * item.quantity,
      0
    );
    return sum + itemTotal;
  }, 0);

  // 최근 주문 포맷
  const formattedOrders = recentOrders.map((o) => {
    const amount = o.quote.totalAmount
      ? o.quote.totalAmount
      : o.quote.items.reduce((s, item) => s + item.unitPrice * item.quantity, 0);
    return {
      id: o.id,
      company: o.user.company,
      contactName: o.contactName,
      amount,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    };
  });

  const TIER_LABEL: Record<string, string> = {
    ENDUSER: "일반", OEM: "OEM", DEALER: "딜러",
    KEY_DEALER: "키딜러", VIP_DEALER: "VIP딜러",
  };

  return NextResponse.json({
    todayQuotes,
    monthQuotes,
    monthOrders,
    monthRevenue: revenueTotal,
    pendingUsers,
    staleQuotes,
    recentOrders: formattedOrders,
    lowStockProducts,
    todayVisitors: todayVisitors.map((u) => ({
      id: u.id, name: u.name, company: u.company, phone: u.phone ?? null,
      tier: u.tier, tierLabel: TIER_LABEL[u.tier] ?? u.tier,
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      loginCount: u.loginCount,
    })),
    weekVisitors: weekVisitors.map((u) => ({
      id: u.id, name: u.name, company: u.company, phone: u.phone ?? null,
      tier: u.tier, tierLabel: TIER_LABEL[u.tier] ?? u.tier,
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      loginCount: u.loginCount,
    })),
    monthVisitors: monthVisitors.map((u) => ({
      id: u.id, name: u.name, company: u.company, phone: u.phone ?? null,
      tier: u.tier, tierLabel: TIER_LABEL[u.tier] ?? u.tier,
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      loginCount: u.loginCount,
    })),
  });
}
