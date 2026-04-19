"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const TAPE_ITEMS = [
  "● OFFICIAL DISTRIBUTOR — EDWARDS VACUUM KR",
  "│",
  "2006 — SINCE HQ EDWARDS VACUUM",
  "│",
  "40만 대+ GLOBAL RV PUMP SHIPPED",
  "│",
  "10⁻¹⁰ mbar STP MAGLEV",
  "│",
  "RV · E2M · GXS · EXS · nXDS · STP · nEXT",
  "│",
  "서울 · 화성 · 평택 · 이천 · 청주 · 울산",
  "│",
];

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const tier = (session?.user as any)?.tier;

  return (
    <>
      {/* TOP TAPE */}
      <div className="red-tape text-[11px] mono tracking-wider">
        <div className="mrqw">
          <div className="marquee-track inline-flex gap-12 py-2.5 whitespace-nowrap will-change-transform">
            {[...TAPE_ITEMS, ...TAPE_ITEMS].map((item, i) => (
              <span key={i}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 border-b hair bg-paper/90 backdrop-blur">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 leading-none">
            <div className="display text-[22px] tracking-[-0.045em]">
              Smartech<span style={{ color: "#c00020" }}>.</span>
            </div>
            <span className="block w-px h-6 bg-ink/60" aria-hidden />
            <div className="text-[10px] mono tracking-[0.22em] dim uppercase">
              Vacuum · Since 2011
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[13.5px]">
            <Link href="/#industries" className="hover:text-edred transition-colors">산업 활용</Link>
            <Link href="/#products" className="hover:text-edred transition-colors">제품 라인업</Link>
            <Link href="/#solution" className="hover:text-edred transition-colors">토탈 솔루션</Link>
            <Link href="/#about" className="hover:text-edred transition-colors">회사 소개</Link>
            <Link href="/#ai" className="hover:text-edred transition-colors">AI 상담</Link>
            {tier === "ADMIN" && (
              <Link href="/admin" className="hover:text-edred transition-colors">관리자</Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {session ? (
              <>
                <span className="hidden sm:block text-[11px] mono dim">
                  {(session.user as any)?.company} ({TIER_LABELS[tier] ?? tier})
                </span>
                {session && (
                  <Link href="/quote" className="hidden sm:inline-flex chip !border-ink/60 hover:bg-ink hover:text-paper transition text-[11px]">
                    견적 카트
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="chip !border-ink/30 text-[11px] hover:bg-ink hover:text-paper transition"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/#contact" className="hidden sm:inline-flex chip !border-ink hover:bg-ink hover:text-paper transition">
                  상담 신청 →
                </Link>
                <Link href="/auth/login" className="chip !border-ink/30 text-[11px] hover:bg-ink hover:text-paper transition">
                  로그인
                </Link>
              </>
            )}
            <button
              className="md:hidden ml-1 text-ink/60"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="메뉴"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t hair px-6 py-4 flex flex-col gap-3 text-[13px] bg-paper">
            <Link href="/#industries" onClick={() => setMenuOpen(false)}>산업 활용</Link>
            <Link href="/#products" onClick={() => setMenuOpen(false)}>제품 라인업</Link>
            <Link href="/#solution" onClick={() => setMenuOpen(false)}>토탈 솔루션</Link>
            <Link href="/#about" onClick={() => setMenuOpen(false)}>회사 소개</Link>
            <Link href="/#ai" onClick={() => setMenuOpen(false)}>AI 상담</Link>
            {session ? (
              <>
                <Link href="/quote" onClick={() => setMenuOpen(false)}>견적 카트</Link>
                {tier === "ADMIN" && <Link href="/admin" onClick={() => setMenuOpen(false)}>관리자</Link>}
                <button onClick={() => signOut()} className="text-left text-edred">로그아웃</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>로그인</Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)}>회원가입</Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}

const TIER_LABELS: Record<string, string> = {
  PENDING: "승인대기",
  CONSUMER: "소비자",
  OEM: "OEM",
  DEALER: "딜러",
  ADMIN: "관리자",
};
