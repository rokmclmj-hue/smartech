export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { id: Number(id), status: "PUBLISHED" },
    select: { title: true, metaDesc: true, tags: true, content: true, publishedAt: true },
  });
  if (!post) return { title: "스마텍 블로그" };

  const ogImage =
    post.content.match(/!\[[^\]]*\]\((https?:\/\/[^\)]+)\)/)?.[1] ??
    "https://www.smartechvacuum.com/og-default.png";

  return {
    title: `${post.title} — 스마텍`,
    description: post.metaDesc || undefined,
    keywords: post.tags || undefined,
    alternates: { canonical: `https://www.smartechvacuum.com/blog/${id}` },
    openGraph: {
      title: `${post.title} — 스마텍`,
      description: post.metaDesc || undefined,
      url: `https://www.smartechvacuum.com/blog/${id}`,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: [{ url: ogImage, alt: post.title }],
      siteName: "스마텍",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — 스마텍`,
      description: post.metaDesc || undefined,
      images: [ogImage],
    },
  };
}

function formatDate(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 마크다운 → React 엘리먼트 (AI 생성 콘텐츠 패턴에 맞춘 간단 파서)
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={`ul-${i}`} className="space-y-1.5 pl-4 my-4">
        {listBuffer.map((item, j) => (
          <li key={j} className="text-[15px] leading-relaxed flex gap-2">
            <span className="text-edred shrink-0 mt-1">—</span>
            <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  }

  function inlineFormat(s: string): string {
    return s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, '<code class="bg-ink/10 px-1 py-0.5 rounded text-[13px] mono">$1</code>');
  }

  while (i < lines.length) {
    const line = lines[i];

    // 빈 줄
    if (line.trim() === "") {
      flushList();
      i++;
      continue;
    }

    // 구분선
    if (/^---+$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-6 border-ink/10" />);
      i++;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={`h1-${i}`} className="display text-[24px] md:text-[28px] leading-tight tracking-[-0.02em] mt-8 mb-3">
          {line.slice(2)}
        </h1>
      );
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-[19px] font-bold leading-snug tracking-tight mt-8 mb-3 border-b hair pb-2">
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-[16px] font-semibold leading-snug mt-6 mb-2">
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // 번호 목록 (1. 2. 3.)
    if (/^\d+\.\s/.test(line)) {
      flushList();
      const olItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        olItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-2 pl-1 my-4 list-decimal list-inside">
          {olItems.map((item, j) => (
            <li key={j} className="text-[15px] leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 글머리 목록 (- * •)
    if (/^[-*•]\s/.test(line)) {
      listBuffer.push(line.slice(2));
      i++;
      continue;
    }

    // 이미지 ![alt](url)
    if (/^!\[.*?\]\(https?:\/\//.test(line)) {
      flushList();
      const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch) {
        elements.push(
          <img key={`img-${i}`} src={imgMatch[2]} alt={imgMatch[1]}
               className="w-full my-6 rounded-sm" />
        );
        i++;
        continue;
      }
    }

    // 일반 단락
    flushList();
    elements.push(
      <p
        key={`p-${i}`}
        className="text-[15px] leading-[1.8] my-3"
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
      />
    );
    i++;
  }

  flushList();
  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const rows = await prisma.$queryRaw<Record<string, unknown>[]>`
    SELECT id, title, category, status, "metaDesc", tags, content, photos,
           "faqSchema", "publishedAt", "createdAt", "updatedAt"
    FROM "BlogPost" WHERE id = ${Number(id)} AND status = 'PUBLISHED'
  `;
  if (!rows.length) return notFound();
  const post = rows[0] as {
    id: number; title: string; category: string; status: string;
    metaDesc: string; tags: string; content: string; photos: string | null;
    faqSchema: string; publishedAt: Date | null; createdAt: Date; updatedAt: Date;
  };

  let postPhotos: string[] = [];
  try { postPhotos = post.photos ? JSON.parse(post.photos) : []; } catch {}

  if (!post) return notFound();

  const relatedPosts = await prisma.blogPost.findMany({
    where: { category: post.category, id: { not: post.id }, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { id: true, title: true, metaDesc: true, publishedAt: true, createdAt: true },
  });

  const tags = post.tags ? post.tags.split(/[,\s]+/).filter(Boolean) : [];

  const articleSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDesc || undefined,
    "datePublished": (post.publishedAt ?? post.createdAt).toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "url": `https://www.smartechvacuum.com/blog/${post.id}`,
    "publisher": { "@type": "Organization", "name": "스마텍", "url": "https://www.smartechvacuum.com" },
    "author":    { "@type": "Organization", "name": "스마텍" },
  });

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleSchema }} />
    {post.faqSchema && (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: post.faqSchema }}
      />
    )}
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-10 md:py-16">
      <div className="max-w-3xl mx-auto">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-2 mono text-[10px] dim tracking-[0.08em] mb-8">
          <Link href="/" className="hover:text-ink transition-colors">홈</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-ink transition-colors">블로그</Link>
          <span>/</span>
          <span className="text-ink truncate max-w-[200px]">{post.category}</span>
        </nav>

        {/* 헤더 */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="mono text-[9px] tracking-[0.1em] bg-edred/10 text-edred px-2.5 py-1 border border-edred/20">
              {post.category}
            </span>
            <span className="mono text-[10px] dim">
              {formatDate(post.publishedAt ?? post.createdAt)}
            </span>
          </div>

          <h1 className="display text-[26px] md:text-[36px] leading-tight tracking-[-0.025em] mb-4">
            {post.title}
          </h1>

          {post.metaDesc && (
            <p className="text-[16px] dim leading-relaxed border-l-2 border-edred pl-4">
              {post.metaDesc}
            </p>
          )}
        </header>

        {/* 본문 — 사진을 실제 위치에 삽입 */}
        <article className="border-t hair pt-8">
          {/* 상단 사진 (글 시작 바로 아래) */}
          {postPhotos[0] && (
            <div className="mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/photos?serve=${encodeURIComponent(postPhotos[0])}`}
                alt="현장 사진" className="w-full object-cover max-h-[420px]" />
            </div>
          )}

          {/* 본문 앞부분 (첫 번째 ~ 두 번째 ## 소제목 전까지) */}
          {renderMarkdown((() => {
            if (!postPhotos[1] && !postPhotos[2]) return post.content;
            const lines = post.content.split('\n');
            let h2 = 0;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('## ')) h2++;
              if (h2 === 2) return lines.slice(0, i).join('\n');
            }
            return lines.slice(0, Math.floor(lines.length / 2)).join('\n');
          })())}

          {/* 중간 사진 (두 번째 소제목 앞) */}
          {postPhotos[1] && (
            <div className="my-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/photos?serve=${encodeURIComponent(postPhotos[1])}`}
                alt="현장 사진" className="w-full object-cover max-h-[380px]" />
            </div>
          )}

          {/* 본문 뒷부분 */}
          {(postPhotos[1] || postPhotos[2]) && renderMarkdown((() => {
            const lines = post.content.split('\n');
            let h2 = 0;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('## ')) h2++;
              if (h2 === 2) {
                const rest = lines.slice(i);
                if (!postPhotos[2]) return rest.join('\n');
                // 하단 사진을 마지막 ## 앞에 삽입
                let lastH2 = rest.length - 1;
                for (let j = rest.length - 1; j >= 0; j--) {
                  if (rest[j].startsWith('## ')) { lastH2 = j; break; }
                }
                return rest.slice(0, lastH2).join('\n');
              }
            }
            return '';
          })())}

          {/* 하단 사진 (마지막 소제목 앞) */}
          {postPhotos[2] && (
            <div className="my-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/photos?serve=${encodeURIComponent(postPhotos[2])}`}
                alt="현장 사진" className="w-full object-cover max-h-[380px]" />
            </div>
          )}

          {/* 본문 맨 끝부분 (마지막 소제목 이후) */}
          {postPhotos[2] && renderMarkdown((() => {
            const lines = post.content.split('\n');
            let h2 = 0, split2 = 0;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('## ')) { h2++; if (h2 === 2) split2 = i; }
            }
            const rest = lines.slice(split2);
            for (let j = rest.length - 1; j >= 0; j--) {
              if (rest[j].startsWith('## ')) return rest.slice(j).join('\n');
            }
            return '';
          })())}
        </article>

        {/* 태그 */}
        {tags.length > 0 && (
          <div className="mt-10 pt-6 border-t hair flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="mono text-[10px] tracking-[0.06em] border hair px-2.5 py-1 text-dim">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 border border-black px-6 py-8 bg-ink/[0.02]">
          <div className="mono text-[9px] tracking-[0.18em] dim uppercase mb-3">문의</div>
          <p className="text-[15px] leading-relaxed mb-5">
            진공펌프 관련 문의 사항이 있으시면 언제든지 스마텍으로 연락 부탁드립니다.
          </p>
          <div className="flex flex-wrap gap-3">
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

        {/* 관련 글 */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t hair">
            <div className="mono text-[9px] tracking-[0.18em] dim uppercase mb-5">관련 글</div>
            <div className="flex flex-col gap-3">
              {relatedPosts.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.id}`}
                  className="group flex flex-col gap-1.5 border hair p-4 hover:border-ink/30 transition-colors"
                >
                  <span className="text-[14px] font-semibold leading-snug group-hover:text-edred transition-colors">
                    {r.title}
                  </span>
                  {r.metaDesc && (
                    <span className="text-[12px] dim leading-relaxed line-clamp-2">{r.metaDesc}</span>
                  )}
                  <span className="mono text-[10px] dim">{formatDate(r.publishedAt ?? r.createdAt)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 목록으로 */}
        <div className="mt-8 pt-6 border-t hair">
          <Link
            href="/blog"
            className="mono text-[11px] tracking-[0.1em] uppercase text-dim hover:text-ink transition-colors"
          >
            ← 블로그 목록으로
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
