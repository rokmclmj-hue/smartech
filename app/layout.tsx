import type { Metadata } from "next";
import "./globals.css";
import "./quote/[id]/quote-styles.css";
import Navbar from "@/components/Navbar";
import QuoteBar from "@/components/QuoteBar";
import { SessionProvider } from "./providers";

export const metadata: Metadata = {
  title: "스마텍 — Edwards Vacuum 한국 공식 대리점 | 진공 토탈 솔루션",
  description: "Edwards Vacuum 한국 공식 대리점 스마텍. 2006년 Edwards 코리아 합류, 2011년 창업. RV·E2M·GXS·nXDS·STP·nEXT 전 라인업 · 딜러/OEM/소비자 등급별 가격 · 온라인 견적 시스템.",
  metadataBase: new URL("https://www.smartechvacuum.com"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "스마텍",
    title: "스마텍 — Edwards Vacuum 한국 공식 대리점",
    description: "Edwards Vacuum 한국 공식 대리점. 진공펌프 판매·수리·기술상담 토탈 솔루션.",
  },
  twitter: {
    card: "summary_large_image",
    title: "스마텍 — Edwards Vacuum 한국 공식 대리점",
    description: "Edwards Vacuum 한국 공식 대리점. 진공펌프 판매·수리·기술상담 토탈 솔루션.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.smartechvacuum.com/#organization",
      "name": "(주)스마텍",
      "alternateName": ["Smartech", "스마텍"],
      "url": "https://www.smartechvacuum.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.smartechvacuum.com/icon.png",
      },
      "telephone": "031-204-7170",
      "email": "rokmclmj@gmail.com",
      "foundingDate": "2011",
      "description": "Edwards Vacuum 한국 공식 대리점. 진공펌프 판매·수리·기술상담 토탈 솔루션. 2011년 창업, 30년 이상 Edwards 전문 기술력.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "신원로55, 테크트리지식산업센터 907호",
        "addressLocality": "수원시 영통구",
        "addressRegion": "경기도",
        "addressCountry": "KR",
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "031-204-7170",
        "contactType": "customer service",
        "availableLanguage": "Korean",
        "hoursAvailable": "Mo-Su 00:00-23:59",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://www.smartechvacuum.com/#local-suwon",
      "name": "스마텍 본사",
      "parentOrganization": { "@id": "https://www.smartechvacuum.com/#organization" },
      "url": "https://www.smartechvacuum.com",
      "telephone": "031-204-7170",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "신원로55, 테크트리지식산업센터 907호",
        "addressLocality": "수원시 영통구",
        "addressRegion": "경기도",
        "addressCountry": "KR",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://www.smartechvacuum.com/#local-cheonan",
      "name": "스마텍 천안수리센터",
      "parentOrganization": { "@id": "https://www.smartechvacuum.com/#organization" },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "두정공원 2길 49",
        "addressLocality": "천안시 서북구",
        "addressRegion": "충청남도",
        "addressCountry": "KR",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="google-site-verification" content="G5av3b974mdW7IhC2e63gvWXd48pPm0iuCWaM_1tUE0" />
        <meta name="naver-site-verification" content="ea656dd08114de84a702c5573374980366fe7597" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-paper text-ink antialiased" suppressHydrationWarning>
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
          <QuoteBar />
        </SessionProvider>
      </body>
    </html>
  );
}
