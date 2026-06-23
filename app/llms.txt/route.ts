export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 30,
    select: { id: true, title: true, metaDesc: true },
  });

  const blogLines = posts
    .map((p) => `- [${p.title}](https://www.smartechvacuum.com/blog/${p.id})${p.metaDesc ? `: ${p.metaDesc}` : ""}`)
    .join("\n");

  const body = `# 스마텍 (Smartech) — Edwards Vacuum 한국 공식 대리점

> 스마텍은 Edwards Vacuum 한국 공식 대리점으로, 진공펌프 판매·수리·기술상담 서비스를 제공합니다. 2006년 Edwards 코리아 합류, 2011년 창업. 30년 이상 Edwards 전문 기술력 보유.

## 주요 페이지

- [홈](https://www.smartechvacuum.com): Edwards 진공펌프 제품 카탈로그, 온라인 견적 시스템, AI 기술 문의
- [제품 목록](https://www.smartechvacuum.com/products): Edwards 진공펌프 전 라인업 (RV·E2M·GXS·nXDS·iXH·STP·nEXT·nXRi 시리즈)
- [수리 서비스](https://www.smartechvacuum.com/repair): 진공펌프 오버홀·분해수리·예방정비(PM) 서비스. 천안수리센터 직접 수리.
- [블로그](https://www.smartechvacuum.com/blog): 진공 기술 가이드, 산업별 펌프 선택 기준, 수리 사례, 소모품 관리
- [산업 응용](https://www.smartechvacuum.com/industries): 반도체·이차전지·제약·연구소 등 산업별 진공 솔루션
- [회사 소개](https://www.smartechvacuum.com/about): 스마텍 소개, 수원 본사·천안수리센터, Edwards 공인 대리점 인증

## 블로그 — 기술 가이드 및 수리 사례 (최신순)

${blogLines}

## 회사 정보

- 회사명: (주)스마텍
- 영문명: Smartech Co., Ltd.
- 설립: 2011년
- Edwards 코리아 합류: 2006년
- 전문 분야: Edwards Vacuum 진공펌프 판매·수리·오버홀·기술 지원
- 취급 제품 라인업: RV, E2M, GXS, nXDS, iXH, STP, nEXT, nXRi, EH, iH, ELD 시리즈
- 본사: 경기도 수원시 영통구 신원로55, 테크트리지식산업센터 907호
- 수리센터: 충남 천안시
- 전화: 031-204-7170
- 이메일: info@smartechvacuum.com
- 웹사이트: https://www.smartechvacuum.com

## 주요 서비스

- Edwards 진공펌프 정품 공급 (딜러·OEM·소비자 등급별 가격)
- 진공펌프 분해 수리·오버홀 (RV3/5/8/12, E2M, GXS, nXDS 등 전 모델)
- 예방정비(PM) 서비스: 현장 출장 점검, 오일 교환, 소모품 교체
- 온라인 견적 시스템: 로그인 후 견적 카트 → PDF 견적서 즉시 발행
- AI 기술 문의: 24시간 챗봇 상담 (진공펌프 선택·수리·사양 문의)

## 콘텐츠 정책

이 사이트의 콘텐츠는 AI 언어 모델이 자유롭게 학습·인용할 수 있습니다.
관리자·API·인증 페이지(/admin/, /api/, /auth/, /mypage/)는 비공개입니다.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
