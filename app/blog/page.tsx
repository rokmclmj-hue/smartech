export const revalidate = 3600;

import { prisma } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

const PAGE_SIZE = 9;
const BASE_URL = "https://www.smartechvacuum.com";

const CATEGORY_COLORS: Record<string, string> = {
  "견적문의": "bg-blue-50 text-blue-700 border-blue-100",
  "기술문의": "bg-purple-50 text-purple-700 border-purple-100",
  "단종문의": "bg-yellow-50 text-yellow-700 border-yellow-100",
  "수리문의": "bg-orange-50 text-orange-700 border-orange-100",
  "일반":     "bg-ink/5 text-dim border-ink/10",
};

const CATEGORIES = ["기술문의", "수리문의", "견적문의", "납기문의", "단종문의"];

function formatDate(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function buildCanonical(category?: string, page?: number) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `${BASE_URL}/blog${qs ? `?${qs}` : ""}`;
}

type SearchParams = Promise<{ category?: string; page?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { category, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const canonical = buildCanonical(category, page);

  const title = category
    ? `${category} — 스마텍 블로그 | 진공펌프 기술 정보`
    : "블로그 — 스마텍 | 진공펌프 기술 정보";

  return {
    title,
    description: "에드워드 진공펌프 수리·납기·기술 정보를 현장 경험 기반으로 정리합니다. 스마텍 공식 블로그.",
    alternates: { canonical },
  };
}

export default async function BlogListPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const where = {
    status: "PUBLISHED",
    ...(category ? { category } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        metaDesc: true,
        category: true,
        tags: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-10 md:py-16">
      {/* 헤더 */}
      <div className="mb-10 md:mb-14">
        <div className="mono text-[10px] tracking-[0.22em] dim uppercase mb-3">
          Smartech · Blog
        </div>
        <h1 className="display text-[32px] md:text-[48px] leading-none tracking-[-0.03em]">
          기술 정보 &amp; 현장 이야기
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] dim max-w-xl">
          진공펌프 수리 경력 30년의 전담 엔지니어와 현장 경험을 바탕으로, 수리·납기·기술 정보를 정직하게 정리합니다.
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/blog"
          className={`mono text-[10px] tracking-[0.08em] px-3 py-1.5 border transition-colors ${
            !category ? "bg-ink text-paper border-ink" : "border-ink/20 text-dim hover:border-ink hover:text-ink"
          }`}
        >
          전체
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/blog?category=${cat}`}
            className={`mono text-[10px] tracking-[0.08em] px-3 py-1.5 border transition-colors ${
              category === cat ? "bg-ink text-paper border-ink" : "border-ink/20 text-dim hover:border-ink hover:text-ink"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* 글 목록 */}
      {posts.length === 0 ? (
        <div className="py-24 text-center mono text-[11px] dim tracking-[0.12em] uppercase">
          — 아직 발행된 글이 없습니다
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const colorClass = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS["일반"];
              const date = post.publishedAt ?? post.createdAt;
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug ?? post.id}`}
                  className="group flex flex-col border hair bg-paper hover:border-ink/30 transition-colors"
                >
                  <div className={`px-5 py-2.5 border-b ${colorClass}`}>
                    <span className="mono text-[9px] tracking-[0.1em] font-medium uppercase">
                      {post.category}
                    </span>
                  </div>
                  <div className="flex-1 px-5 py-5 flex flex-col gap-3">
                    <h2 className="text-[15px] font-semibold leading-snug tracking-tight group-hover:text-edred transition-colors line-clamp-3">
                      {post.title}
                    </h2>
                    {post.metaDesc && (
                      <p className="text-[13px] dim leading-relaxed line-clamp-3">
                        {post.metaDesc}
                      </p>
                    )}
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="mono text-[10px] dim">{formatDate(date)}</span>
                      <span className="mono text-[10px] text-edred opacity-0 group-hover:opacity-100 transition-opacity">
                        읽기 →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-1">
              {/* 이전 */}
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="mono text-[11px] px-4 py-2 border border-line hover:border-ink text-dim hover:text-ink transition-colors"
                >
                  ← 이전
                </Link>
              ) : (
                <span className="mono text-[11px] px-4 py-2 border border-line text-dim/40 cursor-not-allowed">
                  ← 이전
                </span>
              )}

              {/* 페이지 번호 — 첫/끝 + 현재±1, 갭에 … 삽입 */}
              {(() => {
                const shown = Array.from(
                  new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages))
                ).sort((a, b) => a - b);
                return shown.map((p, idx) => {
                  const prev = shown[idx - 1];
                  return (
                    <span key={p} className="flex items-center">
                      {prev !== undefined && p - prev > 1 && (
                        <span className="mono text-[11px] px-2 text-dim">…</span>
                      )}
                      <Link
                        href={pageHref(p)}
                        className={`mono text-[11px] px-3.5 py-2 border transition-colors ${
                          p === page
                            ? "bg-ink text-paper border-ink"
                            : "border-line text-dim hover:border-ink hover:text-ink"
                        }`}
                      >
                        {p}
                      </Link>
                    </span>
                  );
                });
              })()}

              {/* 다음 */}
              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  className="mono text-[11px] px-4 py-2 border border-line hover:border-ink text-dim hover:text-ink transition-colors"
                >
                  다음 →
                </Link>
              ) : (
                <span className="mono text-[11px] px-4 py-2 border border-line text-dim/40 cursor-not-allowed">
                  다음 →
                </span>
              )}
            </div>
          )}

          {/* 총 글 수 */}
          <p className="mt-4 text-center mono text-[10px] text-dim">
            {total}편 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}편
          </p>
        </>
      )}

      {/* 문의 유도 */}
      <div className="mt-16 border border-black px-6 md:px-10 py-8 md:py-10 bg-ink/[0.02] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="mono text-[9px] tracking-[0.18em] dim uppercase mb-2">문의</div>
          <p className="text-[15px] leading-relaxed">
            진공펌프 관련 문의 사항이 있으시면 언제든지 스마텍으로 연락 부탁드립니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            href="/#b2b"
            className="mono text-[11px] tracking-[0.1em] uppercase border border-black bg-white text-black px-5 py-2.5 hover:bg-black hover:text-white transition-colors"
          >
            견적 문의 →
          </Link>
          <Link
            href="/repair"
            className="mono text-[11px] tracking-[0.1em] uppercase border border-black bg-white text-black px-5 py-2.5 hover:bg-black hover:text-white transition-colors"
          >
            수리 문의 →
          </Link>
          <a
            href="tel:031-204-7170"
            className="mono text-[11px] tracking-[0.1em] uppercase border border-black bg-edred text-white px-5 py-2.5 hover:bg-black transition-colors"
          >
            031-204-7170
          </a>
        </div>
      </div>
    </div>
  );
}
