import Link from "next/link";
import HeroChat from "@/components/HeroChat";
import FeaturedProducts from "@/components/FeaturedProducts";
import Industries from "@/components/Industries";

export default function Home() {
  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden noisebg">
        <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-24 relative">
          {/* Corner meta */}
          <div className="flex justify-between text-[11px] mono dim mb-10">
            <div>EDWARDS VACUUM · KOREA OFFICIAL</div>
            <div className="hidden md:block">N37.5° · E127.0° / SEOUL, KR</div>
            <HeroClock />
          </div>

          <div className="grid grid-cols-12 gap-6 items-end">
            {/* Headline */}
            <div className="col-span-12 lg:col-span-7">
              <div className="text-[12px] mono dim mb-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-edred inline-block animate-pulse" />
                <span>진공이 멈추면, 현장 전체가 멈춥니다.</span>
              </div>
              <h1 className="hero-h1 display">
                진공의 <span className="italic text-edred">깊이,</span><br />
                신뢰의 두께.
              </h1>
              <p className="mt-8 max-w-xl text-[15px] leading-[1.7] text-[#2a2823]">
                스마텍은 Edwards Vacuum 한국 공식 대리점입니다.
                대표가 2006년 Edwards 본사에서 시작한 이 일을, 지금도 직접 하고 있습니다.
                펌프 하나를 고를 때 틀리면 라인 전체가 멈춥니다. 그래서 우리는 판매로 끝내지 않습니다.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
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
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] mono dim">
                <span>CALL  031–000–0000</span>
                <span>·</span>
                <span>MAIL  info@smartech.co.kr</span>
                <span>·</span>
                <span>영업일 기준 1일 내 회신</span>
              </div>
            </div>

            {/* Trust card grid */}
            <div className="col-span-12 lg:col-span-5">
              <div className="border hair bg-white/60 backdrop-blur-sm relative">
                <div className="px-6 py-3 border-b hair flex items-center justify-between text-[11px] mono">
                  <span>TRUST / 06</span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-edred rounded-full inline-block" />
                    LIVE
                  </span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-y hair">
                  <div className="p-5">
                    <div className="text-[10px] mono dim">HQ ENTRY</div>
                    <div className="display text-[54px] leading-none mt-1 tabular">2006</div>
                    <div className="text-[11px] mt-2 dim">Edwards Vacuum 본사 입사</div>
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] mono dim">FIELD YEARS</div>
                    <div className="display text-[54px] leading-none mt-1 tabular">15+</div>
                    <div className="text-[11px] mt-2 dim">Edwards 진공 기술 업력</div>
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] mono dim">RV PUMP SOLD</div>
                    <div className="display text-[54px] leading-none mt-1 tabular">40만 <span className="text-[18px] align-top">대+</span></div>
                    <div className="text-[11px] mt-2 dim">전 세계 RV 펌프 누적 판매</div>
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] mono dim">STP MAGLEV</div>
                    <div className="display text-[40px] leading-none mt-2">
                      10<sup className="text-[22px]">-10</sup>
                      <span className="text-[18px] ml-2 mono">mbar</span>
                    </div>
                    <div className="text-[11px] mt-3 dim">도달 진공도 — 반도체·우주</div>
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] mono dim">STP TURBO</div>
                    <div className="display text-[54px] leading-none mt-1 tabular">32%</div>
                    <div className="text-[11px] mt-2 dim">고유량 에너지 절감률</div>
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] mono dim">nXDS DRY</div>
                    <div className="display text-[40px] leading-none mt-1">×2.0</div>
                    <div className="text-[11px] mt-2 dim">팁씰 수명 (기존 대비)</div>
                  </div>
                </div>
                <div className="px-6 py-3 border-t hair text-[11px] mono dim flex justify-between">
                  <span>수치는 제품의 스펙이지만, 신뢰는 사람이 만듭니다.</span>
                  <span>— SMARTECH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vacuum strip */}
          <div className="mt-16 relative h-16 border-t hair">
            <div className="absolute left-0 top-3 text-[10px] mono dim">ATMOSPHERIC / 10³ mbar</div>
            <div className="absolute right-0 top-3 text-[10px] mono dim">ULTRA HIGH VAC / 10⁻¹⁰ mbar</div>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-ink/20" />
            <div className="absolute left-[8%]  bottom-2 text-[10px] mono dim">LOW</div>
            <div className="absolute left-[30%] bottom-2 text-[10px] mono dim">MEDIUM</div>
            <div className="absolute left-[58%] bottom-2 text-[10px] mono dim">HIGH</div>
            <div className="absolute left-[82%] bottom-2 text-[10px] mono text-edred">ULTRA HIGH</div>
          </div>
        </div>
      </section>

      {/* ═══════════════ INDUSTRIES MARQUEE ═══════════════ */}
      <section className="border-y hair">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center gap-8">
          <div className="text-[11px] mono dim shrink-0">TRUSTED ACROSS INDUSTRIES —</div>
          <div className="mrqw flex-1">
            <div className="marquee-track inline-flex gap-10 whitespace-nowrap">
              {[
                "반도체","Semiconductor","OLED","Fusion · ITER","제약 동결건조",
                "Aerospace","이차전지","R&D · University","수소에너지","Solar",
                "반도체","Semiconductor","OLED","Fusion · ITER","제약 동결건조",
                "Aerospace","이차전지","R&D · University","수소에너지","Solar",
              ].map((label, i) => (
                <span key={i} className={`display text-2xl ${i % 2 === 1 ? "italic" : ""}`}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TOTAL SOLUTION ═══════════════ */}
      <section id="solution" className="py-28 border-b hair">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-12 gap-6 mb-16">
            <div className="col-span-12 lg:col-span-5">
              <div className="mono text-[11px] dim mb-4">— 01 · TOTAL SOLUTION</div>
              <h2 className="section-title display">
                판매로 시작해,<br />
                <span className="italic text-edred">운전 수명 내내</span> 함께합니다.
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:col-start-8 mt-4">
              <p className="text-[15px] leading-[1.75] text-[#2a2823]">
                처음 연락해 온 고객이 몇 년 후 또 전화합니다. 장비를 바꿀 때, 문제가 생겼을 때,
                후임자를 소개할 때. 그게 스마텍이 원하는 관계입니다.
                펌프 선정에서 설치, 유지보수, 부품 조달까지 — 판매로 시작해서 운전 수명 내내 함께합니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l hair">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`border-r border-b hair p-8 group hover:bg-ink hover:text-paper transition-colors ${
                  i === STEPS.length - 1 ? "bg-edred text-paper hover:bg-ink" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="mono text-[11px] opacity-70">STEP / {String(i + 1).padStart(2, "0")}</div>
                  <div className="mono text-[11px] opacity-70">{i === STEPS.length - 1 ? "∞" : "→"}</div>
                </div>
                <div className="display text-[44px] leading-none mt-4">{step.title}</div>
                <p className="mt-6 text-[13.5px] leading-[1.7] opacity-90 max-w-[32ch]">{step.desc}</p>
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
                Edwards 전 라인업,<br />
                <span className="italic text-edred">한 지붕 아래</span>.
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:col-start-8 mt-4">
              <p className="text-[15px] leading-[1.75] text-[#2a2823]">
                오일 로터리 베인부터 터보분자, 반도체 드라이, 게이지, 리크 디텍터까지.
                공정 조건에 맞게 조합해 제안합니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATS.map((c, i) => (
              <Link
                key={i}
                href="/products"
                className="group relative border hair bg-white p-6 hover:bg-ink hover:text-paper transition-colors overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="mono text-[10.5px] opacity-60">{String(i + 1).padStart(2, "0")} / {CATS.length}</div>
                  <div className="mono text-[10.5px] opacity-60">{c.code}</div>
                </div>
                <div className="mt-5 mb-6 aspect-[4/3] relative overflow-hidden border hair"
                  style={{
                    background: "repeating-linear-gradient(135deg, rgba(0,0,0,0.04) 0 6px, transparent 6px 12px), radial-gradient(circle at 50% 50%, rgba(192,0,32,0.08), transparent 60%), #F6F4EF",
                  }}>
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet">
                    <circle cx="100" cy="75" r="42" fill="none" stroke="#0B0B0C" strokeWidth="1" />
                    <circle cx="100" cy="75" r="22" fill="none" stroke="#0B0B0C" strokeWidth="1" />
                    <g className="rotor">
                      <line x1="100" y1="35" x2="100" y2="115" stroke="#c00020" strokeWidth="1.5" />
                      <line x1="60" y1="75" x2="140" y2="75" stroke="#c00020" strokeWidth="1.5" />
                    </g>
                    <circle cx="100" cy="75" r="3" fill="#c00020" />
                  </svg>
                  <div className="absolute left-2 bottom-2 mono text-[10px] opacity-60">PRODUCT SHOT · TBD</div>
                </div>
                <div className="display text-[26px] leading-[1.1]">{c.title}</div>
                <div className="mt-2 text-[13.5px] leading-[1.5] opacity-90">{c.hl}</div>
                <div className="mt-3 mono text-[11px] opacity-70">{c.sub}</div>
                <p className="mt-3 text-[12.5px] leading-[1.6] opacity-80">{c.body}</p>
                <div className="mt-4 pt-3 border-t border-dashed hair text-[11px] opacity-70">
                  <span className="mono">APPS — </span>{c.apps}
                </div>
              </Link>
            ))}
          </div>

          {/* Featured products */}
          <div className="mt-20">
            <div className="flex items-end justify-between mb-6 border-b hair pb-4">
              <div>
                <div className="mono text-[11px] dim">— FEATURED</div>
                <div className="display text-[32px] leading-none mt-1">주요 제품</div>
              </div>
              <Link href="/products" className="text-[12.5px] underline-red pb-0.5">
                전체 카탈로그 →
              </Link>
            </div>
            <FeaturedProducts />
          </div>
        </div>
      </section>

      {/* ═══════════════ B2B / B2C ═══════════════ */}
      <section className="border-b hair">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-x hair">
          {/* B2B */}
          <div className="bg-ink text-paper p-10 md:p-16">
            <div className="mono text-[11px] opacity-70">— 04a · B2B</div>
            <h3 className="display text-[56px] md:text-[72px] leading-[0.95] mt-4">
              딜러 · OEM · 법인<br />
              <span className="italic text-edred">전용 견적</span>
            </h3>
            <p className="mt-8 text-[14.5px] leading-[1.75] opacity-90 max-w-[44ch]">
              발주 규모와 거래 이력에 따라 가격 조건이 달라집니다. Edwards 본사 출신이
              기술 컨설팅부터 납기 조율까지 직접 담당합니다. 긴급 부품은 재고를 상시 보유합니다.
            </p>
            <ul className="mt-8 space-y-2 text-[13px] opacity-90">
              <li className="flex gap-3"><span className="text-edred">→</span> 정품 공식 유통 경로</li>
              <li className="flex gap-3"><span className="text-edred">→</span> 등급별 가격표 (승인 후 노출)</li>
              <li className="flex gap-3"><span className="text-edred">→</span> 사양서 기반 모델 제안</li>
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/auth/register" className="bg-edred text-paper px-6 py-4 text-sm hover:bg-edred2 transition-colors">
                B2B 회원가입 → 가격 확인
              </Link>
              <Link href="#contact" className="border border-paper/30 px-6 py-4 text-sm hover:bg-paper hover:text-ink transition-colors">
                견적 직접 문의 →
              </Link>
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
              실험 목적, 도달 진공도, 설치 환경, 예산. 이 네 가지면 충분합니다.
              사양서 숫자가 낯설어도 괜찮습니다. 저희가 번역해 드립니다.
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
              진공도, 배기량, 가스 종류, 오일프리 여부 등 공정 조건을 입력하시면
              Edwards 라인업 중 최적 모델을 AI가 1차 분석합니다.{" "}
              <span className="dim">최종 사양 확정은 스마텍 기술 담당자가 검토합니다.</span>
            </p>
            <div className="mt-6 mono text-[11px] dim">
              ※ 이 추천은 AI 1차 분석 결과이며, 실제 공정 적용 전 엔지니어 검토를 권장합니다.
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
              스마텍의 이야기는 2006년에 시작됩니다. 대표는 그 해 Edwards Vacuum 본사에 신입으로
              입사했습니다. 설계 도면이 아니라 현장에서, 매뉴얼이 아니라 엔지니어의 손끝에서 5년을 보냈습니다.
            </p>
            <p className="mt-5 text-[15px] leading-[1.75] text-[#2a2823] max-w-[44ch]">
              2011년 창업. 2018년 법인 전환. 그 사이에 바뀐 것은 규모뿐입니다.
              지금도 스마텍이 가장 소중하게 여기는 건 하나입니다 — 한번 맺은 거래처와의 신뢰를 끝까지 지키는 것.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <div className="border-l hair pl-8 space-y-10">
              {TIMELINE.map((item, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-10 top-1 w-3 h-3 rounded-full ${i === 0 || i === TIMELINE.length - 1 ? "bg-edred animate-pulse" : "bg-ink"}`} />
                  <div className="mono text-[11px] dim">{item.year}</div>
                  <div className="display text-[30px] leading-[1.1] mt-1">{item.title}</div>
                  <p className="mt-2 text-[13.5px] dim">{item.desc}</p>
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
          <h2 className="display text-[clamp(40px,8vw,130px)] leading-[0.95]">
            수량, 납기, 커스텀 사양이<br />
            <span className="italic text-edred">있으신가요?</span>
          </h2>

          <div className="grid grid-cols-12 gap-6 mt-16">
            <div className="col-span-12 lg:col-span-7">
              <div className="border border-paper/20">
                <div className="grid grid-cols-2 divide-x divide-paper/20">
                  <a href="tel:0310000000" className="p-8 hover:bg-edred transition-colors group block">
                    <div className="mono text-[11px] opacity-70">CALL</div>
                    <div className="display text-[44px] leading-none mt-3 tabular">031·000·0000</div>
                    <div className="text-[12px] mt-3 opacity-70">영업일 09:00 — 18:00 · 대표 직통</div>
                  </a>
                  <a href="mailto:info@smartech.co.kr" className="p-8 hover:bg-edred transition-colors group block">
                    <div className="mono text-[11px] opacity-70">MAIL</div>
                    <div className="display text-[44px] leading-none mt-3">info@</div>
                    <div className="text-[12px] mt-3 opacity-70">영업일 기준 1일 내 회신</div>
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
                <li className="flex gap-3"><span className="text-edred">01</span> 대표가 직접 1차 상담을 받습니다</li>
                <li className="flex gap-3"><span className="text-edred">02</span> 사양서를 보내주시면 적합 모델을 제안합니다</li>
                <li className="flex gap-3"><span className="text-edred">03</span> 구매 확정 전 기술 문의도 환영합니다</li>
                <li className="flex gap-3"><span className="text-edred">04</span> 국내 재고 부품은 당일 출고 가능합니다</li>
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
          <div className="display text-[clamp(36px,5vw,80px)] leading-[1.05]">
            기술은 <span className="italic">Edwards</span>가 만들었습니다.<br />
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
                <div>✉ info@smartech.co.kr</div>
                <div>☏ 031–000–0000</div>
                <div>(주)스마텍</div>
                <div>Edwards Vacuum 공식 대리점</div>
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
    desc: "어떤 공정에 어느 진공 영역이 필요한지부터 함께 분석합니다. Edwards 본사 경력에서 비롯된 엔지니어링 역량으로 최적 사양을 정의합니다.",
  },
  {
    title: "제품 선정",
    desc: "오일·드라이·터보·부스터 전 라인업 중 공정 요건에 맞는 구성을 제안합니다. 과사양과 과소사양 모두 피합니다.",
  },
  {
    title: "공식 공급",
    desc: "Edwards Vacuum 한국 공식 대리점으로서 정품을 정상 유통 경로로 공급합니다. 정품 여부가 걱정되지 않습니다.",
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
    title: "정품 부품 즉시 조달",
    desc: "주요 소모품과 교체 부품을 국내 재고로 보유합니다. 해외 발주 대기 없이 즉시 공급합니다.",
  },
];

const CATS = [
  {
    code: "RV · E2M · E2S · nES",
    title: "오일 로터리 베인 펌프",
    hl: "전 세계 40만 대. 오일 로터리 진공의 기준점.",
    sub: "3–12 m³/h · 48 dB(A) · 수증기 220 g/hr",
    body: "듀얼 모드 선택과 0.4초 안티 석백 보호로 공정 재현성과 장비 수명을 동시에 잡습니다.",
    apps: "분석 장비 · 진공 오븐 · 코팅 · 화학·제약",
  },
  {
    code: "nXDS · XDS",
    title: "드라이 스크롤 펌프",
    hl: "오일 없이, 오염 없이.",
    sub: "6–20 m³/h · 52 dB(A) 미만 · 팁씰 ×2",
    body: "52 dB(A) 미만 정숙 운전 — 교수님 방 옆 실험실에 두어도 괜찮습니다. Edwards 독자 팁씰 설계.",
    apps: "질량분석기 · 광학 코팅 · 반도체 연구 · 동결건조",
  },
  {
    code: "EH 시리즈",
    title: "루츠 부스터 펌프",
    hl: "주펌프가 닿지 못하는 곳까지.",
    sub: "중진공 1–100 mbar · 처리량 ×수십",
    body: "주펌프와 조합하면 중진공 영역에서 처리량이 수십 배 향상됩니다.",
    apps: "화학 반응기 · 금속 열처리 · 대형 진공 챔버",
  },
  {
    code: "GXS",
    title: "산업용 드라이 스크류",
    hl: "소음이 없고, 이물이 없고, 멈추지 않습니다.",
    sub: "비접촉 장수명 씰 · 온보드 자동 제어",
    body: "자동 시작·정지·세척·절전 기능이 내장되어 별도 외부 제어 시스템이 필요 없습니다.",
    apps: "화학 공정 · 제약·바이오 · 식품 진공 포장",
  },
  {
    code: "EXS",
    title: "부식성 환경 드라이 스크류",
    hl: "부식성 환경에서 쓰는 드라이는 따로 있습니다.",
    sub: "EXS160–750 · 반응성 가스 환경 특화",
    body: "GXS와 동일 기술 기반. 화학적 침식이 빈번한 공정에서도 장기간 안정 성능.",
    apps: "석유화학 · 에칭·세정 · 합성 반응기",
  },
  {
    code: "iXH · nXRi · iXL",
    title: "반도체 드라이 펌프",
    hl: "공정이 멈추면 라인 전체가 멈춥니다.",
    sub: "CVD · Etch · 이온주입 · 예지보전 내장",
    body: "각 공정의 요구 조건을 개별 최적화한 전용 라인업. 비계획 다운타임을 사전 차단.",
    apps: "반도체 · OLED 증착 · 확산·산화",
  },
  {
    code: "nEXT",
    title: "터보분자펌프 — nEXT",
    hl: "ITER 핵융합실험로가 선택했습니다.",
    sub: "완전 자기부상 · 방사선 내성",
    body: "회전체가 접촉하지 않아 탄화수소 오염 원천 차단. 초저진동으로 정밀 분석 보호.",
    apps: "핵융합 · XPS · 전자빔 · 우주 시뮬레이션",
  },
  {
    code: "STP Maglev",
    title: "터보분자펌프 — STP Maglev",
    hl: "10⁻¹⁰ mbar 세계. 챔버 위에 바로 올립니다.",
    sub: "300–4,500 l/s · 컨트롤러+전원 통합",
    body: "온-챔버 솔루션. 별도 전장 랙 불필요, 설계 자유도 ↑, 고유량 에너지 32% 절감.",
    apps: "이온주입 · 전자빔 용접 · 가속기 · 우주부품 인증",
  },
  {
    code: "APG · AIM · WRG · P4/P5",
    title: "게이지",
    hl: "대기압부터 극한 고진공까지 읽습니다.",
    sub: "피라니 · 이온화 · 복합 · 디스플레이",
    body: "APG200 피라니, AIM200 이온화, WRG200 복합 센서, P4/P5 디스플레이 — 공정의 전 구간 커버.",
    apps: "공정 인터록 · 펌프 검증 · 연구 측정",
  },
  {
    code: "ELD500",
    title: "헬륨 리크 디텍터",
    hl: "10⁻¹² mbar·l/s. 사람이 못 찾는 누설을 잡습니다.",
    sub: "스니퍼 + 챔버 리크 · 교육 + 캘리브 기본",
    body: "현장 사용법 교육과 정기 캘리브레이션 서비스를 기본 제공합니다.",
    apps: "자동차 · 의료기기 · 냉매 · 항공우주 · 반도체",
  },
  {
    code: "EMF · Ultra 19 · KF/ISO",
    title: "소모품 & 액세서리",
    hl: "정품이 아니면, 성능을 보장할 수 없습니다.",
    sub: "EMF 오일 미스트 · 전용 오일 · KF/ISO 피팅",
    body: "Edwards 정품 소모품을 국내 재고로 보유. 정품 사용이 보증의 전제 조건입니다.",
    apps: "전 라인 공통 유지보수",
  },
];

const TIMELINE = [
  { year: "2006", title: "Edwards Vacuum 본사 입사", desc: "글로벌 진공 기술의 심장부에서 신입으로 시작" },
  { year: "2011", title: "스마텍 창업", desc: "Edwards 공식 대리점으로 '기술하는 파트너' 출발" },
  { year: "2018", title: "(주)스마텍 법인 전환", desc: "규모보다 신뢰를 먼저 키운 성장" },
  { year: "NOW", title: "거래처 신뢰를 지켜가는 중", desc: "오래된 거래처가 여전히 먼저 연락해 오는 것, 그것이 스마텍의 가장 큰 자랑입니다." },
];
