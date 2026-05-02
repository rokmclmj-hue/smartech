import Link from "next/link";
import HeroChat from "@/components/HeroChat";
import Industries from "@/components/Industries";
import Counter from "@/components/Counter";
import Reveal from "@/components/Reveal";
import HeroParticles from "@/components/HeroParticles";
import RotatingHero from "@/components/RotatingHero";
import ProductShowcase from "@/components/ProductShowcase";
import ProductCategories from "@/components/ProductCategories";
import PumpSelector from "@/components/PumpSelector";
import HeroVideoIntro from "@/components/HeroVideoIntro";

function hiEd(text: string, white = false) {
  return text.split(/(\bEdwards\b|\bSmartech\b)/).map((p, i) => {
    if (p === "Edwards") return <span key={i} className={white ? "text-white font-semibold" : "text-edred font-semibold"}>Edwards</span>;
    if (p === "Smartech") return <span key={i} className="display tracking-[-0.045em] text-ink" style={{ fontWeight: 600 }}>Smartech<span style={{ color: "#c00020" }}>.</span></span>;
    return p;
  });
}

// Server-side evaluated at request time — auto-updates each new year
const CURRENT_YEAR = new Date().getFullYear();

export default function Home() {
  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden noisebg">
        <HeroParticles count={35} />
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-10 relative">
          {/* Corner meta — desktop only */}
          <div className="hidden md:flex justify-between text-[11px] mono dim mb-5 hero-rise" style={{ ["--rd" as never]: "0s" }}>
            <div>EDWARDS VACUUM · KOREA OFFICIAL</div>
            <div className="hidden md:block">N37.5° · E127.0° / SEOUL, KR</div>
            <HeroClock />
          </div>

          <div className="grid grid-cols-12 gap-6 items-end">
            {/* Headline */}
            <div className="col-span-12 lg:col-span-7">
              <RotatingHero />
              <p className="mt-8 max-w-xl text-[15px] leading-[1.7] text-[#2a2823] hero-rise" style={{ ["--rd" as never]: ".55s" }}>
                스마텍은 <span className="text-edred font-semibold">Edwards</span> 코리아의 공식 파트너로서,
                20대 핵심 진공 산업 전반에 걸쳐 고객사별 맞춤형 하이엔드 진공 솔루션을 제공합니다.
              </p>
              <div className="mt-9 grid grid-cols-3 gap-2.5 max-w-xl hero-rise" style={{ ["--rd" as never]: ".75s" }}>
                <Link
                  href="#b2b"
                  className="group border border-ink p-4 flex flex-col justify-between min-h-[108px] hover:bg-ink hover:text-paper transition-all"
                >
                  <div className="text-[9px] mono tracking-widest opacity-50">DIRECT QUOTE</div>
                  <div>
                    <div className="mt-2 text-[20px] display leading-tight tracking-tight">견적 문의</div>
                    <div className="mt-1.5 text-[11px] opacity-60 group-hover:opacity-80">신규제품구매 →</div>
                  </div>
                </Link>
                <Link
                  href="#b2b"
                  className="group border border-ink bg-ink text-paper p-4 flex flex-col justify-between min-h-[108px] hover:bg-edred hover:border-edred transition-all"
                >
                  <div className="text-[9px] mono tracking-widest opacity-50">AI ASSISTANT</div>
                  <div>
                    <div className="mt-2 text-[20px] display leading-tight tracking-tight">AI 견적문의</div>
                    <div className="mt-1.5 text-[11px] opacity-60 group-hover:opacity-80">모델 자동 추천 →</div>
                  </div>
                </Link>
                <Link
                  href="#contact"
                  className="group border border-ink p-4 flex flex-col justify-between min-h-[108px] hover:bg-ink hover:text-paper transition-all"
                >
                  <div className="text-[9px] mono tracking-widest opacity-50">REPAIR</div>
                  <div>
                    <div className="mt-2 text-[20px] display leading-tight tracking-tight">수리 문의</div>
                    <div className="mt-1.5 text-[11px] opacity-60 group-hover:opacity-80">A/S · 오버홀 →</div>
                  </div>
                </Link>
              </div>
              <div className="mt-10 hidden md:flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] mono text-black hero-rise" style={{ ["--rd" as never]: ".9s" }}>
                <span>CALL  031–204–7170</span>
                <span>·</span>
                <span>MAIL  rokmclmj@gmail.com</span>
              </div>
            </div>

            {/* Trust bento — asymmetric, 2006 as hero, red certification anchor */}
            <div className="col-span-12 lg:col-span-5 hero-rise" style={{ ["--rd" as never]: ".4s" }}>
              <HeroVideoIntro>
              {/* eyebrow — desktop only */}
              <div className="hidden md:flex items-center gap-2.5 text-[10px] mono dim mb-3">
                <span className="kpi-status" />
                <span className="uppercase tracking-[0.18em]">Trust Profile</span>
                <span className="opacity-30">·</span>
                <span className="opacity-60">smartech ↔ <span className="text-edred font-semibold">Edwards</span></span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Hero cell — Editorial typography (col-span-2, row-span-2) */}
                <div className="bento-hero col-span-2 row-span-2 relative bg-white border hair p-5 md:p-6 flex flex-col justify-between overflow-hidden">
                  {/* Top kicker — brand and origin */}
                  <div className="flex items-baseline justify-between text-[10.5px] mono dim tracking-[0.18em] uppercase">
                    <span>Smartech</span>
                    <span>Since 2006</span>
                  </div>

                  {/* Giant years + "years / in vacuum." */}
                  <div className="mt-6 md:mt-8">
                    <div className="display leading-[0.9] tracking-[-0.045em] tabular text-[72px] md:text-[104px]">
                      <Counter to={CURRENT_YEAR - 2006} duration={2400} delay={900} decimals={0} />
                    </div>
                    <div className="display text-[22px] md:text-[28px] leading-[1.1] tracking-[-0.02em] text-ink/70 font-medium mt-1.5">
                      years <span className="italic text-edred">in vacuum.</span>
                    </div>
                  </div>

                  {/* Range bar — 2006 ────── {CURRENT_YEAR}. Current year emphasized as editorial anchor. */}
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
                      still operating · <span className="text-edred font-semibold">Edwards</span> 코리아 공식 대리점
                    </div>
                  </div>

                  {/* very subtle glow */}
                  <span className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-edred/5 blur-3xl pointer-events-none" />
                </div>

                {/* Small cell — Edwards global RV shipped */}
                <div className="bento-cell relative bg-white border hair p-4 flex flex-col justify-between min-h-[100px]">
                  <div className="kpi-eyebrow">RV Shipped</div>
                  <div>
                    <div className="display text-[32px] leading-none tabular">
                      <Counter to={40} duration={2200} />
                      <span className="text-[20px] opacity-60">만+</span>
                    </div>
                    <div className="text-[10px] mt-1.5 dim leading-snug">
                      <span className="text-edred font-semibold">Edwards</span> 글로벌 누적
                    </div>
                  </div>
                </div>

                {/* Small cell — Product Lineup */}
                <div className="bento-cell relative bg-white border hair p-4 flex flex-col justify-between min-h-[100px]">
                  <div className="kpi-eyebrow">Product Lineup</div>
                  <div>
                    <div className="display text-[32px] leading-none tabular">
                      <Counter to={1014} duration={3600} />
                      <span className="text-[20px] opacity-60">+</span>
                    </div>
                    <div className="text-[10px] mt-1.5 dim leading-snug">취급 품목</div>
                  </div>
                </div>

                {/* Wide bottom — Authorization (Edwards red) */}
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
                    <div className="text-[10px] mono opacity-70 tracking-[0.16em] uppercase">Authorization · Official</div>
                    <div className="text-[13px] md:text-[15px] font-medium mt-0.5">
                      <span className="font-bold">Edwards</span>{" "}
                      <span className="opacity-95">Authorized Distributor</span>
                    </div>
                    <div className="text-[10.5px] opacity-75 mt-0.5">한국 공식 대리점 · Korea</div>
                  </div>
                  <div className="hidden sm:block shrink-0 text-[9px] mono opacity-35 tracking-[0.14em] self-start">04 / 04</div>
                </div>
              </div>
              </HeroVideoIntro>
            </div>
          </div>

          {/* In-hero compact product strip — 첫 화면에 노출 */}
          <div className="hero-rise" style={{ ["--rd" as never]: "1.05s" }}>
            <div className="mt-6 mb-2 flex items-center justify-between text-[10px] mono dim">
              <span className="flex items-center gap-2">
                <span className="kpi-status" />
                <span className="uppercase tracking-[0.14em] text-ink/70">Featured Lineup</span>
                <span className="opacity-30">·</span>
                <span>04 of 24</span>
              </span>
              <Link href="/products" className="hover:text-edred underline-red pb-0.5">
                ALL CATALOGS →
              </Link>
            </div>
            <ProductShowcase />
          </div>

        </div>
      </section>

      {/* ═══════════════ TOTAL SOLUTION ═══════════════ */}
      <section id="solution" className="pt-14 pb-28 border-b hair">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16 text-center">
            <div className="mono text-[11px] dim mb-4">— 01 · TOTAL SOLUTION</div>
            <h2 className="section-title display">
              판매로 시작해, <span className="italic text-edred">운전 수명 내내</span> 함께합니다.
            </h2>
            <p className="mt-6 text-[15px] leading-[1.75] text-[#2a2823]">
              펌프 선정에서 유지보수, 부품 조달에 이르기까지 제품의 전 생애 주기를 스마텍이 통합 관리합니다.
              재구매와 추천으로 검증된 스마텍만의 차별화된 서비스를 경험하십시오.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l hair">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`border-r border-b hair p-8 group hover:bg-ink hover:text-paper transition-colors ${
                  i === 2 ? "bg-edred text-paper hover:bg-ink" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="mono text-[11px] opacity-70">STEP / {String(i + 1).padStart(2, "0")}</div>
                  <div className="mono text-[11px] opacity-70">{i === STEPS.length - 1 ? "∞" : "→"}</div>
                </div>
                <div className="display text-[44px] leading-none mt-4">{step.title}</div>
                <p className="mt-6 text-[13.5px] leading-[1.7] opacity-90">{hiEd(step.desc, i === 2)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 20 INDUSTRIES (client) ═══════════════ */}
      <Industries />

      {/* ═══════════════ PRODUCT CATEGORIES ═══════════════ */}
      <section id="products" className="py-28 border-b hair">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-12 gap-6 mb-14">
            <div className="col-span-12 lg:col-span-6">
              <div className="mono text-[11px] dim mb-4">— 03 · PRODUCT LINEUP</div>
              <h2 className="section-title display">
                주요 제품<span className="text-edred">.</span>
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:col-start-8 mt-4">
              <p className="text-[15px] leading-[1.75] text-[#2a2823]">
                오일 로터리 베인부터 터보분자, 반도체 드라이, 게이지, 리크 디텍터까지.
                공정 조건에 맞게 조합해 제안합니다.
              </p>
            </div>
          </div>

          <ProductCategories />
        </div>
      </section>

      {/* ═══════════════ B2B / B2C ═══════════════ */}
      <section id="b2b" className="border-b hair">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-x hair">
          {/* B2B */}
          <div className="bg-ink text-paper p-10 md:p-16 relative overflow-hidden">
            {/* ghost index — adds right-side visual weight */}
            <div aria-hidden className="hidden lg:block absolute -top-6 -right-6 display text-[220px] leading-none tracking-[-0.05em] opacity-[0.04] select-none pointer-events-none">
              04a
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative">
              {/* Left — headline + body + CTAs */}
              <div className="lg:col-span-7">
                <div className="mono text-[11px] opacity-70">— 04a · B2B</div>
                <h3 className="display text-[56px] md:text-[72px] leading-[0.95] mt-4">
                  <span className="italic text-edred">전용견적</span>
                </h3>
                <div className="mt-5 mono text-[11px] tracking-[0.18em] opacity-60 uppercase">
                  Expert Consulting &amp; Fast Delivery
                </div>
                <p className="mt-6 text-[14.5px] leading-[1.75] opacity-90">
                  고객사 공정의 중단 없는 운영을 위해 소모품 및 주요 메이저 품목들은 국내 상시 재고로 운용하고 있습니다.
                  스마텍은 가장 필요한 순간, 가장 빠른 대응을 약속드립니다.
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Link href="/auth/register" className="bg-edred text-paper px-6 py-4 text-sm hover:bg-edred2 transition-colors">
                    B2B 회원가입 → 가격 확인
                  </Link>
                  <Link href="#contact" className="border border-paper/30 px-6 py-4 text-sm hover:bg-paper hover:text-ink transition-colors">
                    견적 직접 문의 →
                  </Link>
                </div>
              </div>

              {/* Right — feature panel */}
              <div className="lg:col-span-5 lg:border-l lg:border-paper/15 lg:pl-8 flex flex-col justify-center">
                <div className="mono text-[10px] opacity-60 tracking-[0.18em] uppercase mb-5">What You Get</div>
                <ul className="space-y-5 text-[13.5px]">
                  <li className="flex gap-3 items-start">
                    <span className="text-edred shrink-0 mt-0.5">→</span>
                    <div>
                      <div>정품 공식 유통 경로</div>
                      <div className="text-[11px] opacity-55 mt-1"><span className="text-edred font-semibold">Edwards</span> 코리아 인증 대리점</div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-edred shrink-0 mt-0.5">→</span>
                    <div>
                      <div>사양서 기반 모델 제안</div>
                      <div className="text-[11px] opacity-55 mt-1">공정 요건에 맞춘 최적 구성</div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-edred shrink-0 mt-0.5">→</span>
                    <div>
                      <div>국내 상시 재고 운용</div>
                      <div className="text-[11px] opacity-55 mt-1">소모품 · 주요 품목 즉시 출고 가능</div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-edred shrink-0 mt-0.5">→</span>
                    <div>
                      <div>신속 납기 대응</div>
                      <div className="text-[11px] opacity-55 mt-1">긴급 발주 시 당일·익일 출고 지원</div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-edred shrink-0 mt-0.5">→</span>
                    <div>
                      <div>전담 기술 지원</div>
                      <div className="text-[11px] opacity-55 mt-1">설치·시운전·유지보수 전 과정 동행</div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-edred shrink-0 mt-0.5">→</span>
                    <div>
                      <div>A/S · 오버홀 서비스</div>
                      <div className="text-[11px] opacity-55 mt-1">공장 가동 중단 최소화를 위한 신속 처리</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* B2C */}
          <div className="p-10 md:p-16 relative overflow-hidden">
            <div className="mono text-[11px] dim">— 04b · B2C · RESEARCHER</div>
            <h3 className="display text-[38px] md:text-[52px] leading-[1.05] mt-4">
              어떤 펌프를 골라야 할지<br />
              <span className="italic">모르겠다면,</span><br />
              <span className="text-edred">아래 옵션에서 선택하세요.</span>
            </h3>
            <PumpSelector />
          </div>
        </div>
      </section>

      {/* ═══════════════ AI CHAT ═══════════════ */}
      <section id="ai" className="py-28 border-b hair bg-paper">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5">
            <div className="mono text-[11px] dim mb-4">— 05 · AI CONSULT</div>
            <h2 className="display leading-[1.12] tracking-[-0.03em]" style={{ fontSize: "clamp(24px,2.8vw,44px)" }}>
              복잡한 공정 조건만 입력해 주세요.<br />
              <span className="italic text-edred">스마텍 AI</span>가 최적의{" "}
              <span className="text-edred font-semibold">Edwards</span><br />
              라인업을 제안합니다.
            </h2>
            <p className="mt-6 text-[15px] leading-[1.75] text-[#2a2823] max-w-[48ch]">
              진공펌프의 종류부터 사용 가스, 도달 시간까지 — 까다로운 공정 변수를 입력하시면
              스마텍의 데이터로 학습된 AI가 가장 적합한{" "}
              <span className="text-edred font-semibold">Edwards</span> 모델을 정밀하게 선별해 드립니다.
              전문가의 검토 전, 가장 스마트한 가이드를 먼저 만나보세요.
            </p>
            <div className="mt-6 mono text-[11px] dim">
              ※ 이 추천은 AI 1차 분석 결과이며, 실제 공정 적용 전 담당 기술자 검토를 권장합니다.
            </div>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <HeroChat />
          </div>
        </div>
      </section>

      {/* ═══════════════ ABOUT / TIMELINE ═══════════════ */}
      <section id="about" className="py-28 border-b hair">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5">
            <div className="mono text-[11px] dim mb-4">— 06 · ABOUT</div>
            <h2 className="section-title display">
              신뢰와 전문성이<br />
              <span className="italic text-edred">먼저</span>입니다.
            </h2>
            <p className="mt-8 text-[15px] leading-[1.75] text-[#2a2823] max-w-[44ch]">
              "2006년부터 이어진 스마텍의 여정, 성장의 중심에는 늘 '신뢰'가 있었습니다."
            </p>
            <p className="mt-5 text-[15px] leading-[1.75] text-[#2a2823] max-w-[44ch]">
              스마텍은 2011년 창업과 2018년 법인화를 통해 전문성을 확장해 왔습니다.
              단순히 제품을 공급하는 공급사를 넘어, 변함없는 신뢰를 바탕으로 고객의 공정 현장에서
              끝까지 함께하는 가장 든든한 파트너가 되겠습니다.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <div className="border-l hair pl-8 space-y-10">
              {TIMELINE.map((item, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-10 top-1 w-3 h-3 rounded-full ${i === 0 || i === TIMELINE.length - 1 ? "bg-edred animate-pulse" : "bg-ink"}`} />
                  <div className="mono text-[11px] dim">{item.year}</div>
                  <div className="display text-[30px] leading-[1.1] mt-1">
                    {item.title.includes("Smartech") ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="display text-[25.3px] tracking-[-0.045em]">
                          Smartech<span style={{ color: "#c00020" }}>.</span>
                        </span>
                        <span>{item.title.replace("Smartech", "").trim()}</span>
                      </span>
                    ) : hiEd(item.title)}
                  </div>
                  <p className="mt-2 text-[13.5px] dim">{hiEd(item.desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA / CONTACT ═══════════════ */}
      <section id="contact" className="py-28 border-b hair bg-ink text-paper relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mono text-[11px] opacity-70 mb-6">— 07 · CONTACT</div>
          <h2 className="display text-[clamp(22px,3.8vw,58px)] leading-[1.05]">
            수량, 납기, 커스텀 사양이<br />
            <span className="italic text-edred">있으신가요?</span>
          </h2>

          <div className="grid grid-cols-12 gap-6 mt-16">
            <div className="col-span-12 lg:col-span-7">
              <div className="border border-paper/20">
                <div className="grid grid-cols-2 divide-x divide-paper/20">
                  <a href="tel:03120471700" className="p-8 hover:bg-edred transition-colors group block">
                    <div className="mono text-[11px] opacity-70 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-edred inline-block animate-pulse" />
                      CALL · 24/7
                    </div>
                    <div className="display text-[44px] leading-none mt-3 tabular">031·204·7170</div>
                    <div className="text-[12px] mt-3 opacity-70">24시간 응급 대응 · 펌프 다운은 분 단위로 움직입니다</div>
                  </a>
                  <a href="mailto:rokmclmj@gmail.com" className="p-8 hover:bg-edred transition-colors group block">
                    <div className="mono text-[11px] opacity-70">MAIL</div>
                    <div className="display text-[36px] leading-none mt-3 break-all">rokmclmj@gmail.com</div>
                    <div className="text-[12px] mt-3 opacity-70">야간·주말 메일도 확인합니다</div>
                  </a>
                </div>
                <div className="p-8 border-t border-paper/20 flex flex-wrap gap-3">
                  <Link href="/quote" className="bg-edred text-paper px-6 py-4 text-sm hover:bg-edred2 transition-colors">
                    견적 요청하기 →
                  </Link>
                  <Link href="/auth/register" className="border border-paper/30 px-6 py-4 text-sm hover:bg-paper hover:text-ink transition-colors">
                    B2B 회원가입
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="mono text-[11px] opacity-70">STATUS</div>
              <div className="display text-[28px] leading-[1.1] mt-2">지금 스마텍에 연락하면 —</div>
              <ul className="mt-6 space-y-3 text-[13.5px] opacity-90">
                <li className="flex gap-3"><span className="text-edred">01</span> 24시간 365일 — 새벽에 멈춘 펌프도 새벽에 받습니다</li>
                <li className="flex gap-3"><span className="text-edred">02</span> 사양서를 보내주시면 적합한 모델로 제안드립니다</li>
                <li className="flex gap-3"><span className="text-edred">03</span> 구매 확정 전 기술 문의만이어도 괜찮습니다</li>
                <li className="flex gap-3"><span className="text-edred">04</span> 국내 재고의 소모품·메이저 파트는 당일 출고도 가능합니다</li>
              </ul>
              <div className="mt-10 text-[11px] mono opacity-60">
                EDWARDS VACUUM KOREA OFFICIAL DISTRIBUTOR · SINCE 2011
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-paper text-ink">
        <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-10">
          <div className="display text-[clamp(31px,4.25vw,68px)] leading-[1.15]" style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
            <span className="pr-[0.25em]">기술은</span>
            <span><span className="text-edred font-semibold">Edwards</span>가 만들었습니다.</span>
            <span className="pr-[0.25em]">신뢰는</span>
            <span><span className="text-ink font-semibold">Smartech<span style={{ color: "#c00020" }}>.</span></span>이 쌓았습니다.</span>
          </div>

          <div className="grid grid-cols-12 gap-6 mt-12 border-t hair pt-8 text-[12.5px]">
            <div className="col-span-6 md:col-span-3">
              <div className="mono text-[11px] dim mb-3">PRODUCTS</div>
              <div className="space-y-2">
                <div>오일 로터리 베인</div>
                <div>드라이 스크롤 / 스크류</div>
                <div>반도체 드라이 펌프</div>
                <div>터보분자 펌프</div>
                <div>게이지 · 리크 디텍터</div>
              </div>
            </div>
            <div className="col-span-6 md:col-span-3">
              <div className="mono text-[11px] dim mb-3">INDUSTRIES</div>
              <div className="space-y-2">
                <div>반도체 · 디스플레이</div>
                <div>화학 · 제약</div>
                <div>연구개발 · 대학</div>
                <div>식품 · 포장</div>
                <div>우주 · 항공</div>
              </div>
            </div>
            <div className="col-span-6 md:col-span-3">
              <div className="mono text-[11px] dim mb-3">COMPANY</div>
              <div className="space-y-2">
                <div>회사 소개</div>
                <div>공식 대리점 인증</div>
                <div>대표 메시지</div>
              </div>
            </div>
            <div className="col-span-6 md:col-span-3">
              <div className="mono text-[11px] dim mb-3">CONTACT</div>
              <div className="space-y-2">
                <div>✉ rokmclmj@gmail.com</div>
                <div>☏ 031–204–7170 <span className="text-edred">· 24/7</span></div>
                <div>(주)스마텍</div>
                <div><span className="text-edred font-semibold">Edwards</span> Vacuum 공식 대리점</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-between gap-3 text-[11px] mono dim">
            <div>© 2026 SMARTECH · ALL RIGHTS RESERVED</div>
            <div>VACUUM TOTAL SOLUTION / EDWARDS KR</div>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ─── Clock (client component) ─── */
function HeroClock() {
  return <div id="hero-clock" suppressHydrationWarning>FILE —</div>;
}

/* ─── Static data ─── */
const STEPS = [
  {
    title: "기술 컨설팅",
    desc: "공정 분석과 기술 노하우를 바탕으로 현장 조건에 최적화된 맞춤 솔루션을 제안합니다.",
  },
  {
    title: "제품 선정",
    desc: "오일 · 드라이 · 터보 · 부스터 전 라인업 중 공정 요건에 정확히 부합하는 최적 구성을 제안합니다.",
  },
  {
    title: "정품 공급",
    desc: "Edwards 정품을 공식 경로로 공급하며 제품의 출처와 품질, 보증까지 책임집니다.",
  },
  {
    title: "설치 & 시운전",
    desc: "단순 납품을 넘어 현장 설치, 배관 구성, 초기 성능 확인까지 완벽하게 마무리합니다.",
  },
  {
    title: "정기 유지보수",
    desc: "PM 스케줄 수립부터 현장 서비스까지 모든 과정을 스마텍이 책임집니다.",
  },
  {
    title: "30년경력수리전문",
    desc: "30년 이상 Edwards 펌프를 다뤄온 전문가가 직접 분해·점검·조립하며 가동 중단 시간을 최소화 합니다.",
  },
];

const TIMELINE = [
  { year: "2006", title: "Edwards 코리아 합류", desc: "기술영업으로 5년, 수많은 고객 현장과 공정 앞에서 진공을 읽는 감각을 쌓은 시간." },
  { year: "2011", title: "Smartech 창업", desc: "Edwards 공식 대리점으로, '기술하는 파트너'로 출발했습니다." },
  { year: "2018", title: "(주)스마텍 법인 전환", desc: "규모보다 신뢰를 먼저 키우자 — 그렇게 커진 이름입니다." },
  { year: "NOW", title: "거래처의 신뢰를 지켜가는 중", desc: "오래된 거래처가 지금도 먼저 전화해 오는 것, 그게 스마텍의 가장 큰 자랑입니다." },
];
