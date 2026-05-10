export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getMultiplier, formatKRW } from "@/lib/pricing";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToQuoteButton from "./AddToQuoteButton";

export default async function ProductDetailPage({ params }: { params: Promise<{ partNo: string }> }) {
  const { partNo: rawPartNo } = await params;
  const partNo = decodeURIComponent(rawPartNo);
  const product = await prisma.product.findUnique({ where: { partNo } });
  if (!product) return notFound();

  const session = await auth();
  const tier = (session?.user as { tier?: string })?.tier ?? "GUEST";
  const showPrice = tier !== "GUEST" && tier !== "PENDING";
  const multiplier = showPrice ? await getMultiplier(tier) : null;
  const displayPrice = showPrice && multiplier ? Math.round(product.costPrice * multiplier) : null;

  return (
    <>
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
            <PriceBlock displayPrice={displayPrice} tier={tier} />
          </div>

          {/* 견적 담기 버튼 — 데스크탑 */}
          {session && tier !== "PENDING" && (
            <div className="hidden md:block">
              <AddToQuoteButton product={{ id: product.id, partNo: product.partNo, description: product.description }} />
            </div>
          )}

          {product.pdfFile && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">제품 카탈로그</h2>
              <a
                href={`/catalogs/${encodeURIComponent(product.pdfFile)}`}
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
          {/* 가격 표시 */}
          <div className="flex-1 min-w-0">
            {displayPrice ? (
              <>
                <p className="text-[10px] text-gray-400 leading-none mb-0.5">등급별 가격 (VAT 별도)</p>
                <p className="text-lg font-bold text-blue-700 leading-tight tabular-nums">
                  {formatKRW(displayPrice)}
                </p>
              </>
            ) : tier === "PENDING" ? (
              <p className="text-sm text-amber-600 font-medium">승인 대기 중</p>
            ) : (
              <Link href="/auth/login" className="text-sm text-blue-600 hover:underline font-medium">
                로그인 후 가격 확인 →
              </Link>
            )}
          </div>

          {/* 견적 담기 버튼 */}
          {session && tier !== "PENDING" ? (
            <div className="flex-shrink-0">
              <AddToQuoteButton
                product={{ id: product.id, partNo: product.partNo, description: product.description }}
                compact
              />
            </div>
          ) : !session ? (
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

function PriceBlock({ displayPrice, tier }: { displayPrice: number | null; tier: string }) {
  if (displayPrice) {
    return (
      <div className="bg-blue-50 rounded-xl p-6">
        <p className="text-3xl font-bold text-blue-700">{formatKRW(displayPrice)}</p>
        <p className="text-xs text-gray-500 mt-1">부가세 별도 | {tierText(tier)} 기준</p>
      </div>
    );
  }
  if (tier === "PENDING") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <p className="text-amber-700 font-medium">관리자 등급 승인 대기 중입니다.</p>
        <p className="text-sm text-amber-600 mt-1">승인 후 등급별 가격을 확인하실 수 있습니다.</p>
      </div>
    );
  }
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <p className="text-gray-700 font-medium">가격 확인은 로그인 후 이용 가능합니다.</p>
      <Link href="/auth/login" className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-500 transition-colors">
        로그인
      </Link>
    </div>
  );
}

function tierText(tier: string) {
  const map: Record<string, string> = { CONSUMER: "최종소비자", OEM: "OEM", DEALER: "딜러", ADMIN: "원가" };
  return map[tier] ?? tier;
}
