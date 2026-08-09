"use client";
import { useRouter } from "next/navigation";

export default function HeroCtaCards() {
  const router = useRouter();
  return (
    <div className="mt-9 max-w-2xl hero-rise" style={{ ["--rd" as never]: ".75s" }}>
      {/* 1차 CTA — 실사용 빈도 1·2위: 견적 문의 · 수리 문의 (동일 비중, 확대) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          onClick={() => document.getElementById("b2b")?.scrollIntoView({ behavior: "smooth" })}
          className="group border border-edred bg-edred text-paper p-5 flex flex-col justify-center items-center sm:justify-between sm:items-start min-h-[132px] hover:bg-ink hover:border-ink transition-all cursor-pointer"
        >
          <div className="hidden sm:block text-[9px] mono tracking-widest opacity-50">DIRECT QUOTE</div>
          <div className="text-center sm:text-left">
            <div className="text-[22px] sm:text-[26px] display leading-tight tracking-tight break-keep">견적 문의</div>
            <div className="hidden sm:block mt-1.5 text-[11px] opacity-60 group-hover:opacity-80">제품 검색 · 펌프 선정 →</div>
          </div>
        </div>

        <div
          onClick={() => router.push("/repair")}
          className="group border border-ink bg-ink text-paper p-5 flex flex-col justify-center items-center sm:justify-between sm:items-start min-h-[132px] hover:bg-edred hover:border-edred transition-all cursor-pointer"
        >
          <div className="hidden sm:block text-[9px] mono tracking-widest opacity-50">REPAIR</div>
          <div className="text-center sm:text-left">
            <div className="text-[22px] sm:text-[26px] display leading-tight tracking-tight break-keep">수리 문의</div>
            <div className="hidden sm:block mt-1.5 text-[11px] opacity-60 group-hover:opacity-80">A/S · 오버홀 →</div>
          </div>
        </div>
      </div>

      {/* 2차 — 보조 도구는 텍스트 링크로 격하 (스펙을 이미 아는 소수 사용자용 지름길 + AI 상담 접점 유지) */}
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => document.getElementById("b2b")?.scrollIntoView({ behavior: "smooth" })}
          className="group flex items-center justify-between border hair px-4 py-3 text-left hover:border-ink transition-colors"
        >
          <span className="text-[12.5px] mono dim group-hover:text-ink transition-colors">펌프 선정 · 시뮬레이션</span>
          <span className="text-[13px] dim group-hover:text-edred transition-colors">→</span>
        </button>
        <button
          type="button"
          onClick={() => document.getElementById("ai")?.scrollIntoView({ behavior: "smooth" })}
          className="group flex items-center justify-between border hair px-4 py-3 text-left hover:border-ink transition-colors"
        >
          <span className="text-[12.5px] mono dim group-hover:text-ink transition-colors">AI 공정 상담</span>
          <span className="text-[13px] dim group-hover:text-edred transition-colors">→</span>
        </button>
      </div>
    </div>
  );
}
