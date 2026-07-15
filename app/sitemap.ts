import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { INDUSTRIES } from "@/lib/industries";
import { allModelSlugs } from "@/lib/product-specs";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.smartechvacuum.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, products] = await Promise.all([
    // 발행된 블로그 글
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    // 개별 제품 페이지
    prisma.product.findMany({
      select: { partNo: true },
    }),
  ]);

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/products/${encodeURIComponent(p.partNo)}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // 모델 단위 스펙 소개 페이지 (예: /products/edwards-rv3) — SKU 페이지와 별개로 검색 노출용
  const modelEntries: MetadataRoute.Sitemap = allModelSlugs().map((slug) => ({
    url: `${BASE_URL}/products/${slug}`,
    lastModified: new Date(),
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
    // 회사 소개
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    // 작성자(Robin) 소개
    { url: `${BASE_URL}/about/robin`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    // 블로그 목록
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    // 제품 카탈로그
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    // 수리 접수
    { url: `${BASE_URL}/repair`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    // 산업 분야 20개
    ...industryEntries,
    // 개별 제품 페이지
    ...productEntries,
    // 모델 단위 스펙 소개 페이지
    ...modelEntries,
    // 개별 블로그 글
    ...blogEntries,
  ];
}
