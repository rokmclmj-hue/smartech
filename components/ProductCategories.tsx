"use client";
import { useState } from "react";
import Link from "next/link";
import ProductPanel, { type PanelItem } from "./ProductPanel";

const ITEMS = [
  { category: "오일펌프(소형 RV)",        code: "RV 시리즈",           title: "오일 로터리 베인 펌프 (소형)",       image: "/images/products/rv.jpeg" },
  { category: "오일펌프(소형 E2M)",        code: "E2M 소형",            title: "오일 로터리 베인 펌프 (E2M 소형)",   image: "/images/products/e2m-small-new.png" },
  { category: "오일펌프(중대형 E2S)",      code: "E2S 시리즈",          title: "오일 로터리 베인 펌프 (E2S중형)",        image: "/images/products/e2s-65.png" },
  { category: "오일펌프(중대형 E2M)",      code: "E2M 중대형",          title: "오일 로터리 베인 펌프 (E2M 중대형)", image: "/images/products/e2m-large-new.png" },
  { category: "오일펌프(nES)",             code: "nES 시리즈",           title: "오일 로터리 베인 펌프 (nES)",        image: "/images/products/nes.jpeg" },
  { category: "부스터펌프(EH)",            code: "EH 시리즈",            title: "루츠 부스터 펌프",                   image: "/images/products/eh.jpeg" },
  { category: "스크롤펌프(소형 nXDS)",     code: "nXDS 시리즈",          title: "드라이 스크롤 펌프 (소형 nXDS)",    image: "/images/products/xds.jpeg" },
  { category: "스크롤펌프(중형 XDS)",      code: "XDS 시리즈",           title: "드라이 스크롤 펌프 (중형 XDS)",     image: "/images/products/xds35.png" },
  { category: "산업용드라이펌프(GXS)",     code: "GXS 시리즈",           title: "산업용 드라이 펌프",                 image: "/images/products/gxs.jpeg",         label: "산업용스크루펌프(GXS)" },
  { category: "산업용드라이펌프(EXS)",     code: "EXS 시리즈",           title: "산업용 드라이 펌프",                 image: "/images/products/exs.jpeg",         label: "산업용스크루펌프(EXS)" },
  { category: "반도체드라이펌프(iXH)",     code: "iXH 시리즈",           title: "반도체 드라이 펌프 (iXH)",           image: "/images/products/ixh-ixl.jpeg" },
  { category: "반도체드라이펌프(nXRi)",    code: "nXRi 시리즈",          title: "연구소용 드라이 펌프",               image: "/images/products/nxri.jpeg",        label: "멀티루츠드라이펌프(nXRi)" },
  { category: "반도체드라이펌프(iXL)",     code: "iXL 시리즈",           title: "반도체 드라이 펌프 (iXL)",           image: "/images/products/ixl-new.png" },
  { category: "터보펌프(nEXT)",            code: "nEXT 시리즈",          title: "터보분자 펌프 (nEXT)",               image: "/images/products/next.png" },
  { category: "터보펌핑스테이션(T-Station)", code: "nEXT Station",        title: "터보 펌핑 스테이션",                 image: "/images/products/t-station.jpeg" },
  { category: "터보펌프(STP)",             code: "STP Maglev",           title: "터보분자 펌프 (STP Maglev)",         image: "/images/products/stp-new.png" },
  { category: "헬륨리크디텍터(ELD500)",    code: "ELD500",               title: "헬륨 리크 디텍터",                   image: "/images/products/eld500.jpeg" },
  { category: "저진공게이지(APG200)",      code: "APG200",               title: "저진공 피라니 게이지",               image: "/images/products/apg-new.png" },
  { category: "고진공게이지(AIM200)",      code: "AIM200",               title: "고진공 이온화 게이지",               image: "/images/products/aim-new.png" },
  { category: "복합진공게이지(WRG200)",    code: "WRG200",               title: "복합 진공 게이지",                   image: "/images/products/gauges-indirect.png" },
  { category: "디스플레이게이지(P4/P5)",   code: "P4 · P5",              title: "디스플레이 게이지",                  image: "/images/products/gauges-mechanical.png" },
  { category: "컨트롤러(TIC)",             code: "TIC 시리즈",           title: "터보 인터페이스 컨트롤러",           image: "/images/products/tic-new.png" },
  { category: "컨트롤러(ADC)",             code: "ADC 시리즈",           title: "액티브 디지털 컨트롤러",             image: "/images/products/adc-new2.png" },
  { category: "미스트필터(EMF)",           code: "EMF 시리즈",           title: "오일 미스트 필터",                   image: "/images/products/emf-new.png" },
  { category: "진공펌프오일(Ultra19)",     code: "Ultra 19",             title: "진공 펌프 전용 오일",                image: "/images/products/ultra19.png" },
  { category: "피팅/액세서리",             code: "KF · ISO · NW",        title: "피팅 & 액세서리",                    image: "/images/products/hardware.png" },
];

const INITIAL = 16;

export default function ProductCategories() {
  const [expanded, setExpanded] = useState(false);
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);
  const visible = expanded ? ITEMS : ITEMS.slice(0, INITIAL);

  return (
    <>
      <ProductPanel item={panelItem} onClose={() => setPanelItem(null)} />

      <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {visible.map((item, i) => (
          <button
            key={item.category}
            onClick={() => setPanelItem({ category: item.category, code: item.code, title: item.title, image: item.image })}
            className="group border hair bg-white p-5 hover:bg-ink hover:text-paper transition-colors overflow-hidden text-left w-full"
          >
            <div className="flex justify-between text-[10.5px] mono opacity-60">
              <span>{String(i + 1).padStart(2, "0")} / {ITEMS.length}</span>
              <span>{item.code}</span>
            </div>

            <div className="mt-4 mb-4 aspect-[4/3] relative overflow-hidden border hair bg-white">
              <img
                src={item.image}
                alt={item.title}
                className={`absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform ${item.category === "오일펌프(중대형 E2S)" ? "p-6" : ""}`}
                loading="lazy"
              />
            </div>

            <div className="display text-[18px] leading-[1.2] line-clamp-2">{item.title}</div>
            <div className="mono text-[11px] opacity-60 mt-1">{(item as any).label ?? item.category}</div>

            <div className="mt-3 text-[11px] opacity-70 group-hover:opacity-100">제품 보기 →</div>
          </button>
        ))}
      </div>

      {!expanded && (
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-2 border hair px-6 py-3 text-sm hover:bg-ink hover:text-paper transition-colors"
          >
            전체 보기 ({ITEMS.length - INITIAL}개 더)
          </button>
        </div>
      )}

      {expanded && (
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={() => setExpanded(false)}
            className="inline-flex items-center gap-2 border hair px-6 py-3 text-sm hover:bg-ink hover:text-paper transition-colors"
          >
            접기 ↑
          </button>
        </div>
      )}
      </div>
    </>
  );
}
