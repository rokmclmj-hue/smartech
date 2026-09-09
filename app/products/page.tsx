import type { Metadata } from "next";
import ProductsPageClient from "./ProductsPageClient";

export const metadata: Metadata = {
  title: "제품 카탈로그 — 스마텍 | Edwards Vacuum 정품 부품",
  description: "Edwards Vacuum 정품 진공펌프·부품 전 라인업. RV·E2M·GXS·nXDS·nEXT·STP·iXH 카탈로그. 딜러/OEM/소비자 등급별 가격·온라인 견적.",
  alternates: { canonical: "https://www.smartechvacuum.com/products" },
  openGraph: {
    title: "제품 카탈로그 — 스마텍",
    description: "Edwards Vacuum 정품 진공펌프·부품 전 라인업.",
    url: "https://www.smartechvacuum.com/products",
    type: "website",
    siteName: "스마텍",
    locale: "ko_KR",
    images: [{ url: "https://www.smartechvacuum.com/og-default.png", width: 1200, height: 630, alt: "스마텍 제품 카탈로그" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "제품 카탈로그 — 스마텍",
    description: "Edwards Vacuum 정품 진공펌프·부품 전 라인업.",
    images: ["https://www.smartechvacuum.com/og-default.png"],
  },
};

const collectionSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "제품 카탈로그 — 스마텍",
  "description": "Edwards Vacuum 정품 진공펌프·부품 전 라인업. RV·E2M·GXS·nXDS·nEXT·STP·iXH 카탈로그.",
  "url": "https://www.smartechvacuum.com/products",
  "isPartOf": { "@type": "WebSite", "name": "스마텍", "url": "https://www.smartechvacuum.com" },
  "about": { "@type": "Brand", "name": "Edwards Vacuum" },
});

export default function ProductsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: collectionSchema }} />
      <header className="border-b hair">
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
          <div className="mono text-[10.5px] tracking-[0.18em] uppercase text-dim mb-4">
            CATALOG · <span className="text-edred">EDWARDS</span> KOREA
          </div>
          <h1 className="display text-[44px] md:text-[64px] leading-[0.98] tracking-[-0.04em]">
            전 제품 카탈로그<span className="text-edred">.</span>
          </h1>
          <p className="mt-4 text-sm md:text-base text-dim max-w-2xl leading-relaxed">
            스마텍이 공급하는 <span className="text-edred font-semibold">Edwards</span> 진공펌프·게이지·컨트롤러·액세서리 전 라인업.
            파트번호·모델명으로 검색하고, 로그인 후 우대 가격을 확인하실 수 있습니다.
          </p>
        </div>
      </header>
      <ProductsPageClient />
    </>
  );
}
