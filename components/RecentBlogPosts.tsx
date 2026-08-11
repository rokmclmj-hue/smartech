import { prisma } from "@/lib/db";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  "견적문의": "text-blue-600",
  "기술문의": "text-purple-600",
  "단종문의": "text-yellow-600",
  "수리문의": "text-orange-600",
  "보도자료": "text-edred",
  "일반":     "text-dim",
};

function formatDate(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function RecentBlogPosts() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { id: true, slug: true, title: true, metaDesc: true, category: true, publishedAt: true, createdAt: true },
  });

  // 발행된 글이 없으면 섹션 자체를 숨김
  if (posts.length === 0) return null;

  return (
    <section className="py-28 border-b hair">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* 헤더 */}
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 lg:col-span-6">
            <div className="mono text-[11px] dim mb-4">— 07 · KNOWLEDGE</div>
            <h2 className="display leading-[1.05]" style={{ fontSize: "clamp(28px,3.6vw,56px)" }}>
              현장에서 배운<br />
              <span className="italic text-edred">기술 이야기.</span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 flex items-end pb-2">
            <p className="text-[14px] leading-[1.8] text-[#6A6660]">
              진공펌프 수리 경력 30년의 전담 엔지니어와 현장 경험을 바탕으로<br />
              수리·납기·기술 정보를 정직하게 정리합니다.
            </p>
          </div>
        </div>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l hair">
          {posts.map((post) => {
            const colorClass = CATEGORY_COLORS[post.category] ?? "text-dim";
            const date = post.publishedAt ?? post.createdAt;
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug ?? post.id}`}
                className="group border-r border-b hair p-8 flex flex-col gap-4 hover:bg-ink hover:text-paper transition-colors"
              >
                {/* 카테고리 + 날짜 */}
                <div className="flex items-center justify-between">
                  <span className={`mono text-[10px] tracking-[0.1em] uppercase font-medium group-hover:text-paper/70 transition-colors ${colorClass}`}>
                    {post.category}
                  </span>
                  <span className="mono text-[10px] dim group-hover:text-paper/50 transition-colors">
                    {formatDate(date)}
                  </span>
                </div>

                {/* 제목 */}
                <h3 className="display text-[22px] leading-[1.2] tracking-[-0.02em] group-hover:text-paper transition-colors">
                  {post.title}
                </h3>

                {/* 설명 */}
                {post.metaDesc && (
                  <p className="text-[13px] leading-relaxed opacity-70 line-clamp-3 flex-1">
                    {post.metaDesc}
                  </p>
                )}

                {/* 읽기 */}
                <div className="mt-auto mono text-[11px] opacity-0 group-hover:opacity-100 transition-opacity text-edred">
                  읽기 →
                </div>
              </Link>
            );
          })}
        </div>

        {/* 전체 보기 */}
        <div className="mt-8 flex justify-end">
          <Link
            href="/blog"
            className="mono text-[11px] tracking-[0.1em] uppercase border hair px-5 py-2.5 text-dim hover:border-ink hover:text-ink transition-colors"
          >
            전체 글 보기 →
          </Link>
        </div>

      </div>
    </section>
  );
}
