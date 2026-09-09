import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./quote/[id]/quote-styles.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import { SessionProvider } from "./providers";

export const metadata: Metadata = {
  title: "스마텍 — Edwards Vacuum 한국 공식 대리점 | 진공 토탈 솔루션",
  description: "Edwards Vacuum 한국 공식 대리점 스마텍. 2006년 Edwards 코리아 합류, 2011년 창업. RV·E2M·GXS·nXDS·STP·nEXT 전 라인업 · 딜러/OEM/소비자 등급별 가격 · 온라인 견적 시스템.",
  metadataBase: new URL("https://www.smartechvacuum.com"),
  verification: {
    other: { "naver-site-verification": "42d90b9cf0599e0f8b74c3bf5abc5089c7706274" },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "스마텍",
    title: "스마텍 — Edwards Vacuum 한국 공식 대리점",
    description: "Edwards Vacuum 한국 공식 대리점. 진공펌프 판매·수리·기술상담 토탈 솔루션.",
    images: [{ url: "https://www.smartechvacuum.com/og-default.png", width: 1200, height: 630, alt: "스마텍 — Edwards Vacuum 한국 공식 대리점" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "스마텍 — Edwards Vacuum 한국 공식 대리점",
    description: "Edwards Vacuum 한국 공식 대리점. 진공펌프 판매·수리·기술상담 토탈 솔루션.",
    images: ["https://www.smartechvacuum.com/og-default.png"],
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
      "email": "info@smartechvacuum.com",
      "foundingDate": "2011",
      "description": "Edwards Vacuum 한국 공식 대리점. 진공펌프 판매·수리·기술상담 토탈 솔루션. 2011년 창업, 대표 진공산업 경력 2006년부터, 진공펌프 수리 경력 30년의 전담 엔지니어 보유.",
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
    {
      "@type": "Service",
      "@id": "https://www.smartechvacuum.com/#repair-service",
      "name": "Edwards 진공펌프 수리·오버홀 서비스",
      "provider": { "@id": "https://www.smartechvacuum.com/#organization" },
      "serviceType": "진공펌프 수리 및 오버홀",
      "description": "Edwards 진공펌프(RV·E2M·nES·GXS·EXS·nXDS·XDS·iXH·nEXT·STP) 전 라인업 수리·오버홀·부품 교체. 수원 본사 및 천안 수리센터 운영.",
      "areaServed": { "@type": "Country", "name": "대한민국" },
      "url": "https://www.smartechvacuum.com/repair",
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
        {/* Google Analytics GA4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-KRD96T8LX6" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-KRD96T8LX6');`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          crossOrigin=""
        />
        <Script id="async-fonts" strategy="afterInteractive">
          {`(function(){var h=[
"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap",
"https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
];h.forEach(function(u){var l=document.createElement('link');l.rel='stylesheet';l.href=u;l.crossOrigin='';document.head.appendChild(l);});})();`}
        </Script>
      </head>
      <body className="min-h-screen bg-paper text-ink antialiased" suppressHydrationWarning>
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <QuoteBar />
        </SessionProvider>
      </body>
    </html>
  );
}
