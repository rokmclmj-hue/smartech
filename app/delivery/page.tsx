import type { Metadata } from "next";
import Link from "next/link";
import { DELIVERY_CASES } from "@/lib/delivery-cases";
import { modelSlug } from "@/lib/product-specs";

export const metadata: Metadata = {
  title: "납품 사례 — 스마텍 | Edwards 진공펌프 현장 설치",
  description: `Edwards 코리아 공식 대리점 스마텍의 진공펌프 납품·현장 설치 사례 ${DELIVERY_CASES.length}건. 반도체·분석 장비·동결건조·진공 오븐·열처리로 등 실제 현장 사진과 모델, 사용처를 공개합니다.`,
  alternates: { canonical: "https://www.smartechvacuum.com/delivery" },
  openGraph: {
    title: "납품 사례 — 스마텍",
    description: "Edwards 진공펌프 납품·현장 설치 사례. 실제 현장 사진과 모델·사용처 공개.",
    url: "https://www.smartechvacuum.com/delivery",
    type: "website",
    siteName: "스마텍",
    locale: "ko_KR",
    images: [{ url: "https://www.smartechvacuum.com/og-default.png", width: 1200, height: 630, alt: "스마텍 납품 사례" }],
  },
};

const deliveryCasesSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "스마텍 Edwards 진공펌프 납품 사례",
  "description": "스마텍이 공급·설치한 Edwards 진공펌프 현장 사례 목록. 모델·사용처·현장 사진을 공개합니다.",
  "numberOfItems": DELIVERY_CASES.length,
  "itemListElement": DELIVERY_CASES.map((c, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "item": {
      "@type": "CreativeWork",
      "name": `${c.model} 납품 사례 — ${c.site}`,
      "description": c.note,
      "image": `https://www.smartechvacuum.com${c.photo}`,
      ...(c.date ? { "dateCreated": c.date.replace(".", "-") } : {}),
      "about": { "@type": "Product", "name": c.model, "brand": { "@type": "Brand", "name": "Edwards Vacuum" } },
      "author": { "@type": "Organization", "name": "스마텍", "url": "https://www.smartechvacuum.com" },
    },
  })),
});

export default function DeliveryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: deliveryCasesSchema.replace(/</g, "\\u003c") }} />
      <section className="bg-paper pt-14 pb-20">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          {/* 헤더 — 수리 사례 화면과 같은 모양 */}
          <div className="mono text-[11px] text-dim mb-3 tracking-widest">DELIVERY CASES</div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h1 className="display text-[32px] md:text-[40px] leading-tight">납품 사례</h1>
              <p className="mt-2 text-[14px] text-dim leading-relaxed break-keep">
                스마텍이 공급·설치한 Edwards 진공펌프의 실제 현장 사진입니다. 고객 설비는 알아볼 수 없게 흐리게 처리했습니다.
              </p>
            </div>
            <div className="shrink-0 text-[12px] mono text-dim border hair px-4 py-2 self-start md:self-auto">
              {DELIVERY_CASES.length}건 공개 — 순차 업데이트 중
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DELIVERY_CASES.map((c) => (
              <article key={c.photo} className="border hair bg-white flex flex-col overflow-hidden">
                <div className="aspect-[4/3] relative bg-[#111] overflow-hidden">
                  <img src={c.photo} alt={`${c.model} — ${c.site} 납품 현장`} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
                    <h2 className="text-paper text-[13px] font-semibold leading-tight">{c.model}</h2>
                    <div className="text-paper/60 text-[11px] mono">{c.client ? `${c.client} · ` : ""}{c.site}</div>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="mono text-[11px] text-edred tracking-widest">DELIVERY</div>
                      <div className="mono text-[11px] text-dim tracking-widest">{c.date ?? "현장"}</div>
                    </div>
                    <p className="text-[13px] leading-snug break-keep">{c.note}</p>
                  </div>
                  {(c.models.length > 0 || c.blog) && (
                    <div className="mt-auto pt-3 border-t hair flex flex-col gap-1.5 text-[12px]">
                      {c.models.map((m) => (
                        <Link key={m} href={`/products/${modelSlug(m)}`} className="flex items-center justify-between text-edred hover:underline underline-offset-4">
                          <span>Edwards {m} 가격·재고 보기</span>
                          <span aria-hidden>→</span>
                        </Link>
                      ))}
                      {c.blog && (
                        <Link href={c.blog} className="flex items-center justify-between text-dim hover:text-ink">
                          <span>관련 글 읽기</span>
                          <span aria-hidden>→</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t hair flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[12px] text-dim">
            <div className="leading-relaxed break-keep">
              새로 납품할 때마다 현장 사진을 추가합니다.<br className="hidden md:block" />
              수리·오버홀 사례는 <Link href="/repair#repair-cases" className="text-edred hover:underline underline-offset-4">수리 사례</Link>에서 볼 수 있습니다.
            </div>
            <a
              href="tel:031-204-7170"
              className="shrink-0 inline-flex items-center gap-2 border hair px-5 py-2.5 text-ink hover:bg-ink hover:text-paper transition-colors mono text-[11px] tracking-wider"
            >
              ☏ 031-204-7170 구매·설치 문의
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
