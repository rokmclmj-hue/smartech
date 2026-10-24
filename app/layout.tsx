import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./mobile-inputs.css";
import "./korean-text.css";
import "./quote/[id]/quote-styles.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import PhoneClickTracker from "@/components/PhoneClickTracker";
import { SessionProvider } from "./providers";

export const metadata: Metadata = {
  title: "스마텍 — Edwards 코리아 공식 대리점 | 진공펌프 판매·수리",
  description: "Edwards 코리아 공식 대리점 스마텍(산업용·과학용 진공 모두 담당). 2006년 Edwards 코리아 합류, 2011년 창업. RV·E2M·GXS·nXDS·STP·nEXT 전 라인업 · 딜러/OEM/소비자 등급별 가격 · 온라인 견적 시스템.",
  metadataBase: new URL("https://www.smartechvacuum.com"),
  verification: {
    other: { "naver-site-verification": "42d90b9cf0599e0f8b74c3bf5abc5089c7706274" },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "스마텍",
    title: "스마텍 — Edwards 코리아 공식 대리점",
    description: "Edwards 코리아 공식 대리점(산업용·과학용 진공 모두 담당). 진공펌프 판매·수리·기술상담.",
    images: [{ url: "https://www.smartechvacuum.com/og-default.png", width: 1200, height: 630, alt: "스마텍 — Edwards 코리아 공식 대리점" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "스마텍 — Edwards 코리아 공식 대리점",
    description: "Edwards 코리아 공식 대리점(산업용·과학용 진공 모두 담당). 진공펌프 판매·수리·기술상담.",
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
      // 공식 채널 — 검색엔진·AI가 같은 회사로 연결하도록 (이름이 비슷한 해외 업체와 구분 목적, 2026-09-25)
      "sameAs": [
        "https://www.youtube.com/channel/UCGVGHByF7EQzRIBXvWkJNEw",
        "https://blog.naver.com/smartechvacuum",
        "https://x.com/smartechvacuum",
        "https://www.google.com/maps?cid=2249450778476640442",
      ],
      "description": "Edwards 코리아 공식 대리점(Industrial Vacuum·Scientific Vacuum 모두 담당). 진공펌프 판매·수리·기술상담. 2011년 창업, 대표 진공산업 경력 2006년부터, 진공펌프 수리 경력 30년의 전담 엔지니어 보유. ISO 9001·ISO 14001 인증(반도체용 펌프 및 액세서리 개발·제조), 진공펌프용 소음장치 특허 2건(제10-1998403호·제10-2312460호) 보유.",
      // ISO 인증 — 원본 대조(2026-10-17), 범위는 개발·제조(수리 아님)
      "hasCredential": [
        { "@type": "EducationalOccupationalCredential", "name": "ISO 9001:2015 품질경영시스템", "credentialCategory": "certification", "identifier": "JK-19604", "validUntil": "2028-09-18", "recognizedBy": { "@type": "Organization", "name": "아이아이씨인증원(IIC)" } },
        { "@type": "EducationalOccupationalCredential", "name": "ISO 14001:2015 환경경영시스템", "credentialCategory": "certification", "identifier": "JEK-23613", "validUntil": "2028-09-18", "recognizedBy": { "@type": "Organization", "name": "아이아이씨인증원(IIC)" } },
      ],
      "areaServed": { "@type": "Country", "name": "대한민국" },
      // 전문 분야·제공 서비스 — AI가 "판매·수리 전문 업체"로 분류하도록 (2026-10-16, 실제 취급·수리 실적 기준)
      "knowsAbout": [
        "진공펌프",
        "오일 로터리 베인 펌프",
        "드라이 스크롤 펌프",
        "드라이펌프",
        "반도체용 드라이펌프",
        "루츠 부스터 펌프",
        "터보분자 펌프",
        "진공펌프 수리·오버홀",
        "진공 시스템 배기 시뮬레이션",
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "스마텍 서비스",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Edwards 진공펌프 판매", "url": "https://www.smartechvacuum.com/products" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "진공펌프 수리·오버홀", "url": "https://www.smartechvacuum.com/repair" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "반도체용 드라이펌프(iH·iQDP) 수리", "url": "https://www.smartechvacuum.com/industries/semiconductor" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Edwards 시뮬레이션 기반 진공펌프 선정 상담", "url": "https://www.smartechvacuum.com/#b2b" } },
        ],
      },
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
      "url": "https://www.smartechvacuum.com/repair",
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
      "description": "Edwards 진공펌프(RV·E2M·nES·GXS·EXS·nXDS·XDS·iH·iQDP·iXH·nEXT·STP)와 Pfeiffer·우성진공 등 타사 펌프 수리·오버홀·부품 교체. 출고 전 도달 진공도·운전 전류·온도·누설 검사와 시운전 후 검사성적서 발행. 보증: 드라이펌프 6개월, 오일 로터리 펌프 3개월. 수원 본사 및 천안 수리센터 운영.",
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
        {/* 직원 방문 제외: 관리자 화면이거나, 관리자 화면에 들어간 적 있는 브라우저(smartech_staff 표시)는 GA4에 보내지 않음 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname;if(p==='/admin'||p.indexOf('/admin/')===0||localStorage.getItem('smartech_staff')==='1'){window['ga-disable-G-KRD96T8LX6']=true;}}catch(e){}})();window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-KRD96T8LX6');`,
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
          <PhoneClickTracker />
        </SessionProvider>
      </body>
    </html>
  );
}
