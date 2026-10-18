export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getMultiplier, formatKRW } from "@/lib/pricing";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToQuoteButton from "./AddToQuoteButton";
import ModelDetail from "./ModelDetail";
import { findModelBySlug, findModelForProduct, getModelSpecRows, modelSlug } from "@/lib/product-specs";
import { getProductPhotoUrl } from "@/lib/product-icons";

// 검색 결과 제목·설명용 — 카테고리 키("오일펌프(소형 RV)")의 괄호 앞부분을 읽기 쉬운 제품 종류명으로 바꾼다.
const MODEL_TYPE_LABEL: Record<string, string> = {
  "오일펌프": "오일 진공펌프",
  "스크롤펌프": "스크롤 진공펌프",
  "산업용드라이펌프": "산업용 드라이 진공펌프",
  "반도체드라이펌프": "반도체 드라이 진공펌프",
  "터보펌프": "터보분자펌프",
  "부스터펌프": "부스터 진공펌프",
};

// 모델 페이지 설명문에 넣을 핵심 사양(카탈로그 스펙 표에 있는 값만, 빈 값은 건너뜀)
function modelSeoText(category: string, index: number) {
  const typeKey = category.split("(")[0];
  const typeLabel = MODEL_TYPE_LABEL[typeKey] ?? typeKey;
  const rows = getModelSpecRows(category, index);
  const pick = (prefix: string | string[], name: string) => {
    const prefixes = Array.isArray(prefix) ? prefix : [prefix];
    const row = rows.find((r) => prefixes.some((p) => r.label.startsWith(p)));
    const value = row?.value?.trim();
    if (!row || !value || value === "-" || value === "—") return null;
    const shown = row.label.startsWith("최대") ? `최대 ${name}` : name;
    return `${shown} ${value}${row.unit ? ` ${row.unit}` : ""}`;
  };
  const specs = [
    pick(["배기속도", "최대 배기속도"], "배기속도"), // iXH는 행 이름이 "최대 배기속도"
    pick("도달압력", "도달압력"),
    pick("인렛 플랜지", "인렛"),
    pick("무게", "무게"),
  ].filter(Boolean);
  return { typeLabel, specs: specs.join(", ") };
}

