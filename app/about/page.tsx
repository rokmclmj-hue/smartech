import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "회사 소개 — 스마텍 | Edwards Vacuum 공식 대리점",
  description:
    "2006년 Edwards 코리아 합류, 2011년 창업. 2018 Edwards Korea Gold Award 수상. 진공펌프 공급·수리·기술지원 일체를 직접 운영하는 공식 대리점.",
  alternates: { canonical: "https://smartechvacuum.com/about" },
  openGraph: {
    title: "회사 소개 — 스마텍",
    description:
      "Edwards Vacuum 공식 Gold Award 대리점. 2006년부터 쌓아온 현장 기술력으로 공급·수리·기술지원.",
    url: "https://smartechvacuum.com/about",
    type: "website",
    siteName: "스마텍",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "회사 소개 — 스마텍",
    description: "Edwards Vacuum 공식 Gold Award 대리점.",
  },
};

// ── JSON-LD ──────────────────────────────────────────────
const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: "https://smartechvacuum.com" },
    { "@type": "ListItem", position: 2, name: "회사 소개", item: "https://smartechvacuum.com/about" },
  ],
};

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://smartechvacuum.com/#organization",
  name: "스마텍",
  alternateName: "(주)스마텍",
  url: "https://smartechvacuum.com",
  foundingDate: "2011",
  award: "Edwards Vacuum Korea Distributor Gold Award 2018",
  description:
    "Edwards Vacuum 한국 공식 대리점. 2006년 Edwards 코리아 합류, 2011년 창업. 진공펌프 전 라인업 공급·수리·기술지원.",
  telephone: "031-204-7170",
  email: "info@smartechvacuum.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "신원로55, 테크트리지식산업센터 907호",
    addressLocality: "수원시 영통구",
    addressRegion: "경기도",
    addressCountry: "KR",
  },
};

// ── 데이터 ───────────────────────────────────────────────
const STATS = [
  { value: "2006", label: "Edwards 기술 합류" },
  { value: "15+",  label: "창업 연차" },
  { value: "25+",  label: "취급 모델 군" },
  { value: "20+",  label: "납품 산업 분야" },
];

const TIMELINE = [
  {
    year: "2006",
    title: "Edwards 코리아 합류",
    desc: "기술영업으로 시작. 반도체·디스플레이·연구기관 현장을 누비며 진공 공정을 직접 몸으로 익힌 5년.",
  },
  {
    year: "2011",
    title: "(주)스마텍 창업",
    desc: "Edwards Vacuum 공식 대리점으로 출발. 제품 공급·수리·기술지원을 직접 운영하는 구조로 설립.",
  },
  {
    year: "2018",
    title: "Edwards Korea Gold Award 수상",
    desc: "Edwards Korea Distributor Rewards Program — Gold Class 인증. 판매 실적과 서비스 품질 양면에서 공식 인정.",
  },
  {
    year: "2024",
    title: "천안 수리센터 신설",
    desc: "수원 본사에 더해 충남 천안에 전문 수리·오버홀 센터 개설. 전국 A/S 대응 체계 완성.",
  },
  {
    year: "2025",
    title: "디지털 플랫폼 오픈",
    desc: "온라인 견적·수리접수·AI 상담 시스템 론칭. 고객이 24시간 스스로 접수하고 진행 현황을 확인하는 플랫폼.",
  },
];

const GALLERY = [
  {
    src: "/images/about/gold-award.png",
    alt: "Edwards Korea Distributor Gold Award 수상 — 2019년 1월 Edwards Korea 공식 뉴스레터",
    label: "Gold Award 수상",
    sub: "Edwards Korea · 2018 Distributor Rewards Program",
    span: true,
  },
  {
    src: "/images/about/product-showcase.png",
    alt: "Edwards Korea nGX 신제품 쇼케이스 참가 — SK하이닉스·OEM·채널 파트너 초청",
    label: "nGX 신제품 쇼케이스",
    sub: "Edwards Korea · Industrial Vacuum 팀 주관",
    span: false,
  },
  {
    src: "/images/about/partner-training.png",
    alt: "Edwards Korea 채널 파트너 제품 교육 — nXDS·nXRi·nEXT 라인업 심화 교육",
    label: "채널 파트너 제품 교육",
    sub: "Edwards Korea · General Vacuum 팀 주관",
    span: false,
  },
  {
    src: "/images/about/partner-meeting.png",
    alt: "Edwards Korea Scientific Vacuum 팀 채널 파트너 간담회",
    label: "채널 파트너 간담회",
    sub: "Edwards Korea · Scientific Vacuum 팀",
    span: false,
  },
];

