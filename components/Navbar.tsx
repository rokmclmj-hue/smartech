"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const TIER_LABELS: Record<string, string> = {
  PENDING: "승인대기",
  CONSUMER: "소비자",
  OEM: "OEM",
  DEALER: "딜러",
  ADMIN: "관리자",
};

/** localStorage의 견적 카트 아이템 수를 읽음 */
function useCartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function readCount() {
      try {
        const stored = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
        setCount(Array.isArray(stored) ? stored.length : 0);
      } catch {
        setCount(0);
      }
    }
    readCount();

    // storage 이벤트로 다른 탭의 변경도 반영
    window.addEventListener("storage", readCount);
    // 같은 탭 변경 감지용 커스텀 이벤트
    window.addEventListener("quoteCartUpdated", readCount);
    return () => {
      window.removeEventListener("storage", readCount);
      window.removeEventListener("quoteCartUpdated", readCount);
    };
  }, []);

  return count;
}

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const tier = (session?.user as { tier?: string })?.tier;
  const cartCount = useCartCount();

  // 드로어 열릴 때 스크롤 잠금
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {/* TOP TAPE — vacuum pressure gauge sweep */}
      <div className="red-tape relative overflow-hidden" style={{ height: 36 }}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-full flex items-center gap-2 md:gap-3 text-[10px] mono tracking-[0.18em] uppercase">
          <span className="shrink-0 text-paper/85 whitespace-nowrap">
            <span className="text-paper/55">ATM</span> · 10³ mbar
          </span>
          <span className="hidden sm:inline text-paper/25">│</span>
          <div className="relative flex-1 h-full">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-paper/20 -translate-y-1/2" />
            <div className="gauge-track-fill gauge-track-fill--light" />
            <div className="gauge-needle gauge-needle--light" />
            <div className="absolute inset-0 hidden sm:flex items-center justify-between px-1">
              <span className="bg-edred px-2 text-paper/60">LOW</span>
              <span className="bg-edred px-2 text-paper/60">MEDIUM</span>
              <span className="bg-edred px-2 text-paper/60">HIGH</span>
              <span className="bg-edred px-2 text-paper font-bold">ULTRA HIGH</span>
            </div>
          </div>
          <span className="hidden sm:inline text-paper/25">│</span>
          <span className="shrink-0 text-paper/85 whitespace-nowrap">
            <span className="text-paper/55">UHV</span> · 10⁻¹⁰ mbar
          </span>
        </div>
      </div>

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 border-b hair bg-paper/90 backdrop-blur">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2.5 md:gap-3 leading-none text-ink">
            <div className="display text-[28px] md:text-[32px] tracking-[-0.045em]">
              Smartech<span className="dot-settle" style={{ color: "#c00020" }}>.</span>
            </div>
            <span className="hidden sm:block w-px h-6 bg-ink/60" aria-hidden />
            <div className="hidden sm:block text-[10px] mono tracking-[0.22em] dim uppercase">
              Vacuum · Since 2011
            </div>
          </Link>

          {/* 데스크탑 네비 */}
          <nav className="hidden md:flex items-center gap-8 text-[16px] font-medium">
            <Link href="/#industries" className="hover:text-edred transition-colors">산업 활용</Link>
            <Link href="/#products" className="hover:text-edred transition-colors">제품 라인업</Link>
            <Link href="/#solution" className="hover:text-edred transition-colors">토탈 솔루션</Link>
            <Link href="/#about" className="hover:text-edred transition-colors">회사 소개</Link>
            <Link href="/#ai" className="hover:text-edred transition-colors">AI 상담</Link>
            {tier === "ADMIN" && (
              <Link href="/admin" className="hover:text-edred transition-colors">관리자</Link>
            )}
          </nav>

          {/* 우측 영역 */}
          <div className="flex items-center gap-2">
            {session ? (
              <>
                <span className="hidden sm:block text-[11px] mono dim">
                  {(session.user as { company?: string })?.company} ({TIER_LABELS[tier ?? ""] ?? tier})
                </span>
                {/* 견적 카트 아이콘 + 뱃지 */}
                <Link
                  href="/quote"
                  className="hidden sm:inline-flex relative chip !border-ink/60 hover:bg-ink hover:text-paper transition text-[11px]"
                  aria-label={`견적 카트 ${cartCount}개`}
                >
                  견적 카트
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-edred text-paper text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hidden sm:inline-flex chip !border-ink/30 text-[11px] hover:bg-ink hover:text-paper transition"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/#contact" className="hidden sm:inline-flex chip !border-ink hover:bg-ink hover:text-paper transition">
                  상담 신청 →
                </Link>
                <Link href="/auth/login" className="hidden sm:inline-flex chip !border-ink/30 text-[11px] hover:bg-ink hover:text-paper transition">
                  로그인
                </Link>
              </>
            )}

            {/* 모바일: 견적 카트 아이콘 (항상 표시) */}
            {session && (
              <Link
                href="/quote"
                className="md:hidden relative p-2 text-ink/70 hover:text-edred transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={`견적 카트 ${cartCount}개`}
              >
                {/* 카트 아이콘 */}
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-0.5 bg-edred text-paper text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* 햄버거 버튼 */}
            <button
              className="md:hidden ml-1 text-ink/60 hover:text-ink transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                /* X 아이콘 */
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                /* 햄버거 아이콘 */
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 5h14M3 10h14M3 15h14" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 드로어 오버레이 */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 모바일 드로어 패널 */}
      <div
        className={`md:hidden fixed top-0 right-0 z-50 h-full w-[280px] bg-paper shadow-2xl transform transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="사이트 메뉴"
      >
        {/* 드로어 헤더 */}
        <div className="flex items-center justify-between px-6 h-16 border-b hair">
          <span className="display text-lg tracking-tight">메뉴</span>
          <button
            className="text-ink/60 hover:text-ink transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMenuOpen(false)}
            aria-label="메뉴 닫기"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 드로어 내용 */}
        <nav className="flex flex-col px-6 py-4 gap-1 text-[15px]">
          {/* 로그인 상태 표시 */}
          {session && (
            <div className="mb-4 pb-4 border-b hair">
              <p className="text-[11px] mono uppercase tracking-[0.14em] text-dim mb-1">로그인 중</p>
              <p className="text-sm font-medium text-ink">
                {(session.user as { company?: string })?.company}
              </p>
              <p className="text-[11px] text-dim">
                {TIER_LABELS[tier ?? ""] ?? tier}
              </p>
            </div>
          )}

          {/* 메인 메뉴 링크 */}
          {[
            { href: "/#industries", label: "산업 활용" },
            { href: "/#products", label: "제품 라인업" },
            { href: "/#solution", label: "토탈 솔루션" },
            { href: "/#about", label: "회사 소개" },
            { href: "/#ai", label: "AI 상담" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="py-3 border-b hair text-ink hover:text-edred transition-colors min-h-[44px] flex items-center"
            >
              {label}
            </Link>
          ))}

          {/* 로그인/비로그인 분기 메뉴 */}
          {session ? (
            <>
              {/* 견적 카트 — 뱃지 포함 */}
              <Link
                href="/quote"
                onClick={() => setMenuOpen(false)}
                className="py-3 border-b hair text-ink hover:text-edred transition-colors min-h-[44px] flex items-center justify-between"
              >
                <span>견적 카트</span>
                {cartCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1 bg-edred text-paper text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {tier === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 border-b hair text-ink hover:text-edred transition-colors min-h-[44px] flex items-center"
                >
                  관리자
                </Link>
              )}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="mt-4 w-full text-left py-3 text-edred hover:text-edred/80 transition-colors text-[14px] min-h-[44px] flex items-center"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="py-3 border-b hair text-ink hover:text-edred transition-colors min-h-[44px] flex items-center"
              >
                로그인
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMenuOpen(false)}
                className="py-3 border-b hair text-ink hover:text-edred transition-colors min-h-[44px] flex items-center"
              >
                회원가입
              </Link>
              <Link
                href="/#contact"
                onClick={() => setMenuOpen(false)}
                className="mt-4 w-full text-center py-3 border border-ink/30 text-ink hover:bg-ink hover:text-paper transition-colors text-[13px] min-h-[44px] flex items-center justify-center"
              >
                상담 신청 →
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
