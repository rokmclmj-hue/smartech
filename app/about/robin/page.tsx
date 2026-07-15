import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Robin (대표) — 스마텍 | Edwards Vacuum 진공산업 경력 20년",
  description:
    "스마텍 대표 Robin 소개. 2006년 Edwards 코리아 합류(기술영업), 2011년 스마텍 창업. 진공펌프 기술 블로그 작성자.",
  alternates: { canonical: "https://www.smartechvacuum.com/about/robin" },
  openGraph: {
    title: "Robin (대표) — 스마텍",
    description: "2006년 Edwards 코리아 합류, 2011년 스마텍 창업. 진공산업 경력 20년.",
    url: "https://www.smartechvacuum.com/about/robin",
    type: "profile",
    siteName: "스마텍",
    locale: "ko_KR",
    images: [{ url: "https://www.smartechvacuum.com/og-default.png", width: 1200, height: 630, alt: "Robin — 스마텍 대표" }],
  },
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://www.smartechvacuum.com/about/robin#person",
  name: "Robin",
  jobTitle: "대표",
  worksFor: { "@type": "Organization", "@id": "https://www.smartechvacuum.com/#organization", name: "스마텍" },
  url: "https://www.smartechvacuum.com/about/robin",
  description: "Edwards Vacuum 한국 공식 대리점 스마텍 대표. 2006년 Edwards 코리아 합류(기술영업), 2011년 스마텍 창업.",
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: "https://www.smartechvacuum.com" },
    { "@type": "ListItem", position: 2, name: "회사 소개", item: "https://www.smartechvacuum.com/about" },
    { "@type": "ListItem", position: 3, name: "Robin", item: "https://www.smartechvacuum.com/about/robin" },
  ],
};

const CAREER = [
  { year: "2006", desc: "Edwards 코리아 합류 — 기술영업으로 시작, 반도체·디스플레이·연구기관 현장에서 진공 공정을 직접 익힘" },
  { year: "2011", desc: "스마텍 창업 — Edwards Vacuum 공식 대리점으로 출발" },
  { year: "2018", desc: "Edwards Korea Distributor Gold Award 수상 (대표 재임 중)" },
  { year: "현재", desc: "스마텍 대표 · 기술 상담·견적 검토 · 진공펌프 기술 블로그 작성" },
];

export default function RobinPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <nav className="mono text-[11px] dim mb-8">
          <Link href="/about" className="hover:text-edred">회사 소개</Link>
          <span className="mx-2 opacity-40">/</span>
          <span>Robin</span>
        </nav>

        <div className="mono text-[10px] dim uppercase tracking-[0.16em] mb-3">Author</div>
        <h1 className="display text-[32px] md:text-[44px] leading-tight tracking-[-0.02em] mb-2">
          Robin <span className="text-edred">·</span> 스마텍 대표
        </h1>
        <p className="text-[15px] dim mb-10">
          Edwards Vacuum 진공산업 경력 20년 (2006~) · (주)스마텍 대표
        </p>

        <section className="mb-10">
          <h2 className="mono text-[11px] dim uppercase tracking-[0.14em] mb-4">경력</h2>
          <ul className="space-y-3">
            {CAREER.map((c) => (
              <li key={c.year + c.desc} className="flex gap-4 text-[14.5px] leading-relaxed">
                <span className="mono text-edred font-semibold shrink-0 w-12">{c.year}</span>
                <span>{c.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mono text-[11px] dim uppercase tracking-[0.14em] mb-4">담당 업무</h2>
          <p className="text-[14.5px] leading-relaxed">
            스마텍 전사 경영, 고객 기술 상담·견적 검토, 진공펌프 기술 블로그 작성을 맡고 있습니다.
            블로그의 모든 기술 글은 대표 본인이 직접 작성·검토합니다.
          </p>
        </section>

        <section>
          <h2 className="mono text-[11px] dim uppercase tracking-[0.14em] mb-4">작성한 글</h2>
          <Link href="/blog" className="inline-block text-[14px] text-edred font-medium hover:underline">
            전체 기술 블로그 보기 →
          </Link>
        </section>
      </div>
    </>
  );
}
