import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 구 사이트 URL → 새 사이트 대응 페이지로 리다이렉트 (301 영구이동)
      { source: "/INTRO/:path*",    destination: "/#about",    permanent: true },
      { source: "/Products",        destination: "/#products", permanent: true },
      { source: "/Products/:path*", destination: "/#products", permanent: true },
    ];
  },
  serverExternalPackages: ["bcryptjs", "@prisma/client", "prisma", "xlsx", "sharp"],
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
