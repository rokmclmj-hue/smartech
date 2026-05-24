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
    url: "https://www.smartechvacuum.com",
    siteName: "스마텍",
    title: "스마텍 — Edwards Vacuum 한국 공식 대리점",
    description: "Edwards Vacuum 한국 공식 대리점. 진공펌프 판매·수리·기술상담 토탈 솔루션.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "스마텍 — Edwards Vacuum 한국 공식 대리점" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "스마텍 — Edwards Vacuum 한국 공식 대리점",
    description: "Edwards Vacuum 한국 공식 대리점. 진공펌프 판매·수리·기술상담 토탈 솔루션.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
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
