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
  },
  twitter: {
    card: "summary_large_image",
    title: "제품 카탈로그 — 스마텍",
    description: "Edwards Vacuum 정품 진공펌프·부품 전 라인업.",
  },
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
