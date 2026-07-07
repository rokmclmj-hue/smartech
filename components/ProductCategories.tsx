"use client";
import { useState } from "react";
import Image from "next/image";
import ProductPanel, { type PanelItem } from "./ProductPanel";
import { CATALOG_MAP } from "@/lib/catalogs";
import { PRODUCT_ITEMS as ITEMS } from "@/lib/product-categories";

const INITIAL = 16;

export default function ProductCategories() {
  const [expanded, setExpanded] = useState(true);
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);
  const visible = expanded ? ITEMS : ITEMS.slice(0, INITIAL);

  return (
    <>
      <ProductPanel
        item={panelItem}
        onClose={() => setPanelItem(null)}
        catalogUrl={panelItem ? (CATALOG_MAP[panelItem.category] ?? undefined) : undefined}
      />

      <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {visible.map((item, i) => (
          <div
            key={item.category}
            className="group border hair bg-white hover:bg-ink hover:text-paper transition-colors overflow-hidden flex flex-col"
          >
            {/* 상단 — 클릭 시 패널 오픈 */}
            <div
              onClick={() => setPanelItem({ category: item.category, code: item.code, title: item.title, image: item.image })}
              className="cursor-pointer p-5 pb-3 flex-1"
            >
              <div className="flex justify-between text-[10.5px] mono opacity-60">
                <span>{String(i + 1).padStart(2, "0")} / {ITEMS.length}</span>
                <span>{item.code}</span>
              </div>

              <div className="mt-4 mb-4 aspect-[4/3] relative overflow-hidden border hair bg-white">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className={`object-contain group-hover:scale-105 transition-transform ${item.category === "오일펌프(중대형 E2S)" ? "p-6" : ""}`}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              <div className="display text-[18px] leading-[1.2] line-clamp-2">{item.title}</div>
              <div className="mono text-[11px] opacity-60 mt-1">{(item as any).label ?? item.category}</div>
            </div>

            {/* 하단 바 */}
            <div className="px-5 pb-5 pt-2">
              <button
                onClick={() => setPanelItem({ category: item.category, code: item.code, title: item.title, image: item.image })}
                className="text-[11px] opacity-70 group-hover:opacity-100 hover:underline"
              >
                제품 보기 →
              </button>
            </div>
          </div>
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
