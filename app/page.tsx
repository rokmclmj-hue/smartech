import Link from "next/link";
import HeroChat from "@/components/HeroChat";
import Industries from "@/components/Industries";
import Counter from "@/components/Counter";
import Reveal from "@/components/Reveal";
import HeroParticles from "@/components/HeroParticles";
import RotatingHero from "@/components/RotatingHero";
import ProductShowcase from "@/components/ProductShowcase";
import ProductCategories from "@/components/ProductCategories";

function hiEd(text: string, white = false) {
  return text.split(/(\bEdwards\b)/).map((p, i) =>
    p === "Edwards"
      ? <span key={i} className={white ? "text-white font-semibold" : "text-edred font-semibold"}>Edwards</span>
      : p
  );
}

export default function Home() {
  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden noisebg">
        <HeroParticles count={18} />
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-10 relative">
          {/* Corner meta */}
          <div className="flex justify-between text-[11px] mono dim mb-5 hero-rise" style={{ ["--rd" as never]: "0s" }}>
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
              <div className="mt-9 flex flex-wrap items-center gap-3 hero-rise" style={{ ["--rd" as never]: ".75s" }}>
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-3 bg-ink text-paper px-6 py-4 text-sm hover:bg-edred transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-edred inline-block" />
                  상담 신청 — 1일 내 회신 →
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 border border-ink px-6 py-4 text-sm hover:bg-ink hover:text-paper transition-colors"
                >
                  제품 라인업 보기
                </Link>
                <Link href="#ai" className="inline-flex items-center gap-2 text-sm underline-red pb-0.5 ml-2 hover:text-edred">
                  또는 AI로 펌프 추천받기
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] mono dim hero-rise" style={{ ["--rd" as never]: ".9s" }}>
                <span>CALL  031–204–7170</span>
                <span>·</span>
                <span>MAIL  rokmclmj@gmail.com</span>
              </div>
            </div>

            {/* Trust bento — asymmetric, 2006 as hero, red certification anchor */}
            <div className="col-span-12 lg:col-span-5 hero-rise" style={{ ["--rd" as never]: ".4s" }}>
              {/* eyebrow */}
              <div className="flex items-center gap-2.5 text-[10px] mono dim mb-3">
                <span className="kpi-status" />
                <span className="uppercase tracking-[0.18em]">Trust Profile</span>
                <span className="opacity-30">·</span>
                <span className="opacity-60">smartech ↔ <span className="text-edred font-semibold">Edwards</span></span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Hero cell — 2006 (col-span-2, row-span-2) */}
                <div className="bento-hero col-span-2 row-span-2 relative bg-white border hair p-4 md:p-5 flex flex-col justify-between min-h-[180px] md:min-h-[210px] overflow-hidden">
                  <div className="flex items-baseline justify-between">
                    <div className="kpi-eyebrow">HQ Entry</div>
                    <div className="kpi-meta">since</div>
                  </div>
                  <div>
                    <div className="display text-[56px] md:text-[78px] leading-[0.9] tracking-[-0.04em] tabular">
                      <Counter to={2006} duration={2400} decimals={0} />
                    </div>
                    <div className="mt-3 text-[11.5px] dim leading-snug">
                      Since 2006 Joined <span className="text-edred font-semibold">Edwards</span> Korea
                    </div>
                  </div>
                  <span className="absolute top-3 right-3 text-[9px] mono dim opacity-40 tracking-[0.14em]">01 / 04</span>
                  {/* subtle bottom-right glow */}
                  <span className="absolute -right-12 -bottom-12 w-40 h-40 rounded-full bg-edred/5 blur-2xl pointer-events-none" />
                </div>

                {/* Small cell — Field Years */}
                <div className="bento-cell relative bg-white border hair p-4 flex flex-col justify-between min-h-[100px]">
                  <div className="kpi-eyebrow">Years</div>
                  <div>
                    <div className="display text-[32px] leading-none tabular">
                      <Counter to={15} duration={1300} />
                      <span className="text-[20px] opacity-50">+</span>
                    </div>
                    <div className="text-[10px] mt-1.5 dim leading-snug">진공 기술 업력</div>
                  </div>
                </div>

                {/* Small cell — Product Lineup */}
                <div className="bento-cell relative bg-white border hair p-4 flex flex-col justify-between min-h-[100px]">
                  <div className="kpi-eyebrow">Product Lineup</div>
                  <div>
                    <div className="display text-[32px] leading-none tabular">
                      <Counter to={498} duration={1800} />
                      <span className="text-[20px] opacity-60">+</span>
                    </div>
                    <div className="text-[10px] mt-1.5 dim leading-snug">취급품목</div>
                  </div>
                </div>

                {/* Wide bottom — Authorization (col-span-3, Edwards red) */}
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
      <section id="solution" className="py-28 border-b hair">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-12 gap-6 items-end mb-16">
            <div className="col-span-12 lg:col-span-7">
              <div className="mono text-[11px] dim mb-4">— 01 · TOTAL SOLUTION</div>
              <h2 className="section-title display">
                판매로 시작해,<br />
                <span className="italic text-edred">운전 수명 내내</span><br />
                함께합니다.
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:pl-6 lg:border-l hair">
              <p className="text-[15px] leading-[1.75] text-[#2a2823]">
                처음 전화하신 고객이 몇 년 뒤에 또 전화를 주십니다. 장비를 바꿀 때, 문제가 생겼을 때,
                자리에서 물러나며 후임자를 소개할 때. 그게 스마텍이 붙잡고 싶은 관계입니다.
                펌프 선정에서 설치, 유지보수, 부품 조달까지 — 판매로 시작해 운전 수명 내내 같은 전화번호로 이어집니다.
              </p>
            </div>
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
                <p className="mt-6 text-[13.5px] leading-[1.7] opacity-90 max-w-[32ch]">{hiEd(step.desc, i === 2)}</p>
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
      <section className="border-b hair">
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
                  딜러 · OEM · 법인<br />
                  <span className="italic text-edred">전용 견적</span>
                </h3>
                <p className="mt-8 text-[14.5px] leading-[1.75] opacity-90">
                  발주 규모와 거래 이력에 따라 가격 조건이 달라집니다. <span className="text-edred font-semibold">Edwards</span> 코리아에서
                  5년을 재직한 대표가 기술 컨설팅부터 납기 조율까지 직접 받습니다.
                  소모품과 메이저 파트는 국내 재고로 상시 확보합니다.
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
                      <div>등급별 가격표</div>
                      <div className="text-[11px] opacity-55 mt-1">승인 완료 후 자동 노출</div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-edred shrink-0 mt-0.5">→</span>
                    <div>
                      <div>사양서 기반 모델 제안</div>
                      <div className="text-[11px] opacity-55 mt-1">공정 요건에 맞춘 구성</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* B2C */}
          <div className="p-10 md:p-16 relative overflow-hidden">
            <div className="mono text-[11px] dim">— 04b · B2C · RESEARCHER</div>
            <h3 className="display text-[56px] md:text-[72px] leading-[0.95] mt-4">
              어떤 펌프를 골라야 할지<br />
              <span className="italic">모르겠다면,</span><br />
              <span className="text-edred">그냥 물어보세요.</span>
            </h3>
            <p className="mt-8 text-[14.5px] leading-[1.75] max-w-[44ch]">
              실험 목적, 도달 진공도, 설치 환경, 예산 — 이 네 가지면 됩니다.
              사양서 숫자가 낯설어도 괜찮습니다. 쉬운 말로 다시 풀어 드립니다.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-3 max-w-[500px]">
              {["실험 목적","도달 진공도","설치 환경","예산"].map((label, i) => (
                <div key={i} className="border hair p-4">
                  <div className="mono text-[10px] dim">0{i + 1} / 4</div>
                  <div className="text-[13px] mt-2">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="#ai" className="bg-ink text-paper px-6 py-4 text-sm hover:bg-edred transition-colors">
                AI로 최적 펌프 추천 →
              </Link>
              <Link href="#contact" className="border border-ink px-6 py-4 text-sm hover:bg-ink hover:text-paper transition-colors">
                전문가에게 직접 묻기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ AI CHAT ═══════════════ */}
      <section id="ai" className="py-28 border-b hair bg-paper">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5">
            <div className="mono text-[11px] dim mb-4">— 05 · AI CONSULT</div>
            <h2 className="section-title display">
              공정 조건을 입력하면<br />
              <span className="italic text-edred">최적 펌프</span>를 추천합니다.
            </h2>
            <p className="mt-6 text-[15px] leading-[1.75] text-[#2a2823] max-w-[48ch]">
              진공도, 배기량, 가스 종류, 오일프리 여부 — 공정 조건을 알려주시면
              <span className="text-edred font-semibold">Edwards</span> 라인업 중 후보 모델을 AI가 먼저 좁혀 드립니다.{" "}
              <span className="dim">최종 사양은 스마텍 담당자가 한 번 더 확인한 뒤 제안합니다.</span>
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
              기록이<br />
              <span className="italic text-edred">먼저</span>입니다.
            </h2>
            <p className="mt-8 text-[15px] leading-[1.75] text-[#2a2823] max-w-[44ch]">
              스마텍의 이야기는 2006년에 시작됩니다. 그 해 대표는 <span className="text-edred font-semibold">Edwards</span> 코리아에 합류해
              5년을 재직하며 기술영업으로 일했습니다. 사무실 책상이 아니라 고객사 현장에서, 카탈로그가 아니라 실제 공정 앞에서요.
            </p>
            <p className="mt-5 text-[15px] leading-[1.75] text-[#2a2823] max-w-[44ch]">
              2011년 창업. 2018년 법인 전환. 그 사이에 바뀐 것은 규모뿐입니다.
              스마텍이 지금도 가장 소중하게 여기는 건 한 가지입니다 — 한 번 맺은 거래처와의 신뢰를
              끝까지 지켜내는 것.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <div className="border-l hair pl-8 space-y-10">
              {TIMELINE.map((item, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-10 top-1 w-3 h-3 rounded-full ${i === 0 || i === TIMELINE.length - 1 ? "bg-edred animate-pulse" : "bg-ink"}`} />
                  <div className="mono text-[11px] dim">{item.year}</div>
                  <div className="display text-[30px] leading-[1.1] mt-1">{hiEd(item.title)}</div>
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
          <div className="display text-[clamp(31px,4.25vw,68px)] leading-[1.05]">
            기술은 <span className="text-edred font-semibold">Edwards</span>가 만들었습니다.<br />
            신뢰는 <span className="text-edred italic">스마텍</span>이 쌓았습니다.
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
    desc: "어떤 공정에 어느 진공 영역이 필요한지부터 함께 분석합니다. 축적된 기술 노하우와 다양한 산업 현장 경험을 바탕으로, 고객의 공정 조건에 가장 알맞은 최적의 솔루션을 제안합니다.",
  },
  {
    title: "제품 선정",
    desc: "오일·드라이·터보·부스터 전 라인업 중 공정 요건에 정확히 부합하는 최적 구성을 제안합니다. 불필요한 비용 없이, 공정 신뢰성을 충족하는 사양을 찾습니다.",
  },
  {
    title: "정품제품공급",
    desc: "스마텍은 Edwards 정품만을 공식 유통 경로를 통해 공급합니다. 제품의 출처와 품질, 보증까지 책임집니다.",
  },
  {
    title: "설치 & 시운전",
    desc: "납품으로 끝나지 않습니다. 현장 설치, 배관 구성, 초기 시운전 및 성능 확인까지 책임집니다.",
  },
  {
    title: "정기 유지보수",
    desc: "PM 스케줄 수립부터 현장 서비스 투입까지. 장비가 멈추기 전에 스마텍이 먼저 움직입니다.",
  },
  {
    title: "정품수리부품공급",
    desc: "소모품과 메이저 파트는 국내 재고를 보유하고 있어 최단 납기로 공급 가능합니다. 그 외 부품도 직접 챙겨 드립니다.",
  },
];

const TIMELINE = [
  { year: "2006", title: "Edwards 코리아 합류", desc: "기술영업으로 5년, 수많은 고객 현장과 공정 앞에서 진공을 읽는 감각을 쌓은 시간." },
  { year: "2011", title: "스마텍 창업", desc: "Edwards 공식 대리점으로, '기술하는 파트너'로 출발했습니다." },
  { year: "2018", title: "(주)스마텍 법인 전환", desc: "규모보다 신뢰를 먼저 키우자 — 그렇게 커진 이름입니다." },
  { year: "NOW", title: "거래처의 신뢰를 지켜가는 중", desc: "오래된 거래처가 지금도 먼저 전화해 오는 것, 그게 스마텍의 가장 큰 자랑입니다." },
];
