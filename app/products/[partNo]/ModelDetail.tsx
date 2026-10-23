import Link from "next/link";
import { auth } from "@/lib/auth";
import { getMultiplier, formatKRW } from "@/lib/pricing";
import { getModelSpecRows, getSiblingModels, modelSlug, type ModelLookup } from "@/lib/product-specs";
import { getModelSkus, summarize } from "@/lib/model-offers";
import { getProductPhotoUrl } from "@/lib/product-icons";
import { DELIVERY_CASES } from "@/lib/delivery-cases";
import { REPAIR_CASES } from "@/lib/repair-cases";

// 가격·재고 기준일 — 한국 날짜 "2026.10.23"
function todayKst() {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .replace(/\.\s?/g, ".")
    .replace(/\.$/, "");
}

export default async function ModelDetail({ category, model, index }: ModelLookup) {
  const specRows = getModelSpecRows(category, index);
  const siblings = getSiblingModels(category, index);
  // 이 모델의 납품·수리 사례 — 납품은 models 목록, 수리는 카드 모델명("Edwards RV5")이 정확히 같은 것만
  const deliveryCases = DELIVERY_CASES.filter((c) => c.models.includes(model));
  const repairCases = REPAIR_CASES.filter((c) => c.model === `Edwards ${model}`);

  // 파트번호 화면과 같은 등급 기준 — 비회원·승인 대기·거절은 공개 가격, 등급명은 보여 주지 않음
  const session = await auth();
  const tier = (session?.user as { tier?: string })?.tier ?? "PUBLIC";
  const pricingTier = (tier === "PUBLIC" || tier === "GUEST" || tier === "PENDING" || tier === "REJECTED") ? "PUBLIC" : tier;
  const [multiplier, publicMultiplier] = await Promise.all([getMultiplier(pricingTier), getMultiplier("PUBLIC")]);
  const isLoggedIn = !!session;
  const isPending = tier === "PENDING";
  const priceLabel = isLoggedIn && !isPending ? "귀사 적용가 · 부가세 별도" : "참고가격 · 부가세 별도";

  // 같은 카테고리 안에서 이 모델로 시작하는 실제 판매 파트번호(전압·주파수별) — 가격은 판매가만 들어 있다
  const skus = await getModelSkus(category, model, multiplier, publicMultiplier);
  const summary = summarize(category, skus);
  const inStock = summary.totalStock > 0;
  const priceText = summary.minPrice === null
    ? null
    : summary.minPrice === summary.maxPrice
      ? formatKRW(summary.minPrice)
      : `${formatKRW(summary.minPrice)}부터`;
  const stockText = inStock
    ? `재고 ${summary.totalStock}대 · 바로 출고 가능`
    : summary.leadLabel && summary.leadLabel !== "납기 문의"
      ? `재고 없음 · 주문 후 ${summary.leadLabel}`
      : "재고 없음 · 납기 문의";
  const stockSentence = inStock
    ? `현재 재고 ${summary.totalStock}대로 바로 출고할 수 있습니다`
    : summary.leadLabel && summary.leadLabel !== "납기 문의"
      ? `현재 재고가 없어 주문 후 ${summary.leadLabel} 걸립니다`
      : "납기는 문의해 주시면 안내합니다";
  const asOf = todayKst();

  // 검색·AI용 상품 정보 — 비회원 판매가 범위만. 가격 있는 판매 옵션이 없으면 넣지 않는다(구글: offers 없는 Product는 오류)
  const photoUrl = skus[0]
    ? getProductPhotoUrl(skus[0].partNo, skus[0].description, category)
    : getProductPhotoUrl("", model, category);
  const productSchema = summary.publicMinPrice !== null && summary.publicMaxPrice !== null
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": `Edwards ${model}`,
        "description": `Edwards ${model} (${category}) — 스마텍(Edwards 코리아 공식 대리점) 정품 공급·견적·수리 상담. 판매 옵션 ${summary.pricedCount}종(전압·주파수별).`,
        "image": `https://www.smartechvacuum.com${photoUrl}`,
        "brand": { "@type": "Brand", "name": "Edwards Vacuum" },
        "manufacturer": { "@type": "Organization", "name": "Edwards Vacuum" },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "KRW",
          "lowPrice": summary.publicMinPrice,
          "highPrice": summary.publicMaxPrice,
          "offerCount": summary.pricedCount,
          "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "url": `https://www.smartechvacuum.com/products/${modelSlug(model)}`,
          "seller": { "@type": "Organization", "name": "스마텍", "url": "https://www.smartechvacuum.com", "telephone": "+82-31-204-7170" },
        },
      })
    : null;

  return (
    <>
      {productSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productSchema.replace(/</g, "\\u003c") }} />
      )}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Link href="/products" className="mono text-[12px] text-dim hover:text-edred mb-6 inline-block">
          ← 제품 카탈로그
        </Link>

        {/* 다른 화면과 같은 모양 — 각진 칸·가는 선·빨강/검정 */}
        <div className="mono text-[11px] text-dim tracking-wider">EDWARDS · {category}</div>
        <h1 className="display text-[28px] md:text-[36px] leading-[1.15] mt-3">Edwards {model}</h1>

        {/* 가격·재고 요약 — 검색해서 들어온 손님이 첫 화면에서 바로 보도록 */}
        <section className="mt-6 border hair bg-white p-5 md:p-8">
          {summary.allDiscontinued ? (
            <>
              <p className="text-[18px] font-bold">단종 모델입니다 — 대체 모델을 안내해 드립니다</p>
              <p className="mt-2 text-[14px] text-dim break-keep">아래 같은 라인업 모델을 보시거나 전화로 문의해 주세요.</p>
            </>
          ) : priceText ? (
            <>
              <p className="mono text-[11px] text-dim tracking-wider">{priceLabel}</p>
              <p className="display text-[30px] md:text-[34px] leading-none mt-2 tabular-nums">{priceText}</p>
              <p className="mt-3 flex items-center gap-2 text-[14px] text-ink">
                {inStock && <span className="h-1.5 w-1.5 bg-edred" aria-hidden />}
                <span className={inStock ? "font-semibold" : "text-ink/75"}>{stockText}</span>
              </p>
              {isPending && (
                <p className="text-[13px] text-amber-600 mt-2">확인 중입니다 — 확정가는 담당자에게 문의해 주세요.</p>
              )}
            </>
          ) : (
            <p className="text-[18px] font-bold">가격·재고는 문의해 주세요</p>
          )}
          {/* 검색·AI가 그대로 인용하기 좋은 한 문장 */}
          <p className="mt-4 text-[13px] text-dim break-keep">
            스마텍(Edwards 코리아 공식 대리점)의 Edwards {model}
            {priceText && !summary.allDiscontinued ? ` 판매가는 ${priceText}(부가세 별도)이며, ${stockSentence}.` : " 가격·재고는 전화로 안내합니다."}
            {" "}가격·재고 기준일 {asOf}. 문의 031-204-7170 · info@smartechvacuum.com
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="tel:031-204-7170"
              className="inline-flex items-center gap-2 bg-edred text-paper px-5 py-3 text-[14px] font-semibold hover:bg-edred3 transition-colors"
            >
              031-204-7170 전화하기
            </a>
            {skus.length > 0 && (
              <a
                href="#options"
                className="inline-flex items-center gap-2 border hair bg-white px-5 py-3 text-[14px] hover:bg-ink hover:text-paper transition-colors"
              >
                전압 골라 견적 담기 ↓
              </a>
            )}
            {!isLoggedIn && priceText && (
              <Link
                href="/auth/login"
                className="inline-flex items-center px-2 py-3 text-[14px] text-edred hover:underline underline-offset-4"
              >
                로그인하면 더 좋은 조건으로 →
              </Link>
            )}
          </div>
        </section>

        {skus.length > 0 && (
          <section id="options" className="mt-10 scroll-mt-24">
            <div className="mono text-[11px] text-dim tracking-widest mb-2">PART NUMBERS</div>
            <h2 className="text-[20px] font-bold tracking-tight">판매 옵션 <span className="text-[14px] font-normal text-dim">(전압·주파수·지역별)</span></h2>
            <p className="mt-1 text-[13px] text-dim break-keep">파트번호를 누르면 견적에 담을 수 있습니다. 가격은 부가세 별도입니다.</p>
            <ul className="mt-4 border hair bg-white divide-y divide-line">
              {skus.map((p) => (
                <li key={p.partNo}>
                  <Link
                    href={`/products/${encodeURIComponent(p.partNo)}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-5 px-5 py-3 text-[14px] hover:bg-ink hover:text-paper transition-colors group"
                  >
                    <span className="mono text-[13px] sm:w-36 shrink-0 text-edred group-hover:text-paper">{p.partNo}</span>
                    <span className="flex-1 min-w-0 break-words">{p.description}</span>
                    <span className="sm:text-right shrink-0">
                      <span className="block font-semibold tabular-nums">{p.price !== null ? formatKRW(p.price) : "가격 문의"}</span>
                      <span className="block text-[12px] text-dim group-hover:text-paper/80">{p.stockLabel}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <div className="mono text-[11px] text-dim tracking-widest mb-2">SPECIFICATION</div>
          <h2 className="text-[20px] font-bold tracking-tight">사양 <span className="text-[14px] font-normal text-dim">(Edwards 공식 카탈로그 기준)</span></h2>
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
        </section>

        {(deliveryCases.length > 0 || repairCases.length > 0) && (
          <section className="mt-10">
            <div className="mono text-[11px] text-dim tracking-widest mb-2">CASES</div>
            <h2 className="text-[20px] font-bold tracking-tight">Edwards {model} 납품·수리 사례</h2>
            <p className="mt-1 text-[13px] text-dim break-keep">
              스마텍이 실제로 납품·수리한 {model} 사례입니다 —{" "}
              {[
                deliveryCases.length > 0 ? `납품 ${deliveryCases.length}건` : null,
                repairCases.length > 0 ? `수리 ${repairCases.length}건` : null,
              ].filter(Boolean).join(" · ")}
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ...deliveryCases.map((c) => ({ key: c.photo, href: "/delivery", photo: c.photo, label: "납품", title: c.site, date: c.date })),
                ...repairCases.map((c) => ({ key: c.photo, href: "/repair#repair-cases", photo: c.photo, label: "수리", title: c.symptom, date: c.date })),
              ].slice(0, 6).map((c) => (
                <Link key={c.key} href={c.href} className="border hair bg-white flex sm:flex-col hover:border-ink transition-colors">
                  <div className="w-32 sm:w-full shrink-0 aspect-[4/3] bg-[#111] overflow-hidden">
                    <img src={c.photo} alt={`Edwards ${model} ${c.label} 사례 — ${c.title}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-3 min-w-0">
                    <div className="mono text-[11px] tracking-widest text-edred">{c.label}{c.date ? ` · ${c.date}` : ""}</div>
                    <div className="mt-1 text-[13px] leading-snug break-keep">{c.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {siblings.length > 0 && (
          <section className="mt-10">
            <div className="mono text-[11px] text-dim tracking-widest mb-2">LINEUP</div>
            <h2 className="text-[20px] font-bold tracking-tight">같은 라인업의 다른 모델</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={`/products/${s.slug}`}
                  className="border hair bg-white px-4 py-2 text-[14px] hover:bg-ink hover:text-paper transition-colors"
                >
                  {s.model}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
