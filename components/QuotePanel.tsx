"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

type CartItem = {
  productId: number;
  partNo: string;
  description: string;
  quantity: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function QuotePanel({ open, onClose }: Props) {
  const { data: session } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [priceMap, setPriceMap] = useState<Map<number, number | null>>(new Map());

  function loadItems() {
    try {
      const stored = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
      setItems(Array.isArray(stored) ? stored : []);
    } catch {
      setItems([]);
    }
  }

  async function fetchPrices(cartItems: CartItem[]) {
    if (cartItems.length === 0) return;
    const ids = cartItems.map((i) => i.productId).join(",");
    try {
      const data = await fetch(`/api/products?ids=${ids}&limit=200`).then((r) => r.json());
      const map = new Map<number, number | null>(
        (data.products ?? []).map((p: any) => [p.id, p.displayPrice ?? null])
      );
      setPriceMap(map);
    } catch {
      setPriceMap(new Map());
    }
  }

  useEffect(() => {
    if (open) loadItems();
  }, [open]);

  useEffect(() => {
    if (open && items.length > 0) {
      fetchPrices(items);
    }
  }, [open, items.length]);

  useEffect(() => {
    window.addEventListener("quoteCartUpdated", loadItems);
    return () => window.removeEventListener("quoteCartUpdated", loadItems);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function updateQty(productId: number, qty: number) {
    const updated = items.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(1, qty) } : item
    );
    setItems(updated);
    localStorage.setItem("quoteCart", JSON.stringify(updated));
    window.dispatchEvent(new Event("quoteCartUpdated"));
  }

  function removeItem(productId: number) {
    const updated = items.filter((item) => item.productId !== productId);
    setItems(updated);
    localStorage.setItem("quoteCart", JSON.stringify(updated));
    window.dispatchEvent(new Event("quoteCartUpdated"));
  }

  function clearAll() {
    setItems([]);
    localStorage.removeItem("quoteCart");
    window.dispatchEvent(new Event("quoteCartUpdated"));
    onClose();
  }

  // 2026-10-19 로그인 없이도 공개가 기준으로 저장 (가격은 이미 공개, 로그인하면 우대가)
  function handleSavePdf() {
    trackEvent("quote_pdf_save");
    {
      const header = document.querySelector("header") as HTMLElement | null;
      const main = document.querySelector("main") as HTMLElement | null;
      const hidden: HTMLElement[] = [];
      [header, main].forEach((el) => {
        if (el) { el.style.display = "none"; hidden.push(el); }
      });
      document.body.classList.add("printing-quote");
      window.print();
      hidden.forEach((el) => (el.style.display = ""));
      document.body.classList.remove("printing-quote");
    }
  }

  if (!open) return null;

  return (
    <>

      <div data-print-skip className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-paper border-l hair flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b hair shrink-0">
          <div>
            <div className="mono text-[12px] tracking-[0.16em] uppercase text-dim">QUOTE CART</div>
            <h2 className="display text-[26px] leading-tight mt-1">견적서</h2>
            <div className="mono text-[14px] text-dim mt-1">{items.length}종 선택됨</div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 ml-4 w-11 h-11 flex items-center justify-center border hair hover:bg-ink hover:text-paper transition-colors text-[18px] leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 제품 목록 */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-dim text-sm">담긴 제품이 없습니다.</div>
          ) : (
            <div className="divide-y hair">
              {items.map((item) => {
                const unitPrice = priceMap.get(item.productId) ?? null;
                const lineSubtotal = unitPrice != null ? unitPrice * item.quantity : null;
                return (
                  <div key={item.productId} className="px-6 py-4 hover:bg-edred/[0.03] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="mono text-[14px] text-dim">{item.partNo}</div>
                        <div className="text-[17px] leading-snug mt-1">{item.description}</div>
                        {lineSubtotal != null && (
                          <div className="mono text-[14px] text-dim mt-1.5">
                            {unitPrice!.toLocaleString("ko-KR")}원 × {item.quantity} ={" "}
                            <span className="text-ink font-bold text-[16px]">{lineSubtotal.toLocaleString("ko-KR")}원</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQty(item.productId, parseInt(e.target.value) || 1)
                          }
                          className="w-16 min-h-[44px] border hair px-1 py-2 text-[15px] text-center focus:outline-none focus:border-ink bg-transparent"
                          aria-label="수량"
                        />
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="min-h-[44px] min-w-[44px] px-3 py-2 text-[18px] border hair border-ink/20 hover:bg-edred hover:text-paper hover:border-edred transition-colors leading-none"
                          aria-label="삭제"
                        >
                          ×
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
        {items.length > 0 && (
          <div className="pl-6 pr-24 py-4 border-t hair shrink-0 space-y-2">
            {/* 소계 합계 */}
            {(() => {
              const total = items.reduce((sum, item) => {
                const up = priceMap.get(item.productId) ?? null;
                return up != null ? sum + up * item.quantity : sum;
              }, 0);
              const hasPrices = items.some((item) => priceMap.get(item.productId) != null);
              if (!hasPrices) return null;
              return (
                <div className="flex justify-between items-center py-2 border-b hair mb-1">
                  <span className="text-[15px] text-dim">소계 (VAT 별도)</span>
                  <span className="mono text-[19px] font-bold">{total.toLocaleString("ko-KR")}원</span>
                </div>
              );
            })()}
            <button
              onClick={handleSavePdf}
              className="w-full py-4 bg-edred text-paper text-[16px] mono tracking-wider hover:bg-ink transition-colors"
            >
              견적서 저장 (PDF) →
            </button>
            <button
              onClick={clearAll}
              className="w-full py-3 border hair text-[14px] text-dim hover:text-ink hover:border-ink transition-colors"
            >
              전체 비우기
            </button>
            <div className="text-[14px] text-ink/80 pt-1">
              ※ 가격은 VAT 별도 · 로그인 없이 공개가로 저장됩니다.
              {!session && (
                <>
                  {" "}회원은{" "}
                  <Link href="/auth/login" onClick={onClose} className="underline underline-offset-2 text-ink hover:text-edred">
                    로그인
                  </Link>
                  하면 우대 가격이 적용됩니다.
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
