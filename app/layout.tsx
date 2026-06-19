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
  verification: {
    other: { "naver-site-verification": "42d90b9cf0599e0f8b74c3bf5abc5089c7706274" },
  },
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
      "email": "info@smartechvacuum.com",
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
    {
      "@type": "FAQPage",
      "@id": "https://www.smartechvacuum.com/#faq",
      "url": "https://www.smartechvacuum.com",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "에드워즈 진공펌프 수리는 어디서 맡기나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "스마텍은 Edwards Vacuum 한국 공식 대리점으로, 수원 본사와 천안 수리센터에서 Edwards 진공펌프 전 라인업(RV·E2M·GXS·nXDS·nEXT 등) 수리·오버홀 서비스를 제공합니다. 전화 031-204-7170으로 문의하시거나 홈페이지에서 온라인 수리접수가 가능합니다.",
          },
        },
        {
          "@type": "Question",
          "name": "스마텍은 에드워즈 공식 대리점인가요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "네, 스마텍((주)스마텍)은 Edwards Vacuum 한국 공식 대리점입니다. 2006년 Edwards 코리아 합류, 2011년 창업하여 30년 이상의 Edwards 진공 기술력을 보유하고 있습니다.",
          },
        },
        {
          "@type": "Question",
          "name": "Edwards RV 오일펌프와 E2M 오일펌프의 차이는 무엇인가요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "RV 시리즈는 소형(0.6~25 m³/h) 저소음 범용 오일 로터리 베인 펌프이며, E2M 시리즈는 소형~중대형(2~275 m³/h)까지 폭넓은 용량을 커버하는 투단 로터리 베인 펌프입니다. 연구소·반도체·디스플레이 등 고진공 공정에는 E2M이 적합하고, 일반 산업용 저진공에는 RV가 많이 사용됩니다.",
          },
        },
        {
          "@type": "Question",
          "name": "Edwards GXS와 EXS 드라이펌프의 차이는 무엇인가요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "GXS는 일반 산업용 드라이 스크류 진공펌프이며, EXS는 부식성·유해 가스 환경에 특화된 드라이 스크류 진공펌프입니다. 반도체·디스플레이·화학 공정 등 부식성 가스가 발생하는 환경에는 EXS가 적합합니다.",
          },
        },
        {
          "@type": "Question",
          "name": "진공펌프 오버홀 후 보증 기간은 얼마인가요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "스마텍의 Edwards 진공펌프 오버홀 서비스는 Edwards 정품 부품만 사용하며, 수리 후 보증 조건은 펌프 모델 및 수리 내용에 따라 다릅니다. 정확한 보증 기간은 031-204-7170으로 문의해 주세요.",
          },
        },
      ],
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
