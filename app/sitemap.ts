import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { INDUSTRIES } from "@/lib/industries";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smartechvacuum.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 발행된 블로그 글
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const industryEntries: MetadataRoute.Sitemap = INDUSTRIES.map((ind) => ({
    url: `${BASE_URL}/industries/${ind.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    // 홈
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    // 블로그 목록
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    // 제품
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    // 수리 접수
    { url: `${BASE_URL}/repair`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    // 산업 분야 20개
    ...industryEntries,
    // 개별 블로그 글
    ...blogEntries,
  ];
}
