"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import RedTape from "./RedTape";

const TIER_LABELS: Record<string, string> = {
  PENDING: "승인대기",
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
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const tier = (session?.user as { tier?: string })?.tier;
  const cartCount = useCartCount();

  // 드로어 열릴 때 스크롤 잠금
  // ※ 이 useEffect는 모든 hooks가 동일 순서로 호출되도록 early return보다 먼저 위치
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

  // 관리자 페이지에서는 자체 헤더가 따로 있어서 공통 Navbar 숨김 (로고 중복 방지)
  // ※ early return은 모든 hooks 호출 후에 배치 (Rules of Hooks 준수)
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <>
      {!isAuthPage && <RedTape />}

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 border-b hair bg-paper/90 backdrop-blur">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2.5 md:gap-3 leading-none text-ink">
            <div className="display text-[28px] md:text-[32px] tracking-[-0.045em]">
              Smartech<span style={{ color: "#c00020" }}>.</span>
            </div>
            <span className="hidden md:block w-px h-6 bg-ink/60" aria-hidden />
            <div className="hidden md:block text-[10px] mono tracking-[0.22em] dim uppercase">
              Vacuum · Since 2011
            </div>
          </Link>

          {/* 데스크탑 네비 */}
          <nav className="hidden md:flex items-center gap-8 text-[16px] font-medium">
            <Link href="/#industries" className="hover:text-edred transition-colors">산업 활용</Link>
            <Link href="/#products" className="hover:text-edred transition-colors">제품 카탈로그</Link>
            <Link href="/#solution" className="hover:text-edred transition-colors">토탈 솔루션</Link>
            <Link href="/about" className="hover:text-edred transition-colors">회사 소개</Link>
            <Link href="/#ai" className="hover:text-edred transition-colors">AI 상담</Link>
            <Link href="/blog" className="hover:text-edred transition-colors">블로그</Link>
            {tier === "ADMIN" && (
              <Link href="/admin" className="hover:text-edred transition-colors">관리자</Link>
            )}
          </nav>

          {/* 우측 영역 */}
          <div className="flex items-center gap-2">
            {session ? (
              <>
                {/* 데스크탑 전용 버튼 묶음 — wrapper로 hidden 처리해야 chip 클래스와 충돌 없음 */}
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-[11px] mono dim">
                    {(session.user as { company?: string })?.company}
                  </span>
                  <Link
                    href="/mypage"
                    className="chip !border-ink/60 hover:bg-ink hover:text-paper transition text-[11px]"
                  >
                    마이페이지
                  </Link>
                  <Link
                    href="/quote"
                    className="relative chip !border-ink/60 hover:bg-ink hover:text-paper transition text-[11px]"
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
                    className="chip !border-ink/30 text-[11px] hover:bg-ink hover:text-paper transition"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/repair" className="chip !border-ink hover:bg-ink hover:text-paper transition">
                  견적 문의 →
                </Link>
                <Link href="/auth/login" className="chip !border-edred bg-edred text-paper text-[11px] hover:bg-edred/90 transition">
                  로그인
                </Link>
              </div>
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
              <p className="text-[11px] text-dim">회원</p>
            </div>
          )}

          {/* 메인 메뉴 링크 */}
          {[
            { href: "/#industries", label: "산업 활용" },
            { href: "/#products", label: "제품 카탈로그" },
            { href: "/#solution", label: "토탈 솔루션" },
            { href: "/about", label: "회사 소개" },
            { href: "/#ai", label: "AI 상담" },
            { href: "/blog", label: "블로그" },
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
              {/* 마이페이지 */}
              <Link
                href="/mypage"
                onClick={() => setMenuOpen(false)}
                className="py-3 border-b hair text-ink hover:text-edred transition-colors min-h-[44px] flex items-center"
              >
                마이페이지
              </Link>

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
