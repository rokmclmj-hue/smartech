import Link from "next/link";

type Item = {
  code: string;
  title: string;
  image: string;
  href: string;
};

const ITEMS: Item[] = [
  { code: "RV · E2M · nES",    title: "오일 로터리 베인",       image: "/images/products/rv.jpeg",              href: "/products?category=오일펌프(소형 RV)" },
  { code: "nXDS · XDS",        title: "드라이 스크롤",           image: "/images/products/xds.jpeg",             href: "/products?category=스크롤펌프(소형 nXDS)" },
  { code: "EH 시리즈",         title: "루츠 부스터",             image: "/images/products/eh.jpeg",              href: "/products?category=부스터펌프(EH)" },
  { code: "GXS",               title: "산업용 드라이 스크류",    image: "/images/products/gxs.jpeg",             href: "/products?category=산업용드라이펌프(GXS)" },
  { code: "EXS",               title: "부식성 드라이 스크류",    image: "/images/products/exs.jpeg",             href: "/products?category=산업용드라이펌프(EXS)" },
  { code: "iXH · nXRi · iXL",  title: "반도체 드라이",           image: "/images/products/ixh-ixl.jpeg",         href: "/products?category=반도체드라이펌프(iXH)" },
  { code: "nEXT",              title: "터보분자 · nEXT",         image: "/images/products/next.png",             href: "/products?category=터보펌프(nEXT)" },
  { code: "STP Maglev",        title: "터보분자 · Maglev",       image: "/images/products/next-m.jpeg",          href: "/products?category=터보펌프(STP)" },
  { code: "APG · AIM · WRG",   title: "진공 게이지",             image: "/images/products/gauges-indirect.png",  href: "/products?category=저진공게이지(APG200)" },
  { code: "ELD500",            title: "헬륨 리크 디텍터",        image: "/images/products/eld500.jpeg",          href: "/products?category=헬륨리크디텍터(ELD500)" },
  { code: "EMF · Ultra19",     title: "소모품 & 액세서리",       image: "/images/products/hardware.png",         href: "/products?category=미스트필터(EMF)" },
];

export default function ProductShowcase() {
  return (
    <div className="mrqw relative group/marq" aria-label="Edwards 제품 라인업 자동 스크롤">
      {/* left / right edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-paper to-transparent" />

      <div className="showcase-marquee inline-flex gap-3 whitespace-nowrap will-change-transform py-1">
        {[...ITEMS, ...ITEMS].map((p, i) => (
          <Link
            key={`${p.code}-${i}`}
            href={p.href}
            className="showcase-photo group relative shrink-0 block w-[200px] md:w-[220px] h-[170px] md:h-[185px] bg-white/75 backdrop-blur-sm border hair overflow-hidden hover:border-edred transition-colors"
          >
            <img
              src={p.image}
              alt={p.title}
              className="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-[600ms] ease-out group-hover:scale-110"
              loading="lazy"
            />

            {/* always-visible corner brand mark (subtle) */}
            <div className="absolute top-2 left-2.5 text-[8.5px] mono dim tracking-[0.12em] opacity-45">
              EDWARDS
            </div>

            {/* hover overlay — slides up from bottom */}
            <div className="absolute inset-x-0 bottom-0 px-3 pt-6 pb-2.5 bg-gradient-to-t from-ink via-ink/85 to-ink/0 text-paper translate-y-full group-hover:translate-y-0 transition-transform duration-[450ms] ease-out">
              <div className="text-[9.5px] mono opacity-80 tracking-[0.14em] uppercase">{p.code}</div>
              <div className="text-[13px] font-medium leading-tight mt-0.5">{p.title}</div>
            </div>

            {/* tiny hover indicator dot (top-right) */}
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-edred opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

    </div>
  );
}