const FAQ_ITEMS = [
  {
    q: "스마텍은 Edwards Vacuum 공식 대리점인가요?",
    a: "네. 2006년 Edwards 코리아 합류, 2011년 창업 이후 공식 대리점 지위를 유지하고 있습니다. 2018년 Edwards Korea Distributor Gold Award를 수상했으며, 정품 부품과 공식 기술 지원을 직접 받습니다.",
  },
  {
    q: "서울·수도권 외 지역도 서비스가 가능한가요?",
    a: "가능합니다. 수원 본사(경기도)와 천안 수리센터(충남)를 운영하며, 필요 시 현장 방문 서비스도 제공합니다. 문의: 031-204-7170.",
  },
  {
    q: "Edwards 외 타 브랜드 진공펌프 수리도 가능한가요?",
    a: "제품 공급은 Edwards 전 라인업에 한합니다. 수리·오버홀은 Pfeiffer·Leybold·BOC Edwards 등 다양한 산업용 펌프도 상담 가능합니다.",
  },
  {
    q: "수리 후 품질 보증은 어떻게 됩니까?",
    a: "Edwards 정품 부품으로만 작업하며, 오버홀 완료 후 검사성적서를 발행합니다. 보증 기간은 모델과 작업 내용에 따라 달라지며, 접수 시 상세히 안내드립니다.",
  },
  {
    q: "온라인으로 수리 접수 및 견적이 가능한가요?",
    a: "네. 수리접수 페이지에서 제품 사진을 업로드하면 AI가 모델을 자동 인식하고 즉시 참고 견적을 제공합니다. 접수 후 담당자가 최종 금액을 확정합니다.",
  },
];

