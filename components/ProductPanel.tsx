"use client";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  partNo: string;
  description: string;
  displayPrice: number | null;
  priceStatus: "login" | "pending" | "visible";
  category: string;
  isImportant: boolean;
};

export type PanelItem = {
  category: string;
  code: string;
  title: string;
  image: string;
};

type Props = {
  item: PanelItem | null;
  onClose: () => void;
  catalogUrl?: string;
};

function formatKRW(v: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(v);
}

export default function ProductPanel({ item, onClose, catalogUrl }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [added, setAdded] = useState<Set<number>>(new Set());

  // ESC 키로 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // 카테고리 바뀌면 제품 목록 새로 가져오기
  useEffect(() => {
    if (!item) {
      setProducts([]);
      return;
    }
    setLoading(true);
    setQuantities({});
    setAdded(new Set());
    const params = new URLSearchParams({ category: item.category, limit: "200" });
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [item?.category]);

  // 패널 열릴 때 배경 스크롤 막기
  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [item]);

  function addToQuote(product: Product, qty: number) {
    const stored: { productId: number; partNo: string; description: string; quantity: number }[] =
      JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
    const existing = stored.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      stored.push({
        productId: product.id,
        partNo: product.partNo,
        description: product.description,
        quantity: qty,
      });
    }
    localStorage.setItem("quoteCart", JSON.stringify(stored));
    window.dispatchEvent(new Event("quoteCartUpdated"));

    setAdded((prev) => new Set([...prev, product.id]));
    setTimeout(() => {
      setAdded((prev) => {
        const s = new Set(prev);
        s.delete(product.id);
        return s;
      });
    }, 2000);
  }

  if (!item) return null;

  return (
    <>
      {/* 패널 */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-paper border-l hair flex flex-col shadow-2xl">

        {/* 헤더 */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b hair shrink-0">
          <div>
            <div className="mono text-[10px] tracking-[0.16em] uppercase text-dim">{item.code}</div>
            <h2 className="display text-[22px] leading-tight mt-1">{item.title}</h2>
            <div className="mono text-[11px] text-dim mt-1">{item.category}</div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 ml-4 w-8 h-8 flex items-center justify-center border hair hover:bg-ink hover:text-paper transition-colors text-[18px] leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 제품 이미지 */}
        <div className="px-6 py-5 border-b hair bg-white shrink-0">
          <div className="aspect-[3/2] relative">
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          {catalogUrl && (
            <a
              href={catalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[11px] mono text-edred hover:underline font-medium tracking-[0.06em]"
            >
              카탈로그 PDF →
            </a>
          )}
        </div>

        {/* 제품 목록 — 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 bg-line/50 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center text-dim text-sm">
              제품 정보를 불러올 수 없습니다.
            </div>
          ) : (
            <div className="divide-y hair">
              {products.map((product) => {
                const qty = quantities[product.id] ?? 1;
                const isAdded = added.has(product.id);
                return (
                  <div
                    key={product.id}
                    className={`px-4 py-3 transition-colors ${
                      isAdded ? "bg-ink/[0.03]" : "hover:bg-edred/[0.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* 제품 정보 */}
                      <div className="flex-1 min-w-0">
                        {product.isImportant && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-edred mr-1.5 mb-0.5 align-middle" />
                        )}
                        <span className="mono text-[11px] text-dim">{product.partNo}</span>
                        <div className="text-[13px] leading-snug mt-0.5">{product.description}</div>
                        <div className="mt-1">
                          {product.priceStatus === "visible" && product.displayPrice ? (
                            <span className="mono text-[12px] font-semibold">
                              {formatKRW(product.displayPrice)}
                            </span>
                          ) : product.priceStatus === "pending" ? (
                            <span className="mono text-[11px] text-dim">승인 대기</span>
                          ) : (
                            <span className="mono text-[11px] text-dim">로그인 후 가격 확인</span>
                          )}
                        </div>
                      </div>

                      {/* 수량 + 담기 */}
                      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                        <input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [product.id]: Math.max(1, parseInt(e.target.value) || 1),
                            }))
                          }
                          className="w-12 border hair px-1 py-1.5 text-[12px] text-center focus:outline-none focus:border-ink bg-transparent"
                          aria-label="수량"
                        />
                        <button
                          onClick={() => addToQuote(product, qty)}
                          className={`px-2.5 py-1.5 text-[11px] mono tracking-wider border transition-colors whitespace-nowrap ${
                            isAdded
                              ? "bg-ink text-paper border-ink"
                              : "border-ink/40 hover:bg-ink hover:text-paper hover:border-ink"
                          }`}
                        >
                          {isAdded ? "✓" : "담기"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-3 border-t hair shrink-0">
          <div className="mono text-[10px] text-dim">
            ※ 로그인 시 우대 가격 적용 · 가격은 VAT 별도
          </div>
        </div>
      </div>
    </>
  );
}
