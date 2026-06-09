"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ToastProvider } from "@/lib/toast";
import RedTape from "@/components/RedTape";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", num: "01", exact: true },
  { href: "/admin/repairs", label: "수리접수", num: "02", highlight: true },
  { href: "/admin/orders", label: "주문", num: "03" },
  { href: "/admin/products", label: "제품", num: "04" },
  { href: "/admin/quotes", label: "견적", num: "05" },
  { href: "/admin/users", label: "고객", num: "06" },
  { href: "/admin/proxy-quotes", label: "대행견적서", num: "07" },
  { href: "/admin/companies", label: "거래처", num: "08" },
  { href: "/admin/settings", label: "설정", num: "09" },
  { href: "/admin/blog", label: "블로그", num: "10" },
  { href: "/admin/email-inbox", label: "이메일수신함", num: "11" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          {/* 로고 — 홈페이지와 동일 사양 (28/32px, 빨간 점, 세로선 + 부제) */}
          <Link href="/admin" className="flex items-center gap-2.5 md:gap-3 leading-none text-ink shrink-0">
            <div className="display text-[28px] md:text-[32px] tracking-[-0.045em]">
              Smartech<span style={{ color: "#c00020" }}>.</span>
            </div>
            <span className="hidden sm:block w-px h-6 bg-ink/60" aria-hidden />
            <div className="hidden sm:block text-[10px] mono tracking-[0.22em] dim uppercase">
              Admin
            </div>
          </Link>

          {/* 데스크톱 네비 */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative ml-2 px-3 py-1.5 rounded-md transition-all ${
                      active
                        ? "bg-edred text-white shadow-sm"
                        : "bg-edred text-white hover:brightness-110 shadow-sm"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="mono text-[10px] tracking-[0.1em] text-white/80">
                        {item.num}
                      </span>
                      <span className="text-[14px] font-semibold tracking-tight">
                        {item.label}
                      </span>
                      <span className="mono text-[9px] font-bold tracking-[0.15em] bg-white text-edred px-1.5 py-[2px] rounded">
                        NEW
                      </span>
                    </span>
                  </Link>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative px-4 py-2 transition-colors ${
                    active ? "text-ink" : "text-dim hover:text-ink"
                  }`}
                >
                  <span className="flex items-baseline gap-1.5">
                    <span
                      className={`mono text-[10px] tracking-[0.1em] ${
                        active ? "text-edred" : "dim group-hover:text-edred"
                      }`}
                    >
                      {item.num}
                    </span>
                    <span className="text-[14px] font-medium tracking-tight">
                      {item.label}
                    </span>
                  </span>
                  {active && (
                    <span className="absolute left-4 right-4 -bottom-px h-0.5 bg-edred" />
                  )}
                </Link>
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
              {NAV_ITEMS.map((item) => {
                const active = isActive(item);
                if (item.highlight) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 my-2 px-3 py-3 rounded-md bg-edred text-white shadow-sm"
                    >
                      <span className="mono text-[10px] tracking-[0.1em] text-white/80">
                        {item.num}
                      </span>
                      <span className="text-[14px] font-semibold tracking-tight">
                        {item.label}
                      </span>
                      <span className="ml-auto mono text-[9px] font-bold tracking-[0.15em] bg-white text-edred px-1.5 py-[2px] rounded">
                        NEW
                      </span>
                    </Link>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 py-3 border-b hair last:border-b-0 ${
                      active ? "text-ink" : "text-dim"
                    }`}
                  >
                    <span
                      className={`mono text-[10px] tracking-[0.1em] ${
                        active ? "text-edred" : "dim"
                      }`}
                    >
                      {item.num}
                    </span>
                    <span className="text-[14px] font-medium tracking-tight">
                      {item.label}
                    </span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-edred" />
                    )}
                  </Link>
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
      <main>{children}</main>
    </div>
    </ToastProvider>
  );
}
