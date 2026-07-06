import type { Metadata } from "next";
import RepairPageClient from "./RepairPageClient";

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

export default function RepairPage() {
  return <RepairPageClient />;
}
