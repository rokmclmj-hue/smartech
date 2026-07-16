import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { INDUSTRIES, getIndustry } from "@/lib/industries";

function hiEd(text: string) {
  return text.split(/(\bEdwards\b)/).map((p, i) =>
    p === "Edwards"
      ? <span key={i} className="text-edred font-semibold">Edwards</span>
      : p
  );
}

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return { title: "스마텍" };
  return {
    title: `${industry.title} 진공 솔루션 — 스마텍 | Edwards Vacuum`,
    description: industry.tagline,
    alternates: { canonical: `https://www.smartechvacuum.com/industries/${slug}` },
    openGraph: {
      title: `${industry.title} 진공 솔루션 — 스마텍`,
      description: industry.tagline,
      url: `https://www.smartechvacuum.com/industries/${slug}`,
      type: "website",
      siteName: "스마텍",
      locale: "ko_KR",
      images: [{ url: industry.image, alt: industry.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${industry.title} 진공 솔루션 — 스마텍`,
      description: industry.tagline,
      images: [industry.image],
    },
  };
}

const PUMP_PDF: Record<string, string> = {
  RV:          "/catalogs/1.오일펌프_소형RV.pdf",
  E2M:         "/catalogs/2.오일펌프_중대형E2M.pdf",
  E2S:         "/catalogs/2-1오일펌프 중대형E2S.pdf",
  nES:         "/catalogs/3.오일펌프_nES.pdf",
  nXDS:        "/catalogs/4.스크롤펌프_소형nXDS.pdf",
  XDS:         "/catalogs/5.스크롤펌프_중형XDS.pdf",
  EH:          "/catalogs/6.부스터펌프EH.pdf",
  GXS:         "/catalogs/7.산업용드라이펌프_GXS Dry.pdf",
  EXS:         "/catalogs/7-1.산업용드라이_EXS.pdf",
  iXH:         "/catalogs/8.반도체드라이_iXH.pdf",
  iXL:         "/catalogs/9.반도체드라이_iXL.pdf",
  nXRi:        "/catalogs/8-1.반도체드라이_nXRi.pdf",
  ELD500:      "/catalogs/9-1.헬륨리크디텍터_ELD500.pdf",
  nEXT:        "/catalogs/10.nEXT 터보펌프.pdf",
  "T-station": "/catalogs/11.터보펌프_nEXT_Pumping_Station.pdf",
  STP:         "/catalogs/12.터보펌프_STP.pdf",
  APG200:      "/catalogs/13.저진공게이지_APG200.pdf",
  AIM200:      "/catalogs/14.고진공게이지AIM200.pdf",
  WRG200:      "/catalogs/15.저진공+고진공게이지_WRG200.pdf",
  "P4-P5":     "/catalogs/16.디스플레이진공게이지_P4-P5.pdf",
  TIC:         "/catalogs/17.컨트롤러_TIC.pdf",
  ADC:         "/catalogs/18.컨트롤러_ADC.pdf",
  EMF:         "/catalogs/19.미스트필터(EMF).pdf",
  Ultra19:     "/catalogs/20.진공펌프오일_Ultra19.pdf",
  Fittings:    "/catalogs/21.피팅_52~57페이지사용.PDF",
};

const PUMP_IMAGE: Record<string, string> = {
  RV: "/images/products/rv.jpeg",
  E2M: "/images/products/e2m.png",
  E2S: "/images/products/e2s.png",
  nES: "/images/products/nes.jpeg",
  nXDS: "/images/products/xds.jpeg",
  XDS: "/images/products/xds.jpeg",
  EH: "/images/products/eh.jpeg",
  GXS: "/images/products/gxs.jpeg",
  EXS: "/images/products/exs.jpeg",
  iXH: "/images/products/ixh-ixl.jpeg",
  iXL: "/images/products/ixh-ixl.jpeg",
  nXRi: "/images/products/nxri.jpeg",
  ELD500: "/images/products/eld500.jpeg",
  nEXT: "/images/products/next.png",
  "T-station": "/images/products/t-station.jpeg",
  STP: "/images/products/stp.png",
  APG200: "/images/products/gauges-indirect.png",
  AIM200: "/images/products/gauges-indirect.png",
  WRG200: "/images/products/gauges-indirect.png",
  "P4-P5": "/images/products/gauges-mechanical.png",
  TIC: "/images/products/controllers.png",
  ADC: "/images/products/controllers.png",
  EMF: "/images/products/hardware.png",
  Ultra19: "/images/products/hardware.png",
  Fittings: "/images/products/hardware.png",
};

function pumpImage(name: string): string {
  return PUMP_IMAGE[name] ?? "/images/products/rv.jpeg";
}

function pumpPdf(name: string): string | null {
  return PUMP_PDF[name] ?? null;
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return notFound();

  const idx = INDUSTRIES.findIndex((i) => i.slug === industry.slug);
  const prev = INDUSTRIES[(idx - 1 + INDUSTRIES.length) % INDUSTRIES.length];
  const next = INDUSTRIES[(idx + 1) % INDUSTRIES.length];

  const serviceSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": `${industry.title} 진공 솔루션`,
    "name": `${industry.title} 진공펌프·진공장비 공급`,
    "description": industry.description,
    "provider": { "@type": "Organization", "name": "스마텍", "url": "https://www.smartechvacuum.com" },
    "areaServed": "KR",
    "url": `https://www.smartechvacuum.com/industries/${industry.slug}`,
  });

  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://www.smartechvacuum.com" },
      { "@type": "ListItem", "position": 2, "name": "산업 분야", "item": "https://www.smartechvacuum.com/#industries" },
      { "@type": "ListItem", "position": 3, "name": industry.title, "item": `https://www.smartechvacuum.com/industries/${industry.slug}` },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serviceSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative border-b hair bg-paper">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-10 md:pb-16">
          <div className="flex justify-between items-center gap-3 text-[11px] mono dim mb-6 md:mb-10">
            <Link href="/#industries" className="hover:text-edred whitespace-nowrap">
              ← 20 INDUSTRIES
            </Link>
            <span className="text-right">
              {String(industry.n).padStart(2, "0")} / 20 ·{" "}
              <span className="hidden sm:inline">{industry.tag.join(" · ")}</span>
              <span className="sm:hidden">{industry.tag[0]}</span>
            </span>
          </div>

          <div className="grid grid-cols-12 gap-5 md:gap-6 items-end">
            <div className="col-span-12 lg:col-span-7">
              <div className="mono text-[11px] dim mb-3 md:mb-5">
                — INDUSTRY · {industry.slug.toUpperCase()}
              </div>
              <h1 className="display text-[clamp(28px,5vw,72px)] leading-[1.05]">
                {industry.title}
              </h1>
              <p className="mt-5 md:mt-6 text-[15px] md:text-[17px] leading-[1.55] max-w-[52ch] text-[#2a2823]">
                {hiEd(industry.tagline)}
              </p>
            </div>

            <div className="col-span-12 lg:col-span-5">
              <div className="aspect-[4/3] border hair overflow-hidden bg-[#F6F4EF] relative">
                <Image
                  src={industry.image}
                  alt={industry.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ OVERVIEW ═══════════════ */}
      <section className="border-b hair py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 lg:col-span-4">
              <div className="mono text-[11px] dim mb-4">— 01 · OVERVIEW</div>
              <h2 className="display text-[34px] leading-[1.1]">
                왜 이 산업에 <span className="italic text-edred">진공</span>이 필요한가
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-6">
              <p className="text-[15.5px] leading-[1.85] text-[#2a2823]">
                {hiEd(industry.description)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ PROCESSES ═══════════════ */}
      <section className="border-b hair py-20 bg-[#F6F4EF]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-12 gap-6 mb-12">
            <div className="col-span-12 lg:col-span-5">
              <div className="mono text-[11px] dim mb-4">
                — 02 · VACUUM PROCESSES
              </div>
              <h2 className="display text-[34px] leading-[1.1]">
                실제 적용되는 <span className="italic">세부 공정</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l hair">
            {industry.processes.map((p, i) => (
              <div
                key={i}
                className="p-6 border-r border-b hair bg-paper flex gap-4"
              >
                <div className="mono text-[11px] text-edred shrink-0 pt-1">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="text-[14px] leading-[1.55]">{p}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ RECOMMENDED PUMPS ═══════════════ */}
      <section className="border-b hair py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 lg:col-span-6">
              <div className="mono text-[11px] dim mb-4">
                — 03 · RECOMMENDED MODELS
              </div>
              <h2 className="display text-[34px] leading-[1.1]">
                이 산업에 맞는 <span className="text-edred">Edwards</span> <span className="italic">조합</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {industry.recommendedPumps.map((pump, i) => {
              const pdf = pumpPdf(pump);
              const Wrapper = pdf ? "a" : "div";
              const wrapperProps = pdf
                ? { href: pdf, target: "_blank", rel: "noopener noreferrer" }
                : {};
              return (
                <Wrapper
                  key={pump}
                  {...(wrapperProps as any)}
                  className={`border hair bg-paper flex flex-col overflow-hidden group${pdf ? " cursor-pointer" : ""}`}
                >
                  <div className="aspect-[4/3] relative bg-[#F6F4EF] border-b hair overflow-hidden">
                    <Image
                      src={pumpImage(pump)}
                      alt={pump}
                      fill
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <div className="mono text-[10.5px] opacity-60">
                      {String(i + 1).padStart(2, "0")} · <span className="text-edred font-semibold">Edwards</span>
                    </div>
                    <div className="display text-[24px] leading-none mt-2">{pump}</div>
                    {pdf && (
                      <div className="mt-2 text-[10px] mono text-edred opacity-70 group-hover:opacity-100">
                        카탈로그 PDF →
                      </div>
                    )}
                  </div>
                </Wrapper>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════ ENGINEERING NOTES (실제 시뮬레이션 데이터 기반) ═══════════════ */}
      {industry.engineeringNotes && industry.engineeringNotes.length > 0 && (
        <section className="border-b hair py-20 bg-[#F6F4EF]">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-12 gap-6 mb-12">
              <div className="col-span-12 lg:col-span-6">
                <div className="mono text-[11px] dim mb-4">
                  — 04 · FIELD DATA
                </div>
                <h2 className="display text-[34px] leading-[1.1]">
                  실제 시뮬레이션으로 <span className="italic text-edred">확인된 것</span>
                </h2>
                <p className="mt-4 text-[13px] dim max-w-[48ch]">
                  Edwards 공식 시뮬레이션 데이터를 기반으로 한 실전 기술 인사이트입니다. 회사명·수치는 보안상 범위·일반화 처리했습니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l hair">
              {industry.engineeringNotes.map((note, i) => (
                <div
                  key={i}
                  className="p-7 border-r border-b hair bg-paper flex gap-4"
                >
                  <div className="mono text-[11px] text-edred shrink-0 pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold mb-2">{note.title}</div>
                    <div className="text-[13.5px] leading-[1.7] text-[#2a2823]">{note.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ PREV / NEXT ═══════════════ */}
      <section className="border-b hair">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-x hair">
          <Link
            href={`/industries/${prev.slug}`}
            className="p-8 md:p-12 hover:bg-ink hover:text-paper transition-colors group"
          >
            <div className="mono text-[11px] dim mb-3 group-hover:text-paper/70">
              ← 이전 산업 · {String(prev.n).padStart(2, "0")}
            </div>
            <div className="display text-[28px] leading-[1.1]">{prev.title}</div>
            <div className="mt-2 text-[13px] opacity-80 max-w-[40ch]">
              {prev.line}
            </div>
          </Link>
          <Link
            href={`/industries/${next.slug}`}
            className="p-8 md:p-12 hover:bg-ink hover:text-paper transition-colors group text-right"
          >
            <div className="mono text-[11px] dim mb-3 group-hover:text-paper/70">
              다음 산업 · {String(next.n).padStart(2, "0")} →
            </div>
            <div className="display text-[28px] leading-[1.1]">{next.title}</div>
            <div className="mt-2 text-[13px] opacity-80 max-w-[40ch] ml-auto">
              {next.line}
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
