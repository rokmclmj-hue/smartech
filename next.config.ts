import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 구 사이트 URL → 새 사이트 대응 페이지로 리다이렉트 (301 영구이동)
      { source: "/INTRO/:path*",    destination: "/",          permanent: true },
      { source: "/About-Us",        destination: "/about",     permanent: true },
      // 🔴 한글 경로는 반드시 퍼센트 인코딩으로 적어야 한다. Next.js redirects()는 source를
      // 실제 요청 경로(브라우저가 항상 퍼센트 인코딩해서 보냄)와 그대로 비교하기 때문에,
      // 한글을 그대로 적으면 절대 매칭되지 않는다(2026-08-10 발견 — /견적문의가 6/24부터
      // 지금까지 실제로는 한 번도 작동한 적 없었음. 로컬 빌드+실제 요청 테스트로 확인).
      { source: "/%EA%B2%AC%EC%A0%81%EB%AC%B8%EC%9D%98", destination: "/quote", permanent: true }, // /견적문의
      { source: "/blog/14",         destination: "/blog",      permanent: true },
      { source: "/blog/15",         destination: "/blog",      permanent: true },
      { source: "/blog/16",         destination: "/blog",      permanent: true },
      { source: "/blog/63",         destination: "/blog",      permanent: true },
      { source: "/blog/64",         destination: "/blog",      permanent: true },
      { source: "/blog/65",         destination: "/blog",      permanent: true },
      // 2026-08-10 서치콘솔 404 재점검 — /Products/view/* 규칙은 /products 전체를
      // 삼키는 사고(0fca8d3)로 삭제됐던 것을 "view/" 세그먼트 포함한 좁은 패턴으로 재추가.
      // 🔴 bare "/Products"(경로 없음)는 일부러 추가 안 함 — Next.js redirects()가
      // 대소문자를 구분하지 않아서 실제 소문자 "/products"(제품 목록 페이지)까지
      // 이 규칙에 걸려 자기 자신으로 무한 리다이렉트되는 위험이 있음(0fca8d3와 동일 원인).
      { source: "/Products/view/:path*", destination: "/",      permanent: true },
      { source: "/config",           destination: "/",          permanent: true },
      { source: "/%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD", destination: "/", permanent: true }, // /공지사항
      { source: "/Location",         destination: "/about",     permanent: true },
      { source: "/%EC%A0%9C%ED%92%88-%EC%83%81%EC%84%B8", destination: "/products", permanent: true }, // /제품-상세
      // 2026-08-24 서치콘솔 404 재점검 — /service 소문자 라우트가 없어 대소문자 충돌 위험 없음(0fca8d3와 다름)
      { source: "/Service",          destination: "/",          permanent: true },
      // 2026-09-03 서치콘솔 404 재점검 — 출처불명 잘못된 링크(백링크·크롤러 오류로 추정), 안전하게 홈으로 리다이렉트
      { source: "/smartechvacuum",   destination: "/",          permanent: true },
      { source: "/&",                destination: "/",          permanent: true },
    ];
  },
  serverExternalPackages: ["bcryptjs", "@prisma/client", "prisma", "xlsx", "sharp"],
  outputFileTracingIncludes: {
    "/api/chat": ["./data/simulation-cases/**"],
    "/api/admin/delivery-notes": ["./public/bank-account.png"],
    "/api/admin/delivery-notes/[id]/pdf": ["./public/bank-account.png"],
  },
  outputFileTracingExcludes: {
    "*": [
      "./data/**",
      "./blog-agents/**",
      "./smartech-cad/**",
      "./scripts/**",
      "./public/catalogs/**",
    ],
  },
  // Allow Cloudflare Tunnel (and any *.trycloudflare.com quick tunnels) to
  // reach dev-only resources like /_next/webpack-hmr, /__nextjs_font/*, etc.
  // Without this, the browser loading from the tunnel never receives client
  // chunks/HMR updates, and interactive components (e.g. Counter) stay at
  // their SSR initial value (0).
  allowedDevOrigins: [
    "stud-clearance-phones-purchasing.trycloudflare.com",
    "periods-firewall-open-gathered.trycloudflare.com",
    "*.trycloudflare.com",
  ],
};

export default nextConfig;
