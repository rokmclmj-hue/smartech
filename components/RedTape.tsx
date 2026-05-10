// 상단 빨간 띠 — 진공 압력 게이지 스위프 (홈페이지·관리자 공통)
export default function RedTape() {
  return (
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
  );
}
