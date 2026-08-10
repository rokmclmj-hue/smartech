import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "협력사 — 스마텍",
  description:
    "스마텍의 협력사를 소개합니다. 하우스맨과 함께 산업 현장의 진공 설비와 시설 운영을 안정적으로 지원합니다.",
  alternates: { canonical: "https://www.smartechvacuum.com/partners" },
  openGraph: {
    title: "협력사 — 스마텍",
    description:
      "스마텍의 협력사를 소개합니다. 하우스맨과 함께 산업 현장의 진공 설비와 시설 운영을 안정적으로 지원합니다.",
    url: "https://www.smartechvacuum.com/partners",
    type: "website",
    siteName: "스마텍",
    locale: "ko_KR",
    images: [{ url: "https://www.smartechvacuum.com/og-default.png", width: 1200, height: 630, alt: "스마텍 협력사" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "협력사 — 스마텍",
    description: "스마텍의 협력사를 소개합니다.",
    images: ["https://www.smartechvacuum.com/og-default.png"],
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: "https://www.smartechvacuum.com" },
    { "@type": "ListItem", position: 2, name: "협력사", item: "https://www.smartechvacuum.com/partners" },
  ],
};

export default function PartnersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="border-b hair bg-paper">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-12 md:pb-20">
          <div className="mono text-[11px] dim tracking-widest mb-4">— PARTNERS</div>
          <h1 className="display text-[clamp(32px,4.5vw,64px)] leading-[1.1] tracking-tight">
            함께 만드는<br />
            <span className="text-edred italic">신뢰의 현장</span>
          </h1>
          <p className="mt-6 text-[16px] md:text-[18px] leading-[1.8] max-w-[62ch] text-[#2a2823] break-keep">
            스마텍은 하우스맨이 시설관리를 담당하는 사업장에 진공펌프 공급·수리·기술지원을 제공하는 파트너사입니다.
            반도체·디스플레이부터 화학·제약, 연구개발까지 다양한 산업 현장의 진공 설비를 안정적으로 운영하려면,
            시설 전반을 관리하는 하우스맨과 진공펌프 전문성을 갖춘 스마텍의 협업이 필요합니다.
            각자의 전문 영역에서 신뢰할 수 있는 서비스를 제공하는 것이 두 회사가 함께하는 이유입니다.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="border hair p-6 md:p-10 max-w-[560px]">
            <div className="mono text-[11px] dim tracking-widest mb-3">FACILITY MANAGEMENT PARTNER</div>
            <h2 className="display text-[28px] md:text-[36px] leading-[1.2] mb-3">하우스맨</h2>
            <p className="text-[14px] leading-[1.8] text-dim mb-6 break-keep">
              시설 유지관리 전문 파트너사. 스마텍이 진공펌프 공급·수리·기술지원을 담당하는 사업장의 시설 운영을 함께합니다.
            </p>
            <a
              href="https://houseman.co.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2.5 bg-ink text-paper text-[13px] font-semibold hover:bg-edred transition"
            >
              하우스맨 홈페이지 바로가기 →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
