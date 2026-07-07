import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/", "/mypage/"],
      },
      // AI 크롤러 명시적 허용 — 이름별 규칙은 와일드카드 규칙을 대체하므로
      // 관리자·인증 경로 disallow를 여기에도 똑같이 넣어줘야 함
      { userAgent: "GPTBot", allow: "/", disallow: ["/admin/", "/api/", "/auth/", "/mypage/"] },
      { userAgent: "Claude-Web", allow: "/", disallow: ["/admin/", "/api/", "/auth/", "/mypage/"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/admin/", "/api/", "/auth/", "/mypage/"] },
      { userAgent: "CCBot", allow: "/", disallow: ["/admin/", "/api/", "/auth/", "/mypage/"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/admin/", "/api/", "/auth/", "/mypage/"] },
      { userAgent: "Googlebot-Extended", allow: "/", disallow: ["/admin/", "/api/", "/auth/", "/mypage/"] },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.smartechvacuum.com"}/sitemap.xml`,
  };
}
