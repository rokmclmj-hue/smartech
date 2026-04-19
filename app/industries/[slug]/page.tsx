import Link from "next/link";
import { notFound } from "next/navigation";
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

  return (
    <>
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
              <h1 className="display text-[clamp(36px,8vw,110px)] leading-[0.95]">
                {industry.title}
              </h1>
              <p className="mt-5 md:mt-6 text-[15px] md:text-[17px] leading-[1.55] max-w-[52ch] text-[#2a2823]">
                {hiEd(industry.tagline)}
              </p>
            </div>

            <div className="col-span-12 lg:col-span-5">
              <div className="aspect-[4/3] border hair overflow-hidden bg-[#F6F4EF] relative">
                <img
                  src={industry.image}
                  alt={industry.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ OVERVIEW ═══════════════ */}
      <section className="border-b hair py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <div className="mono text-[11px] dim mb-4">— 01 · OVERVIEW</div>
              <h2 className="display text-[34px] leading-[1.1]">
                왜 이 산업에<br />
                <span className="italic text-edred">진공</span>이 필요한가
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-6">
              <p className="text-[15.5px] leading-[1.85] text-[#2a2823]">
                {hiEd(industry.description)}
              </p>
              <div className="mt-8 pt-6 border-t hair text-[12px] mono dim">
                REFERENCE —{" "}
                <a
                  href={industry.edwardsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-red pb-0.5 hover:text-edred"
                >
                  edwardsvacuum.com →
                </a>
              </div>
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
                실제 적용되는<br />
                <span className="italic">세부 공정</span>
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
                이 산업에 맞는<br />
                <span className="text-edred">Edwards</span> <span className="italic">조합</span>
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:col-start-8 mt-4">
              <p className="text-[14.5px] leading-[1.7] text-[#2a2823]">
                공정 조건(압력·유량·가스종·부식성)에 따라 조합이 달라집니다.
                정확한 모델은 사양서를 받아본 후 제안드립니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {industry.recommendedPumps.map((pump, i) => (
              <div
                key={pump}
                className="border hair bg-paper flex flex-col overflow-hidden group"
              >
                <div className="aspect-[4/3] relative bg-[#F6F4EF] border-b hair overflow-hidden">
                  <img
                    src={pumpImage(pump)}
                    alt={pump}
                    className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="mono text-[10.5px] opacity-60">
                    {String(i + 1).padStart(2, "0")} · <span className="text-edred font-semibold">Edwards</span>
                  </div>
                  <div className="display text-[24px] leading-none mt-2">{pump}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/#contact"
              className="inline-flex items-center gap-3 bg-ink text-paper px-6 py-4 text-sm hover:bg-edred transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-edred inline-block" />이 산업 상담 받기 →
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border border-ink px-6 py-4 text-sm hover:bg-ink hover:text-paper transition-colors"
            >
              전체 제품 라인업 →
            </Link>
          </div>
        </div>
      </section>

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
