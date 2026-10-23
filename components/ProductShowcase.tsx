import Image from "next/image";
import { CATALOG_MAP } from "@/lib/catalogs";
import { modelSlug } from "@/lib/product-specs";

type Item = {
  code: string;
  title: string;
  image: string;
  href: string;
  category: string;
  model?: string; // 누르면 이 모델의 가격·재고 화면으로. 없으면 href(종류별 제품 목록)
  pdf?: boolean; // 판매 품목이 DB에 없는 종류(STP)만 카탈로그 PDF로
};

// 대표 모델(2026-10-23): 많이 찾는 모델·재고 → 실제 납품 기록 → 가장 작은 기본 모델 순으로 고름.
// 예전엔 카탈로그 PDF(새 창)로 열었으나, 가격·재고가 보이는 화면으로 바꿈. PDF는 각 화면의 "카탈로그 PDF" 버튼에 있음.
const ITEMS: Item[] = [
  { code: "RV · E2M · nES",    title: "오일 로터리 베인",       image: "/images/products/rv.jpeg",              href: "/products?category=오일펌프(소형 RV)",           category: "오일펌프(소형 RV)", model: "RV8" },
  { code: "nXDS · XDS",        title: "드라이 스크롤",           image: "/images/products/xds.jpeg",             href: "/products?category=스크롤펌프(소형 nXDS)",       category: "스크롤펌프(소형 nXDS)", model: "nXDS10i" },
  { code: "EH 시리즈",         title: "루츠 부스터",             image: "/images/products/eh.jpeg",              href: "/products?category=부스터펌프(EH)",              category: "부스터펌프(EH)", model: "EH2600" },
  { code: "GXS",               title: "산업용 드라이 스크류",    image: "/images/products/gxs.jpeg",             href: "/products?category=산업용드라이펌프(GXS)",       category: "산업용드라이펌프(GXS)", model: "GXS160" },
  { code: "EXS",               title: "부식성 드라이 스크류",    image: "/images/products/exs.jpeg",             href: "/products?category=산업용드라이펌프(EXS)",       category: "산업용드라이펌프(EXS)", model: "EXS450" },
  { code: "iXH · nXRi · iXL",  title: "반도체 드라이",           image: "/images/products/ixh-ixl.jpeg",         href: "/products?category=반도체드라이펌프(iXH)",       category: "반도체드라이펌프(iXH)", model: "iXH100" },
  { code: "nEXT",              title: "터보분자 · nEXT",         image: "/images/products/next.png",             href: "/products?category=터보펌프(nEXT)",              category: "터보펌프(nEXT)", model: "nEXT85D" },
  { code: "STP Maglev",        title: "터보분자 · Maglev",       image: "/images/products/next-m.jpeg",          href: "/products?category=터보펌프(STP)",               category: "터보펌프(STP)", pdf: true },
  { code: "APG · AIM · WRG",   title: "진공 게이지",             image: "/images/products/gauges-indirect.png",  href: "/products?category=저진공게이지(APG200)",        category: "저진공게이지(APG200)" },
  { code: "ELD500",            title: "헬륨 리크 디텍터",        image: "/images/products/eld500.jpeg",          href: "/products?category=헬륨리크디텍터(ELD500)",     category: "헬륨리크디텍터(ELD500)" },
  { code: "EMF · Ultra19",     title: "소모품 & 액세서리",       image: "/images/products/hardware.png",         href: "/products?category=미스트필터(EMF)",             category: "미스트필터(EMF)" },
];

export default function ProductShowcase() {
  return (
    <div className="mrqw relative group/marq" aria-label="Edwards 제품 라인업 자동 스크롤">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-paper to-transparent" />

      <div className="showcase-marquee inline-flex gap-3 whitespace-nowrap will-change-transform py-1">
        {[...ITEMS, ...ITEMS].map((p, i) => {
          const pdf = p.pdf ? CATALOG_MAP[p.category] : undefined;
          const href = pdf ?? (p.model ? `/products/${modelSlug(p.model)}` : p.href);
          return (
            <a
              key={`${p.code}-${i}`}
              href={href}
              target={pdf ? "_blank" : undefined}
              rel={pdf ? "noopener noreferrer" : undefined}
              className="showcase-photo group relative shrink-0 block w-[200px] md:w-[220px] h-[170px] md:h-[185px] bg-white/75 backdrop-blur-sm border hair overflow-hidden hover:border-edred transition-colors"
            >
              <Image
                src={p.image}
                alt={p.title}
                fill
                sizes="(max-width: 767px) 200px, 220px"
                className="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-[600ms] ease-out group-hover:scale-110"
                loading="lazy"
              />

              <div className="absolute top-2 left-2.5 text-[11px] mono dim tracking-[0.12em] opacity-45">
                EDWARDS
              </div>

              <div className="absolute inset-x-0 bottom-0 px-3 pt-6 pb-2.5 bg-gradient-to-t from-ink via-ink/85 to-ink/0 text-paper translate-y-full group-hover:translate-y-0 transition-transform duration-[450ms] ease-out">
                {/* 두 줄: 제품 종류(보통) + 누르는 곳(진하게·화살표) — 2026-10-23 대표님 요청으로 모델명 줄 삭제·흰 글씨 */}
                <div className="text-[13px] font-medium leading-tight text-paper/80">{p.title}</div>
                <div className="mt-1 text-[12.5px] font-bold text-paper">
                  {pdf ? "카탈로그 PDF →" : p.model ? `${p.model} 가격·재고 보기 →` : "가격·재고 보기 →"}
                </div>
              </div>

              <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-edred opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
