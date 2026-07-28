import { MetadataRoute } from "next";

const PRIVATE_PATHS = ["/admin/", "/api/", "/auth/", "/mypage/", "/catalogs/"];

// AI 크롤러 등 이름별 User-agent 규칙은 와일드카드(*) 규칙을 대체하므로
// 관리자·인증 경로 disallow를 매 규칙에 똑같이 넣어야 함
const AI_CRAWLERS = ["GPTBot", "Claude-Web", "ClaudeBot", "CCBot", "PerplexityBot", "Googlebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE_PATHS })),
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.smartechvacuum.com"}/sitemap.xml`,
  };
}
