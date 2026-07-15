export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getMultiplier, formatKRW } from "@/lib/pricing";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToQuoteButton from "./AddToQuoteButton";
import ModelDetail from "./ModelDetail";
import { findModelBySlug } from "@/lib/product-specs";

export async function generateMetadata({ params }: { params: Promise<{ partNo: string }> }): Promise<Metadata> {
  const { partNo: raw } = await params;
  const partNo = decodeURIComponent(raw);
  const product = await prisma.product.findUnique({ where: { partNo }, select: { description: true } });
  if (product) {
    return {
      title: `${product.description} (${partNo}) — 스마텍 | Edwards Vacuum`,
      description: `Edwards ${product.description} 파트번호 ${partNo}. 스마텍에서 정품 공급·견적·문의.`,
      alternates: { canonical: `https://www.smartechvacuum.com/products/${encodeURIComponent(partNo)}` },
    };
  }

  const modelInfo = findModelBySlug(partNo);
  if (modelInfo) {
    return {
      title: `Edwards ${modelInfo.model} 사양·가격 — 스마텍 | Edwards Vacuum`,
      description: `Edwards ${modelInfo.model} 배기속도·도달압력·플랜지 등 공식 카탈로그 사양. 스마텍에서 정품 공급·견적 문의.`,
      alternates: { canonical: `https://www.smartechvacuum.com/products/${encodeURIComponent(partNo)}` },
    };
  }

  return { title: "스마텍" };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ partNo: string }> }) {
  const { partNo: rawPartNo } = await params;
  const partNo = decodeURIComponent(rawPartNo);
  const product = await prisma.product.findUnique({ where: { partNo } });

  if (!product) {
    const modelInfo = findModelBySlug(partNo);
    if (modelInfo) return <ModelDetail {...modelInfo} />;
    return notFound();
  }

  const session = await auth();
  const tier = (session?.user as { tier?: string })?.tier ?? "PUBLIC";

  // PUBLIC·PENDING 모두 공개 가격(PUBLIC 배율)으로 표시
  // 등급명은 고객에게 절대 노출하지 않음
  const pricingTier = (tier === "PUBLIC" || tier === "GUEST" || tier === "PENDING")
    ? "PUBLIC"
    : tier;
  const multiplier = await getMultiplier(pricingTier);
  const displayPrice = Math.round(product.costPrice * multiplier);
  const isLoggedIn = !!session;
  const isPending = tier === "PENDING";

  const productSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.description,
    "description": `Edwards ${product.description} — 파트번호 ${product.partNo}. 스마텍(Edwards Vacuum 한국 공식 대리점)에서 정품 공급·견적·수리 상담.`,
    "brand": { "@type": "Brand", "name": "Edwards Vacuum" },
    "manufacturer": { "@type": "Organization", "name": "Edwards Vacuum" },
    "sku": product.partNo,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "KRW",
      "price": displayPrice,
      "availability": "https://schema.org/InStock",
      "url": `https://www.smartechvacuum.com/products/${encodeURIComponent(product.partNo)}`,
      "seller": { "@type": "Organization", "name": "스마텍", "url": "https://www.smartechvacuum.com" },
    },
  });

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "이 제품의 납기는 얼마나 걸리나요?",
        "acceptedAnswer": { "@type": "Answer", "text": "재고 보유 제품은 즉시 출고 가능합니다. 수입 발주 제품은 4~8주 소요됩니다. 정확한 납기는 031-204-7170으로 문의해 주세요." },
      },
      {
        "@type": "Question",
        "name": "Edwards 정품 부품인가요?",
        "acceptedAnswer": { "@type": "Answer", "text": "스마텍은 Edwards Vacuum 한국 공식 대리점으로 모든 제품은 Edwards 정품입니다. 정품 인증서 발급이 가능합니다." },
      },
      {
        "@type": "Question",
        "name": "설치·시운전 지원이 되나요?",
        "acceptedAnswer": { "@type": "Answer", "text": "Edwards 공인 엔지니어의 현장 출장 설치·시운전 지원이 가능합니다. 031-204-7170으로 문의해 주세요." },
      },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      {/* 모바일 하단 고정 바를 위해 하단 패딩 확보 */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-28 md:pb-12">
        <Link href="/products" className="text-sm text-gray-500 hover:text-blue-600 mb-6 inline-block">
          ← 제품 목록
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8 shadow-sm">
          {product.isImportant && (
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full mb-4 inline-block">주요 제품</span>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 mt-2 mb-1 leading-snug">
            {product.description}
          </h1>
          <p className="text-blue-600 font-mono text-sm mb-2">Part No: {product.partNo}</p>
          <p className="text-gray-500 text-sm mb-6 md:mb-8">카테고리: {product.category}</p>

          {/* 가격 정보 — 데스크탑에서는 여기에 표시, 모바일에서는 하단 바에서 표시 */}
          <div className="hidden md:block border-t pt-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">가격 정보</h2>
            <PriceBlock displayPrice={displayPrice} isLoggedIn={isLoggedIn} isPending={isPending} />
          </div>

          {/* 견적 담기 버튼 — 데스크탑 */}
          {isLoggedIn && !isPending && (
            <div className="hidden md:block">
              <AddToQuoteButton product={{ id: product.id, partNo: product.partNo, description: product.description }} />
            </div>
          )}

          {product.pdfFile && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">제품 카탈로그</h2>
              <a
                href={`/api/catalog?file=${encodeURIComponent(product.pdfFile)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                📄 {product.pdfFile}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 하단 고정 바 — 가격 + 견적 담기 버튼 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-paper border-t border-gray-200 shadow-lg px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* 가격 표시 — 항상 가격 노출, 등급명 없음 */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 leading-none mb-0.5">
              {isLoggedIn && !isPending ? "귀사 적용가 (VAT 별도)" : "참고가격 (VAT 별도)"}
            </p>
            <p className="text-lg font-bold text-blue-700 leading-tight tabular-nums">
              {formatKRW(displayPrice)}
            </p>
            {isPending && (
              <p className="text-[10px] text-amber-500 mt-0.5">확인 중 — 확정가는 담당자 문의</p>
            )}
          </div>

          {/* 견적 담기 버튼 */}
          {isLoggedIn && !isPending ? (
            <div className="flex-shrink-0">
              <AddToQuoteButton
                product={{ id: product.id, partNo: product.partNo, description: product.description }}
                compact
              />
            </div>
          ) : !isLoggedIn ? (
            <Link
              href="/auth/login"
              className="flex-shrink-0 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold min-h-[44px] flex items-center"
            >
              로그인
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}

function PriceBlock({
  displayPrice,
  isLoggedIn,
  isPending,
}: {
  displayPrice: number;
  isLoggedIn: boolean;
  isPending: boolean;
}) {
  return (
    <div className="bg-blue-50 rounded-xl p-6">
      <p className="text-3xl font-bold text-blue-700">{formatKRW(displayPrice)}</p>
      <p className="text-xs text-gray-500 mt-1">
        {isLoggedIn && !isPending
          ? "귀사 적용가 · 부가세 별도"
          : "참고가격 · 부가세 별도"}
      </p>
      {isPending && (
        <p className="text-xs text-amber-500 mt-2">확인 중입니다 — 확정가는 담당자에게 문의해 주세요.</p>
      )}
      {!isLoggedIn && (
        <Link
          href="/auth/login"
          className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-500 transition-colors"
        >
          로그인하면 더 좋은 조건으로 →
        </Link>
      )}
    </div>
  );
}
