import type { Metadata } from "next";
import RepairPageClient from "./RepairPageClient";
import { REPAIR_CASES } from "@/lib/repair-cases";

export const metadata: Metadata = {
  title: "수리 접수 — 스마텍 | Edwards 진공펌프 수리·오버홀",
  description: "Edwards 진공펌프(RV·E2M·GXS·nXDS·iXH·nEXT·STP) 수리 접수. AI 모델 자동 판별·수리비 즉시 견적·사진 업로드. 수원 본사 및 천안 수리센터 운영.",
  alternates: { canonical: "https://www.smartechvacuum.com/repair" },
  openGraph: {
    title: "수리 접수 — 스마텍 | Edwards 진공펌프 수리",
    description: "Edwards 진공펌프 수리 접수. AI 모델 자동 판별·즉시 견적.",
    url: "https://www.smartechvacuum.com/repair",
    type: "website",
    siteName: "스마텍",
    locale: "ko_KR",
    images: [{ url: "https://www.smartechvacuum.com/og-default.png", width: 1200, height: 630, alt: "스마텍 수리 접수" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "수리 접수 — 스마텍",
    description: "Edwards 진공펌프 수리 접수. AI 모델 자동 판별·즉시 견적.",
    images: ["https://www.smartechvacuum.com/og-default.png"],
  },
};

const repairServiceSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Edwards 진공펌프 수리·오버홀",
  "name": "수리 접수 — 스마텍",
  "description": "Edwards 진공펌프(RV·E2M·GXS·nXDS·iXH·nEXT·STP) 수리 접수. AI 모델 자동 판별·수리비 즉시 견적·사진 업로드.",
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
      "description": `증상: ${c.symptom} / 작업 내역: ${c.work.join(", ")}`,
      "dateCreated": c.date.replaceAll(".", "-"),
    },
  })),
});

export default function RepairPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: repairServiceSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: repairCasesSchema }} />
      <RepairPageClient />
    </>
  );
}
