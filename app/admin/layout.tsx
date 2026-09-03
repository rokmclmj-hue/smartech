"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ToastProvider } from "@/lib/toast";
import RedTape from "@/components/RedTape";
import "./admin.css";

// group: 같은 흐름끼리 묶어 순서대로 배치 (연관 없는 메뉴는 group 없이 그대로 나열)
// badgeKey: 헤더에 대기건수 뱃지를 표시할 항목 (badgeCounts 상태와 매칭)
const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", exact: true },
  { href: "/admin/offline-repairs", label: "수리접수" },
  { href: "/admin/repairs", label: "온라인수리" },
  { href: "/admin/proxy-quotes", label: "대행견적", group: "sales" },
  { href: "/admin/quotes", label: "견적", group: "sales", badgeKey: "quotes" as const },
  { href: "/admin/orders", label: "주문", group: "sales" },
  { href: "/admin/delivery-notes", label: "거래명세표", group: "sales" },
  { href: "/admin/inventory", label: "재고", group: "inventory", badgeKey: "inventory" as const },
  { href: "/admin/purchase-orders", label: "발주서", group: "inventory" },
  { href: "/admin/edwards-orders", label: "본사발주", group: "inventory", badgeKey: "edwardsOrders" as const },
  { href: "/admin/products", label: "제품" },
  { href: "/admin/users", label: "고객" },
  { href: "/admin/companies", label: "거래처" },
  { href: "/admin/settings", label: "설정" },
  { href: "/admin/blog", label: "블로그" },
  { href: "/admin/email-inbox", label: "이메일", badgeKey: "email" as const },
  { href: "/admin/x-posts", label: "X콘텐츠", badgeKey: "xposts" as const },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/email-inbox?status=PENDING")
      .then(r => r.json())
      .then(d => setBadgeCounts((prev) => ({ ...prev, email: d.total ?? 0 })))
      .catch(() => {});
    // 발송됨(SENT) = 고객 응답 대기중인 견적 — 관리자가 팔로업해야 할 건수
    fetch("/api/admin/quotes?status=SENT&limit=1")
      .then(r => r.json())
      .then(d => setBadgeCounts((prev) => ({ ...prev, quotes: d.total ?? 0 })))
      .catch(() => {});
    // 최소재고 미달 품목 — 발주 대기함과 동일 기준(currentStock < minStock)
    fetch("/api/admin/inventory/reorder")
      .then(r => r.json())
      .then(d => setBadgeCounts((prev) => ({ ...prev, inventory: d.total ?? 0 })))
      .catch(() => {});
    fetch("/api/admin/x-posts?status=PENDING")
      .then(r => r.json())
      .then(d => setBadgeCounts((prev) => ({ ...prev, xposts: d.total ?? 0 })))
      .catch(() => {});
    // 입고완료 확인 대기중인 본사 발주 품목 — 시트에서 사라졌는데 사람이 아직 확정 안 한 건수
    fetch("/api/admin/edwards-orders?status=PENDING_CONFIRM")
      .then(r => r.json())
      .then(d => setBadgeCounts((prev) => ({ ...prev, edwardsOrders: d.total ?? 0 })))
      .catch(() => {});
  }, [pathname]);

  const tier = (session?.user as any)?.tier;

  useEffect(() => {
    if (status === "loading") return;
    if (!session || tier !== "ADMIN") {
      router.replace("/auth/login");
    }
  }, [session, status, tier, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="mono text-[11px] dim tracking-[0.12em] uppercase">— Loading</div>
      </div>
    );
  }

  if (!session || tier !== "ADMIN") return null;

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <ToastProvider>
    <div className="min-h-screen bg-paper text-ink">
      {/* 상단 빨간 띠 — 진공 압력 게이지 (홈페이지와 동일) */}
      <RedTape />

      {/* 스티키 상단 헤더 */}
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b hair">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-4 md:gap-6">
          {/* 데스크톱 네비 */}
          <nav className="hidden lg:flex flex-1 items-center justify-between mr-6">
            {NAV_ITEMS.map((item, index) => {
              const active = isActive(item);
              const prevGroup = NAV_ITEMS[index - 1]?.group;
              const groupBoundary = index > 0 && !!item.group && item.group !== prevGroup;
              const showSep = index > 0;
              const count = item.badgeKey ? badgeCounts[item.badgeKey] ?? 0 : 0;
              return (
                <div key={item.href} className="flex items-center">
                  {showSep && (
                    <span
                      className={groupBoundary ? "w-px h-5 bg-edred/30 shrink-0" : "w-px h-3.5 bg-ink/15 shrink-0"}
                      aria-hidden
                    />
                  )}
                  <Link
                    href={item.href}
                    className={`group relative px-3 py-2 transition-colors ${
                      active ? "text-ink" : "text-dim hover:text-ink"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-[16px] font-medium tracking-tight">
                      {item.label}
                      {count > 0 && (
                        <span className="mono text-[9px] font-bold bg-edred text-white px-1.5 py-px rounded-full">
                          {count}
                        </span>
                      )}
                    </span>
                    {active && (
                      <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-edred" />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* 우측 사용자 정보 + 모바일 햄버거 */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="kpi-status" />
                <div className="text-right leading-tight">
                  <div className="text-[12px] text-ink truncate max-w-[160px]">
                    {(session.user as any)?.name ?? session.user?.email}
                  </div>
                  <div className="mono text-[9px] text-edred tracking-[0.18em] uppercase">
                    ADMIN
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="mono text-[10px] tracking-[0.1em] uppercase border hair text-dim px-3 py-1.5 hover:border-ink hover:text-ink transition-colors"
              >
                로그아웃
              </button>
            </div>

            {/* 모바일 햄버거 */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 -mr-2 hover:bg-ink/5 transition-colors"
              aria-label="메뉴"
            >
              <svg
                className="w-6 h-6 text-ink"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 드롭다운 네비 */}
        {mobileOpen && (
          <nav className="lg:hidden border-t hair bg-paper">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-2">
              {NAV_ITEMS.map((item, index) => {
                const active = isActive(item);
                const prevGroup = NAV_ITEMS[index - 1]?.group;
                const groupLabel =
                  item.group && item.group !== prevGroup
                    ? item.group === "sales"
                      ? "판매 흐름 — 대행견적 → 견적 → 주문 → 거래명세표"
                      : "재고·발주 흐름 — 재고 → 발주서 → 본사발주"
                    : null;
                const count = item.badgeKey ? badgeCounts[item.badgeKey] ?? 0 : 0;
                return (
                  <div key={item.href}>
                    {groupLabel && (
                      <div className="mono text-[9px] text-edred tracking-[0.14em] uppercase pt-3 pb-1">
                        {groupLabel}
                      </div>
                    )}
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-4 py-3 border-b hair last:border-b-0 ${
                        active ? "text-ink" : "text-dim"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-[16px] font-medium tracking-tight">
                        {item.label}
                        {count > 0 && (
                          <span className="mono text-[9px] font-bold bg-edred text-white px-1.5 py-px rounded-full">
                            {count}
                          </span>
                        )}
                      </span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-edred" />
                      )}
                    </Link>
                  </div>
                );
              })}
              <div className="pt-3 pb-2 border-t hair mt-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="kpi-status" />
                    <div className="leading-tight">
                      <div className="text-[12px] text-ink">
                        {(session.user as any)?.name ?? session.user?.email}
                      </div>
                      <div className="mono text-[9px] text-edred tracking-[0.18em] uppercase">
                        ADMIN
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="mono text-[10px] tracking-[0.1em] uppercase border hair text-dim px-3 py-1.5 hover:border-ink hover:text-ink transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* 메인 콘텐츠 — 전체폭 */}
      <main className="admin-scope">{children}</main>
    </div>
    </ToastProvider>
  );
}