// ── 컴포넌트 ─────────────────────────────────────────────
export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />

      {/* ══════════════ HERO ══════════════ */}
      <section className="border-b hair bg-paper">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-12 md:pb-20">
          <div className="mono text-[11px] dim tracking-widest mb-4">— ABOUT SMARTECH</div>
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 lg:col-span-7">
              <h1 className="display text-[clamp(36px,5.5vw,80px)] leading-[1.0] tracking-tight">
                진공 기술의<br />
                <span className="text-edred italic">정직한</span> 파트너
              </h1>
              <p className="mt-6 text-[16px] md:text-[18px] leading-[1.7] max-w-[52ch] text-[#2a2823]">
                2006년 <span className="font-semibold text-edred">Edwards</span> 코리아에서 시작한 현장 경험이,
                2011년 스마텍 창업의 뿌리가 됐습니다.
                제품을 팔기 전에 현장을 이해하는 사람들이 운영합니다.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="border hair bg-ink text-paper p-6 md:p-8">
                <div className="mono text-[9px] tracking-widest text-paper/40 mb-3">OFFICIAL PARTNER</div>
                <div className="display text-[28px] md:text-[32px] leading-tight text-edred mb-1">
                  Edwards
                </div>
                <div className="display text-[28px] md:text-[32px] leading-tight mb-4">
                  Vacuum Korea
                </div>
                <div className="text-[12px] text-paper/60 leading-relaxed">
                  공식 인증 대리점 · Since 2011<br />
                  Gold Award Distributor · 2018
                </div>
                <div className="mt-5 pt-4 border-t border-paper/10 mono text-[11px] text-paper/50">
                  031-204-7170
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section className="border-b hair">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 hair">
            {STATS.map((s) => (
              <div key={s.label} className="px-8 py-10 flex flex-col gap-1">
                <div className="display text-[clamp(36px,4vw,56px)] leading-none tabular">{s.value}</div>
                <div className="mono text-[11px] text-dim mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ GOLD AWARD + 갤러리 ══════════════ */}
      <section className="border-b hair py-16 md:py-24 bg-paper">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="mono text-[11px] dim tracking-widest mb-3">— 01 · EDWARDS PARTNERSHIP</div>
          <div className="grid grid-cols-12 gap-6 mb-12">
            <div className="col-span-12 lg:col-span-5">
              <h2 className="display text-[clamp(28px,3.5vw,48px)] leading-[1.1]">
                Edwards 본사가<br />
                <span className="text-edred italic">직접 인정한</span> 대리점
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7">
              <p className="text-[15px] leading-[1.8] text-[#2a2823]">
                2018년 Edwards Korea Distributor Rewards Program에서 <strong>Gold Class</strong>를 수상했습니다.
                판매 실적만이 아니라 고객 서비스 품질과 기술 지원 역량을 함께 평가해 부여되는 인증이에요.
                이 자격은 Edwards 본사가 발행하는 공식 뉴스레터에 기록되며, 매년 갱신됩니다.
              </p>
            </div>
          </div>

          {/* 갤러리 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gold Award — 전폭 (모바일: 1열, 데스크탑: 2열 span) */}
            <div className="lg:col-span-2 border hair overflow-hidden bg-white group">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={GALLERY[0].src}
                  alt={GALLERY[0].alt}
                  fill
                  className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>
              <div className="px-5 py-4 border-t hair flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold">{GALLERY[0].label}</div>
                  <div className="mono text-[10px] text-dim mt-0.5">{GALLERY[0].sub}</div>
                </div>
                <div className="shrink-0 border border-edred text-edred mono text-[10px] px-3 py-1.5 tracking-wider">
                  GOLD CLASS
                </div>
              </div>
            </div>

            {/* 나머지 3장 */}
            {GALLERY.slice(1).map((img) => (
              <div key={img.label} className="border hair overflow-hidden bg-white group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="px-5 py-4 border-t hair">
                  <div className="text-[13px] font-semibold">{img.label}</div>
                  <div className="mono text-[10px] text-dim mt-0.5">{img.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TIMELINE ══════════════ */}
      <section className="border-b hair py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="mono text-[11px] dim tracking-widest mb-3">— 02 · HISTORY</div>
          <h2 className="display text-[clamp(28px,3.5vw,48px)] leading-[1.1] mb-12 md:mb-16">
            스마텍의 <span className="italic text-edred">걸어온 길</span>
          </h2>

          <div className="relative">
            {/* 수직선 */}
            <div className="absolute left-[72px] md:left-[96px] top-0 bottom-0 w-px bg-line hidden md:block" />

            <div className="space-y-0">
              {TIMELINE.map((item, i) => (
                <div
                  key={item.year}
                  className={`grid grid-cols-1 md:grid-cols-[120px_1fr] gap-0 md:gap-8 border-b hair last:border-b-0 ${
                    i % 2 === 0 ? "bg-paper" : "bg-white"
                  }`}
                >
                  {/* 연도 */}
                  <div className="px-4 md:px-6 pt-6 md:py-8 flex md:flex-col items-center md:items-end gap-3 md:gap-1">
                    <div className={`display text-[clamp(22px,2.5vw,32px)] tabular leading-none ${
                      item.year === "2018" ? "text-edred" : "text-ink"
                    }`}>
                      {item.year}
                    </div>
                    {item.year === "2018" && (
                      <div className="md:mt-1 border border-edred text-edred mono text-[9px] px-2 py-0.5 tracking-widest whitespace-nowrap">
                        GOLD AWARD
                      </div>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="px-4 md:px-0 pb-6 md:py-8">
                    <div className="text-[16px] md:text-[17px] font-semibold mb-2">{item.title}</div>
                    <div className="text-[14px] text-dim leading-[1.7] max-w-[56ch]">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ CASE STUDY (자리 확보) ══════════════ */}
      <section className="border-b hair py-16 md:py-24 bg-paper">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="mono text-[11px] dim tracking-widest mb-3">— 03 · CASE STUDIES</div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h2 className="display text-[clamp(28px,3.5vw,48px)] leading-[1.1]">
                실제 고객 <span className="italic text-edred">성과 사례</span>
              </h2>
              <p className="mt-3 text-[14px] text-dim max-w-[48ch] leading-relaxed">
                "우리가 인증받았다"가 아니라 "당신 같은 고객에게 실제로 성과를 냈다"는 이야기.
                사례 수집 완료 후 순차 공개합니다.
              </p>
            </div>
            <div className="shrink-0 mono text-[11px] text-dim border hair px-4 py-2 self-start md:self-auto">
              수집 중 — 업데이트 예정
            </div>
          </div>

          {/* 플레이스홀더 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { industry: "반도체 제조", model: "Edwards iH 시리즈", hint: "드라이 펌프 PM 주기화 → 비계획 다운타임 단축" },
              { industry: "디스플레이", model: "Edwards GXS 시리즈", hint: "공정 부산물 오염 → 오버홀 후 배기 성능 복원" },
              { industry: "연구기관",   model: "Edwards nEXT 터보펌프", hint: "진공도 불량 → 원인 진단 + 부품 교체" },
            ].map((c) => (
              <div key={c.industry} className="border hair bg-white flex flex-col overflow-hidden opacity-50">
                <div className="h-1.5 bg-line w-full" />
                <div className="p-6 flex-1 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="mono text-[9px] text-edred tracking-widest mb-1">INDUSTRY</div>
                      <div className="text-[14px] font-semibold">{c.industry}</div>
                    </div>
                    <div className="border hair px-2.5 py-1 mono text-[10px] text-dim shrink-0">{c.model}</div>
                  </div>
                  <div className="border-t hair pt-4">
                    <div className="mono text-[9px] text-dim tracking-widest mb-2">OUTCOME</div>
                    <div className="text-[13px] text-dim leading-[1.6] italic">{c.hint}</div>
                  </div>
                  <div className="mt-auto pt-3 border-t hair">
                    <div className="h-2.5 bg-line rounded w-3/4" />
                    <div className="h-2.5 bg-line rounded w-1/2 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[12px] text-dim">
            고객 동의 하에 실명·수치 데이터와 함께 공개합니다. 사례 제공을 원하시면{" "}
            <a href="mailto:info@smartechvacuum.com" className="underline hover:text-edred transition-colors">
              info@smartechvacuum.com
            </a>
            으로 연락해 주세요.
          </p>
        </div>
      </section>

      {/* ══════════════ IN THE NEWS ══════════════ */}
      <section className="border-b hair py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="mono text-[11px] dim tracking-widest mb-3">— 04 · IN THE NEWS</div>
          <h2 className="display text-[clamp(28px,3.5vw,48px)] leading-[1.1] mb-10">
            언론 · 업계 <span className="italic">보도</span>
          </h2>

          <div className="space-y-0 border-t hair">
            {[
              {
                source: "Edwards Korea 뉴스레터",
                date: "2019년 1월",
                title: "Distributor Rewards Program — 스마텍 Gold Class 인증",
                desc: "2018년 실적·서비스 품질 평가에서 Gold Class 달성. Edwards Korea 공식 뉴스레터 게재.",
              },
              {
                source: "Edwards Korea 뉴스레터",
                date: "2024년",
                title: "채널 파트너 제품 교육 참가 — nXDS·nXRi·nEXT 라인업 심화 교육 이수",
                desc: "Edwards Korea General Vacuum 팀 주관 채널 파트너 교육 참가. 신제품 로드맵 및 기술 인사이트 공유.",
              },
            ].map((item) => (
              <div key={item.title} className="grid grid-cols-12 gap-4 py-6 border-b hair last:border-b-0 items-start">
                <div className="col-span-12 md:col-span-2">
                  <div className="mono text-[10px] text-edred tracking-wider">{item.source}</div>
                  <div className="mono text-[10px] text-dim mt-1">{item.date}</div>
                </div>
                <div className="col-span-12 md:col-span-9">
                  <div className="text-[15px] font-semibold mb-1 leading-snug">{item.title}</div>
                  <div className="text-[13px] text-dim leading-relaxed">{item.desc}</div>
                </div>
                <div className="col-span-12 md:col-span-1 flex md:justify-end">
                  <span className="mono text-[9px] text-dim/60 border hair px-2 py-1 self-start">
                    CLOSED
                  </span>
                </div>
              </div>
            ))}

            {/* 기사 추가 예정 안내 */}
            <div className="py-6 text-[12px] text-dim/60 mono">
              유료 기사·업계 보도가 추가되면 이 곳에 업데이트됩니다.
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FAQ ══════════════ */}
      <section className="border-b hair py-16 md:py-24 bg-paper">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="mono text-[11px] dim tracking-widest mb-3">— 05 · FAQ</div>
          <h2 className="display text-[clamp(28px,3.5vw,48px)] leading-[1.1] mb-10">
            자주 묻는 <span className="italic text-edred">질문</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-l hair">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="p-6 md:p-8 border-r border-b hair flex flex-col gap-3">
                <div className="text-[15px] font-semibold leading-snug">{item.q}</div>
                <div className="text-[13px] text-dim leading-[1.75]">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="py-16 md:py-24 bg-ink text-paper">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 lg:col-span-6">
              <div className="mono text-[11px] text-paper/40 tracking-widest mb-4">— GET IN TOUCH</div>
              <h2 className="display text-[clamp(28px,4vw,56px)] leading-[1.1] mb-4">
                문의는 언제든지<br />
                <span className="text-edred">환영합니다</span>
              </h2>
              <p className="text-[15px] text-paper/60 leading-relaxed max-w-[44ch]">
                제품 문의부터 수리 접수, 기술 상담까지.
                30년 현장 경험을 가진 담당자가 직접 응대합니다.
              </p>
            </div>

            <div className="col-span-12 lg:col-span-5 lg:col-start-8">
              <div className="space-y-3">
                <a
                  href="tel:031-204-7170"
                  className="flex items-center justify-between w-full border border-paper/20 px-6 py-5 hover:border-paper hover:bg-paper/5 transition-all group"
                >
                  <div>
                    <div className="mono text-[10px] text-paper/40 tracking-wider mb-1">PHONE</div>
                    <div className="display text-[22px] tabular">031-204-7170</div>
                  </div>
                  <span className="text-paper/30 group-hover:text-paper transition-colors text-[20px]">→</span>
                </a>

                <a
                  href="mailto:info@smartechvacuum.com"
                  className="flex items-center justify-between w-full border border-paper/20 px-6 py-5 hover:border-paper hover:bg-paper/5 transition-all group"
                >
                  <div>
                    <div className="mono text-[10px] text-paper/40 tracking-wider mb-1">EMAIL</div>
                    <div className="text-[15px]">info@smartechvacuum.com</div>
                  </div>
                  <span className="text-paper/30 group-hover:text-paper transition-colors text-[20px]">→</span>
                </a>

                <Link
                  href="/repair"
                  className="flex items-center justify-between w-full bg-edred px-6 py-5 hover:bg-[#a0001a] transition-all group"
                >
                  <div>
                    <div className="mono text-[10px] text-paper/70 tracking-wider mb-1">ONLINE</div>
                    <div className="text-[15px] font-semibold">수리 접수 바로 하기</div>
                  </div>
                  <span className="text-paper/70 group-hover:text-paper transition-colors text-[20px]">→</span>
                </Link>
              </div>

              <div className="mt-4 text-[11px] text-paper/30 leading-relaxed">
                수원 본사: 경기 수원시 영통구 신원로55, 테크트리지식산업센터 907호<br />
                천안 수리센터: 충남 천안시 서북구 두정공원 2길 49
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