export async function generateMetadata({ params }: { params: Promise<{ partNo: string }> }): Promise<Metadata> {
  const { partNo: raw } = await params;
  const partNo = decodeURIComponent(raw);
  const product = await prisma.product.findUnique({ where: { partNo }, select: { description: true } });
  if (product) {
    return {
      title: `${product.description} (${partNo}) — 스마텍 | Edwards Vacuum`,
      description: `Edwards ${product.description} 정품 부품(파트번호 ${partNo}). Edwards 코리아 공식 대리점 스마텍에서 정품 공급·견적, 수원 본사·천안 수리센터에서 수리 상담.`,
      alternates: { canonical: `https://www.smartechvacuum.com/products/${encodeURIComponent(partNo)}` },
    };
  }

  const modelInfo = findModelBySlug(partNo);
  if (modelInfo) {
    const { typeLabel, specs } = modelSeoText(modelInfo.category, modelInfo.index);
    return {
      title: `Edwards ${modelInfo.model} ${typeLabel} 사양·가격 — 스마텍`,
      description: `Edwards ${modelInfo.model} ${typeLabel}${specs ? ` — ${specs}` : " 공식 카탈로그 사양"}. Edwards 코리아 공식 대리점 스마텍에서 정품 견적·수리 상담.`,
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

  // PUBLIC·PENDING·REJECTED 모두 공개 가격(PUBLIC 배율)으로 표시
  // 등급명은 고객에게 절대 노출하지 않음
  const pricingTier = (tier === "PUBLIC" || tier === "GUEST" || tier === "PENDING" || tier === "REJECTED")
    ? "PUBLIC"
    : tier;
  const multiplier = await getMultiplier(pricingTier);
  const displayPrice = Math.round(product.costPrice * multiplier);
  const isLoggedIn = !!session;
  const isPending = tier === "PENDING";
  const photoUrl = getProductPhotoUrl(product.partNo, product.description, product.category);
  // 펌프 파트번호는 모델 사양표(카탈로그 기준)를 함께 보여준다 — 부품·액세서리는 해당 없음
  const model = product.category ? findModelForProduct(product.category, product.description) : null;
  const specRows = model ? getModelSpecRows(model.category, model.index) : [];
  const photoAbsoluteUrl = `https://www.smartechvacuum.com${photoUrl}`;
  const availability = product.isDiscontinued
    ? "https://schema.org/Discontinued"
    : product.stock <= 0
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

  const productSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.description,
    "description": `Edwards ${product.description} — 파트번호 ${product.partNo}. 스마텍(Edwards 코리아 공식 대리점)에서 정품 공급·견적·수리 상담.`,
    "image": photoAbsoluteUrl,
    "brand": { "@type": "Brand", "name": "Edwards Vacuum" },
    "manufacturer": { "@type": "Organization", "name": "Edwards Vacuum" },
    "sku": product.partNo,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "KRW",
      "price": displayPrice,
      "url": `https://www.smartechvacuum.com/products/${encodeURIComponent(product.partNo)}`,
      "availability": availability,
      "seller": { "@type": "Organization", "name": "스마텍", "url": "https://www.smartechvacuum.com" },
    },
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productSchema.replace(/</g, "\\u003c") }} />
      {/* 모바일 하단 고정 바를 위해 하단 패딩 확보 */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-28 md:pb-12">
        <Link href="/products" className="mono text-[12px] text-dim hover:text-edred mb-6 inline-block">
          ← 제품 카탈로그
        </Link>

        {/* 사진 | 이름·가격 — 다른 화면처럼 각진 칸·가는 선·빨강/검정 */}
        <div className="grid grid-cols-1 md:grid-cols-2 border hair bg-white">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px] border-b md:border-b-0 md:border-r hair bg-white">
            <img
              src={photoUrl}
              alt={`Edwards ${product.description} (${product.partNo})`}
              className="absolute inset-0 w-full h-full object-contain p-6"
              loading="lazy"
            />
          </div>
          <div className="p-5 md:p-8 flex flex-col">
            <div className="flex items-center gap-2 mono text-[11px] text-dim tracking-wider">
              <span>EDWARDS</span>
              <span>·</span>
              <span className="break-keep">{product.category}</span>
              {product.isImportant && (
                <span className="ml-auto border border-edred text-edred px-2 py-0.5 text-[11px]">주요 제품</span>
              )}
            </div>
            <h1 className="display text-[24px] md:text-[30px] leading-[1.2] mt-3">
              {product.description}
            </h1>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="mono text-[11px] text-dim tracking-wider">PART NO</span>
              <span className="mono text-[15px]">{product.partNo}</span>
            </div>

            {/* 가격 정보 — 데스크탑에서는 여기에 표시, 모바일에서는 하단 바에서 표시 */}
            <div className="hidden md:block mt-auto pt-8">
              <PriceBlock displayPrice={displayPrice} isLoggedIn={isLoggedIn} isPending={isPending} />
              {/* 견적 담기 버튼 — 데스크탑 */}
              {isLoggedIn && !isPending && (
                <AddToQuoteButton product={{ id: product.id, partNo: product.partNo, description: product.description }} />
              )}
            </div>
          </div>
        </div>

        {model && (
          <section className="mt-10">
            <div className="mono text-[11px] text-dim tracking-widest mb-2">SPECIFICATION</div>
            <h2 className="text-[20px] font-bold tracking-tight">Edwards {model.model} 사양 <span className="text-[14px] font-normal text-dim">(Edwards 공식 카탈로그 기준)</span></h2>
            <p className="mt-1 text-[13px] text-dim break-keep">모델 대표값입니다. 전압·상(단상/3상) 사양에 따라 일부 값이 다를 수 있어 정확한 값은 견적 시 확인해 드립니다.</p>
            <div className="mt-4 border hair bg-white overflow-x-auto">
              <table className="w-full text-[14px] border-collapse">
                <tbody>
                  {specRows.map((row) => (
                    <tr key={row.label} className="border-b hair last:border-b-0">
                      <td className="px-5 py-3 text-dim whitespace-nowrap w-[45%]">{row.label}</td>
                      <td className="px-5 py-3 font-medium">
                        {row.value}{row.unit ? ` ${row.unit}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link
              href={`/products/${modelSlug(model.model)}`}
              className="mt-4 inline-block text-[14px] text-edred hover:underline underline-offset-4"
            >
              {model.model} 다른 전압·사양과 같은 라인업 모델 보기 →
            </Link>
          </section>
        )}

        {product.pdfFile && (
          <section className="mt-10">
            <div className="mono text-[11px] text-dim tracking-widest mb-2">CATALOG</div>
            <h2 className="text-[20px] font-bold tracking-tight">제품 카탈로그</h2>
            <a
              href={`/api/catalog?file=${encodeURIComponent(product.pdfFile)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 border hair bg-white hover:bg-ink hover:text-paper px-4 py-3 text-[14px] transition-colors"
            >
              PDF · {product.pdfFile} →
            </a>
          </section>
        )}
      </div>

      {/* 모바일 하단 고정 바 — 가격 + 견적 담기 버튼 */}
      {/* 오른쪽 여백(pr-24): 오른쪽 아래 채팅 버튼에 견적 담기·로그인 버튼이 가려지지 않게 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-paper border-t hair shadow-lg pl-4 pr-24 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* 가격 표시 — 항상 가격 노출, 등급명 없음 */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-dim leading-none mb-1">
              {isLoggedIn && !isPending ? "귀사 적용가 (VAT 별도)" : "참고가격 (VAT 별도)"}
            </p>
            <p className="text-lg font-bold text-ink leading-tight tabular-nums">
              {formatKRW(displayPrice)}
            </p>
            {isPending && (
              <p className="text-[11px] text-amber-500 mt-0.5">확인 중 — 확정가는 담당자 문의</p>
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
              className="flex-shrink-0 bg-edred text-paper px-5 py-2.5 text-sm font-semibold min-h-[44px] flex items-center"
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
    <div className="border-t hair pt-5">
      <p className="mono text-[11px] text-dim tracking-wider">
        {isLoggedIn && !isPending
          ? "귀사 적용가 · 부가세 별도"
          : "참고가격 · 부가세 별도"}
      </p>
      <p className="display text-[34px] leading-none mt-2 tabular-nums">{formatKRW(displayPrice)}</p>
      {isPending && (
        <p className="text-[13px] text-amber-600 mt-2">확인 중입니다 — 확정가는 담당자에게 문의해 주세요.</p>
      )}
      {!isLoggedIn && (
        <Link
          href="/auth/login"
          className="mt-5 inline-block bg-edred text-paper px-5 py-3 text-[14px] hover:bg-edred3 transition-colors"
        >
          로그인하면 더 좋은 조건으로 →
        </Link>
      )}
    </div>
  );
}
