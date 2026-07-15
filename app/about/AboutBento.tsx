"use client";
import Counter from "@/components/Counter";

const CURRENT_YEAR = new Date().getFullYear();

export default function AboutBento() {
  return (
    <div>
      <div className="hidden md:flex items-center gap-2.5 text-[10px] mono dim mb-3">
        <span className="kpi-status" />
        <span className="uppercase tracking-[0.18em]">Trust Profile</span>
        <span className="opacity-30">·</span>
        <span className="opacity-60">
          smartech ↔ <span className="text-edred font-semibold">Edwards</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {/* Hero cell */}
        <div className="bento-hero col-span-2 row-span-2 relative bg-white border hair p-5 md:p-6 flex flex-col justify-between overflow-hidden">
          <div className="flex items-baseline justify-between text-[10.5px] mono dim tracking-[0.18em] uppercase">
            <span>대표 진공산업 경력</span>
            <span>Since 2006</span>
          </div>
          <div className="mt-6 md:mt-8">
            <div className="display leading-[0.9] tracking-[-0.045em] tabular text-[72px] md:text-[104px]">
              <Counter to={CURRENT_YEAR - 2006} duration={2400} delay={900} decimals={0} />
            </div>
            <div className="display text-[22px] md:text-[28px] leading-[1.1] tracking-[-0.02em] text-ink/70 font-medium mt-1.5">
              years <span className="italic text-edred">in vacuum.</span>
            </div>
          </div>
          <div className="mt-6 md:mt-8">
            <div className="flex items-end gap-3">
              <span className="text-[10.5px] mono tabular dim tracking-wider pb-1">2006</span>
              <div className="flex-1 relative h-px bg-ink/20 mb-1.5 overflow-visible">
                <div className="editorial-range-fill absolute left-0 top-0 h-full bg-edred">
                  <span className="editorial-range-dot absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-edred" />
                </div>
              </div>
              <span className="display text-[22px] md:text-[28px] leading-none tracking-[-0.02em] tabular text-edred font-bold">
                {CURRENT_YEAR}
              </span>
            </div>
            <div className="mt-2.5 text-[11px] dim leading-snug">
              스마텍 설립 2011년 ·{" "}
              <span className="text-edred font-semibold">Edwards</span> 코리아 공식 대리점
            </div>
          </div>
          <span className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-edred/5 blur-3xl pointer-events-none" />
        </div>

        {/* KPI 1 — 수리·기술지원 */}
        <div className="bento-cell relative bg-white border hair p-4 flex flex-col justify-between min-h-[100px]">
          <div className="kpi-eyebrow">수리·기술지원</div>
          <div>
            <div className="display text-[32px] leading-none tabular">
              <Counter to={900} duration={2200} />
              <span className="text-[20px] opacity-60">+</span>
            </div>
            <div className="text-[10px] mt-1.5 dim leading-snug">누적 건수</div>
          </div>
        </div>

        {/* KPI 2 — 누적 납품 */}
        <div className="bento-cell relative bg-white border hair p-4 flex flex-col justify-between min-h-[100px]">
          <div className="kpi-eyebrow">누적 납품</div>
          <div>
            <div className="display text-[32px] leading-none tabular">
              <Counter to={1800} duration={3600} separator="," />
              <span className="text-[20px] opacity-60">+</span>
            </div>
            <div className="text-[10px] mt-1.5 dim leading-snug">건</div>
          </div>
        </div>

        {/* Auth bar */}
        <div className="bento-auth col-span-3 relative bg-edred text-paper p-3 md:p-4 flex items-center gap-3 md:gap-4 overflow-hidden">
          <div className="shrink-0 relative">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/95 flex items-center justify-center p-1.5">
              <img
                src="/images/brand/edwards-logo.png"
                alt="Edwards Vacuum"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="absolute -inset-1 border border-white/40 animate-ping opacity-50" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] mono opacity-70 tracking-[0.16em] uppercase">
              Authorization · Official
            </div>
            <div className="text-[13px] md:text-[15px] font-medium mt-0.5">
              <span className="font-bold">Edwards</span>{" "}
              <span className="opacity-95">Authorized Distributor</span>
            </div>
            <div className="text-[10.5px] opacity-75 mt-0.5">한국 공식 대리점 · Korea</div>
          </div>
          <div className="hidden sm:block shrink-0 text-[9px] mono opacity-35 tracking-[0.14em] self-start">
            04 / 04
          </div>
        </div>
      </div>
    </div>
  );
}
