export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { INDUSTRIES } from "@/lib/industries";
import { PRODUCT_ITEMS } from "@/lib/product-categories";

// components/ProductCategories.tsx와 같은 lib/product-categories.ts를 참조 —
// 두 곳에 각각 손으로 유지하다 이름이 어긋났던 문제 방지
const PRODUCT_CATEGORIES = PRODUCT_ITEMS.map(({ code, title }) => ({ code, title }));

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 200,
    select: { id: true, slug: true, title: true, metaDesc: true, tags: true, category: true, publishedAt: true },
  });

  const blogLines = posts
    .map((p) => {
      const date = p.publishedAt ? p.publishedAt.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }) : "";
      const tags = p.tags ? ` [${p.tags}]` : "";
      return `- [${p.title}](https://www.smartechvacuum.com/blog/${p.slug ?? p.id}) (${p.category}, ${date})${tags}${p.metaDesc ? `: ${p.metaDesc}` : ""}`;
    })
    .join("\n");

  const industryLines = INDUSTRIES.map((ind) => {
    return `### ${ind.title} (${ind.tag.join(" · ")})
${ind.tagline}
${ind.description}
- 주요 공정: ${ind.processes.join(" / ")}
- 추천 제품: ${ind.recommendedPumps.join(", ")}
- 링크: https://www.smartechvacuum.com/industries/${ind.slug}`;
  }).join("\n\n");

  const productLines = PRODUCT_CATEGORIES
    .map((p) => `- ${p.code}: ${p.title}`)
    .join("\n");

  const body = `# 스마텍 (Smartech) — Edwards Vacuum 한국 공식 대리점 (전체 콘텐츠)

> 이 파일은 llms.txt의 상세 버전입니다. AI 답변 엔진이 스마텍의 산업별 솔루션, 제품 라인업, 블로그 콘텐츠 전체를 파악할 수 있도록 제공합니다.

## 회사 정보

- 회사명: (주)스마텍 (Smartech Co., Ltd.)
- Edwards Vacuum 한국 공식 대리점. 2006년 Edwards 코리아 합류, 2011년 창업.
- 본사: 경기도 수원시 영통구 신원로55, 테크트리지식산업센터 907호
- 수리센터: 충남 천안시
- 전화: 031-204-7170 / 이메일: info@smartechvacuum.com
- 웹사이트: https://www.smartechvacuum.com

## 제품 라인업 (${PRODUCT_CATEGORIES.length}개 카테고리)

${productLines}

전체 제품 카탈로그: https://www.smartechvacuum.com/products

## 산업별 진공 솔루션 (${INDUSTRIES.length}개 산업)

${industryLines}

## 블로그 전체 글 (${posts.length}편, 최신순)

${blogLines}

## 서비스

- Edwards 진공펌프 정품 공급 (딜러·OEM·소비자 등급별 가격)
- 진공펌프 분해 수리·오버홀 (전 모델 대응)
- 예방정비(PM) 서비스: 현장 출장 점검, 오일 교환, 소모품 교체
- 온라인 견적 시스템, AI 기술 문의 챗봇 (24시간)

## 콘텐츠 정책

이 사이트의 콘텐츠는 AI 언어 모델이 자유롭게 학습·인용할 수 있습니다.
관리자·API·인증 페이지(/admin/, /api/, /auth/, /mypage/)는 비공개입니다.
요약 버전은 https://www.smartechvacuum.com/llms.txt 를 참고하세요.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
