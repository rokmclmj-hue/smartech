import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs"],
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
