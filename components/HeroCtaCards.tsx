"use client";
import Link from "next/link";

/** 홈 검색 구역(#b2b)으로 내려가며 PumpSelector의 탭을 연다 */
function goToSelector(tab: "search" | "selection") {
  window.dispatchEvent(new CustomEvent("pumpSelectorTab", { detail: tab }));
  document.getElementById("b2b")?.scrollIntoView({ behavior: "smooth" });
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// 2026-10-20 대표님 승인: 영어 머리글 삭제, 설명 글 선명하게·휴대폰에도 표시, 보조 버튼 진하게, 마우스 올림 강화.
// 마우스 올림은 10/18 A안(자기 색 유지) 그대로 — 견적 문의는 진한 빨강, 수리·오버홀은 검정+빨강 테두리.
const BIG =
  "group relative flex flex-col justify-between gap-3 p-4 sm:p-5 min-h-[132px] text-left transition-all duration-200 " +
  "hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edred";

// 제목: 휴대폰 24px(360px 폭에서도 한 줄), 그 이상 36px
const TITLE = "text-[24px] sm:text-[36px] display leading-tight tracking-tight whitespace-nowrap";

const SMALL =
  "group flex items-center gap-2.5 border border-ink/40 bg-white/60 px-4 py-3.5 text-left text-ink transition-colors duration-200 " +
  "hover:bg-ink hover:border-ink hover:text-paper active:scale-[0.98] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edred";

export default function HeroCtaCards() {
  return (
    <div className="mt-9 max-w-2xl hero-rise" style={{ ["--rd" as never]: ".75s" }}>
      {/* 1차 — 견적 문의 · 수리·오버홀 */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => goToSelector("search")}
          className={`${BIG} border border-edred bg-edred text-paper hover:bg-edred3 hover:border-edred3 hover:shadow-[0_16px_32px_rgb(11_11_12/0.28)]`}
        >
          <span className="flex items-start justify-between gap-2">
            <span className={TITLE}>견적 문의</span>
            <Arrow className="hidden sm:block mt-2 shrink-0 transition-transform duration-200 group-hover:translate-x-1.5" />
          </span>
          {/* 휴대폰은 제목 자리를 넓히려고 화살표를 설명 글 끝에 둔다 */}
          <span className="flex items-end justify-between gap-1.5">
            <span className="text-[13px] sm:text-[15px] leading-snug font-medium text-paper/95 break-keep">
              모델명만 치면 가격·재고·납기 바로 확인
            </span>
            <Arrow className="sm:hidden shrink-0 w-[18px] h-[18px]" />
          </span>
        </button>

        <Link
          href="/repair"
          className={`${BIG} border border-ink bg-ink text-paper hover:border-edred hover:shadow-[inset_0_0_0_1px_var(--color-edred),0_16px_32px_rgb(11_11_12/0.28)]`}
        >
          <span className="flex items-start justify-between gap-2">
            <span className={TITLE}>수리·오버홀</span>
            <Arrow className="hidden sm:block mt-2 shrink-0 transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-edred2" />
          </span>
          <span className="flex items-end justify-between gap-1.5">
            <span className="text-[13px] sm:text-[15px] leading-snug font-medium text-paper/90 group-hover:text-edred2 break-keep">
              접수 · 절차 · 수리 사례
            </span>
            <Arrow className="sm:hidden shrink-0 w-[18px] h-[18px]" />
          </span>
        </Link>
      </div>

      {/* 2차 — 펌프 선정(선정 탭 바로 열림) · AI 상담 */}
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <button type="button" onClick={() => goToSelector("selection")} className={SMALL}>
          {/* 배기속도 곡선 3개(카탈로그 Pumping Speed 그래프 모양) — 2026-10-20 대표님 요청 */}
          <svg className="shrink-0" width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path stroke="currentColor" strokeWidth="1.2" opacity=".45" d="M2.5 2.5V21.5H22" />
            <path className="stroke-edred group-hover:stroke-edred2" d="M7 21C8.5 14 10 5.5 14 5.5c3 0 5 3 7.5 5.5" />
            <path stroke="currentColor" d="M5 21c1.5-4 3.5-8.5 8-8.5h8.5" />
            <path className="stroke-dim group-hover:stroke-paper/60" d="M10 21c1.5-2.5 3-4 6-4h5.5" />
          </svg>
          <span className="flex-1 text-[14px] sm:text-[15px] font-semibold leading-snug break-keep">펌프 선정·시뮬레이션</span>
          <Arrow className="hidden sm:block shrink-0 w-[18px] h-[18px] transition-transform duration-200 group-hover:translate-x-1" />
        </button>
        <button
          type="button"
          onClick={() => document.getElementById("ai")?.scrollIntoView({ behavior: "smooth" })}
          className={SMALL}
        >
          <svg className="shrink-0 text-edred group-hover:text-edred2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v11H9l-5 4V5z" />
          </svg>
          <span className="flex-1 text-[14px] sm:text-[15px] font-semibold leading-snug break-keep">AI 공정 상담</span>
          <Arrow className="hidden sm:block shrink-0 w-[18px] h-[18px] transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
