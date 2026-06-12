"use client";
import { useRouter } from "next/navigation";

export default function HeroCtaCards() {
  const router = useRouter();
  return (
    <div className="mt-9 grid grid-cols-4 gap-2.5 max-w-2xl hero-rise" style={{ ["--rd" as never]: ".75s" }}>
      {/* 견적 문의 — 제품 검색 섹션으로 스크롤 */}
      <div
        onClick={() => document.getElementById("b2b")?.scrollIntoView({ behavior: "smooth" })}
        className="group border border-ink p-4 flex flex-col justify-center items-center sm:justify-between sm:items-start min-h-[108px] hover:bg-ink hover:text-paper transition-all cursor-pointer"
      >
        <div className="hidden sm:block text-[9px] mono tracking-widest opacity-50">DIRECT QUOTE</div>
        <div className="text-center sm:text-left">
          <div className="text-[18px] sm:text-[20px] display leading-tight tracking-tight break-keep">견적 문의</div>
          <div className="hidden sm:block mt-1.5 text-[11px] opacity-60 group-hover:opacity-80">제품 검색 →</div>
        </div>
      </div>

      {/* 수리 문의 — /repair 페이지로 이동 */}
      <div
        onClick={() => router.push("/repair")}
        className="group border border-edred bg-edred text-paper p-4 flex flex-col justify-center items-center sm:justify-between sm:items-start min-h-[108px] hover:bg-ink hover:border-ink transition-all cursor-pointer"
      >
        <div className="hidden sm:block text-[9px] mono tracking-widest opacity-50">REPAIR</div>
        <div className="text-center sm:text-left">
          <div className="text-[18px] sm:text-[20px] display leading-tight tracking-tight break-keep">수리 문의</div>
          <div className="hidden sm:block mt-1.5 text-[11px] opacity-60 group-hover:opacity-80">A/S · 오버홀 →</div>
        </div>
      </div>

      {/* 펌프선정 — 펌프선정 및 시뮬레이션 섹션으로 스크롤 */}
      <div
        onClick={() => document.getElementById("b2b")?.scrollIntoView({ behavior: "smooth" })}
        className="group border border-ink p-4 flex flex-col justify-center items-center sm:justify-between sm:items-start min-h-[108px] hover:bg-ink hover:text-paper transition-all cursor-pointer"
      >
        <div className="hidden sm:block text-[9px] mono tracking-widest opacity-50">PUMP SELECTOR</div>
        <div className="text-center sm:text-left">
          <div className="text-[18px] sm:text-[20px] display leading-tight tracking-tight break-keep">펌프선정</div>
          <div className="hidden sm:block mt-1.5 text-[11px] opacity-60 group-hover:opacity-80">펌프 시뮬레이션 →</div>
        </div>
      </div>

      {/* AI 상담 */}
      <div
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("ai")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="group border border-ink bg-ink text-paper p-4 flex flex-col justify-center items-center sm:justify-between sm:items-start min-h-[108px] hover:bg-edred hover:border-edred transition-all cursor-pointer"
      >
        <div className="hidden sm:block text-[9px] mono tracking-widest opacity-50">AI CONSULT</div>
        <div className="text-center sm:text-left">
          <div className="text-[18px] sm:text-[20px] display leading-tight tracking-tight break-keep">AI 상담</div>
          <div className="hidden sm:block mt-1.5 text-[11px] opacity-60 group-hover:opacity-80">공정 조건 상담 →</div>
        </div>
      </div>
    </div>
  );
}
