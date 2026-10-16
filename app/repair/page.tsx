import type { Metadata } from "next";
import RepairPageClient from "./RepairPageClient";
import RepairGuide from "./RepairGuide";
import { REPAIR_CASES } from "@/lib/repair-cases";

export const metadata: Metadata = {
  title: "수리·오버홀 안내 — 스마텍 | Edwards 진공펌프 수리·오버홀",
  description: "Edwards 공식 대리점 스마텍의 진공펌프 수리·오버홀 안내와 접수. 오일 로터리·드라이·스크롤·반도체용 드라이펌프(iH) 수리, 출고 전 시험 후 검사성적서 발행. 수원 본사·천안 수리센터.",
  alternates: { canonical: "https://www.smartechvacuum.com/repair" },
  openGraph: {
    title: "수리·오버홀 안내 — 스마텍 | Edwards 진공펌프 수리",
    description: "Edwards 진공펌프 수리 접수. AI 모델 자동 판별·즉시 견적.",
    url: "https://www.smartechvacuum.com/repair",
    type: "website",
    siteName: "스마텍",
    locale: "ko_KR",
    images: [{ url: "https://www.smartechvacuum.com/og-default.png", width: 1200, height: 630, alt: "스마텍 수리 접수" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "수리·오버홀 안내 — 스마텍",
    description: "Edwards 진공펌프 수리 접수. AI 모델 자동 판별·즉시 견적.",
    images: ["https://www.smartechvacuum.com/og-default.png"],
  },
};

const repairServiceSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Edwards 진공펌프 수리·오버홀",
  "name": "수리·오버홀 안내 — 스마텍",
  "description": "Edwards 및 타사 진공펌프 수리·오버홀. 분해 검사, 부품 교체, 출고 전 시험(도달 진공도·운전 전류·본체 온도·누설·시운전) 후 검사성적서 발행. 보증: 드라이펌프 6개월, 오일 로터리 펌프 3개월.",
  "url": "https://www.smartechvacuum.com/repair",
  "provider": {
    "@type": "Organization",
    "name": "스마텍",
    "url": "https://www.smartechvacuum.com",
  },
  "areaServed": "KR",
});

const repairCasesSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "스마텍 진공펌프 수리 사례",
  "description": "스마텍이 실제로 수리·오버홀한 Edwards 등 진공펌프 사례 목록. 모델·증상·작업 내역·작업일을 공개합니다.",
  "numberOfItems": REPAIR_CASES.length,
  "itemListElement": REPAIR_CASES.map((c, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "item": {
      "@type": "Service",
      "name": `${c.model} 수리 사례`,
      "serviceType": "진공펌프 수리·오버홀",
      "provider": { "@type": "Organization", "name": "스마텍" },
      "description": `증상: ${c.symptom} / 작업 내역: ${c.work.join(", ")}${c.result ? ` / 출고 시험: 도달 진공도 ${c.result.vacuum}(기준 ${c.result.vacuumStd}), 운전 전류 ${c.result.current}, 본체 온도 ${c.result.temp}, ${c.result.runHours}시간 시운전, 전 항목 합격` : ""}`,
      "dateCreated": c.date.replaceAll(".", "-"),
    },
  })),
});

export default function RepairPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: repairServiceSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: repairCasesSchema }} />
      <RepairPageClient>
        <RepairGuide />
      </RepairPageClient>
    </>
  );
}
