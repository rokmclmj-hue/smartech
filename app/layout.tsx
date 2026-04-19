import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "./providers";

export const metadata: Metadata = {
  title: "스마텍 — Edwards Vacuum 한국 공식 대리점 | 진공 토탈 솔루션",
  description: "Edwards Vacuum 한국 공식 대리점 스마텍. 2006년 본사 입사, 2011년 창업. RV·E2M·GXS·nXDS·STP·nEXT 전 라인업 · 딜러/OEM/소비자 등급별 가격 · 온라인 견적 시스템.",
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
      <body className="min-h-screen bg-paper text-ink antialiased">
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
