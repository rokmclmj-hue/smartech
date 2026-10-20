"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { leadTimeLabel } from "@/lib/lead-time";

type ProductInfo = { price: number | null; stock: number; category: string | null };

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
  const [infoMap, setInfoMap] = useState<Map<number, ProductInfo>>(new Map());

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
      const map = new Map<number, ProductInfo>(
        (data.products ?? []).map((p: any) => [p.id, { price: p.displayPrice ?? null, stock: p.stock ?? 0, category: p.category ?? null }])
      );
      setInfoMap(map);
    } catch {
      setInfoMap(new Map());
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

  if (!open) return null;

  return (
    <>

      <div data-print-skip className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-paper border-l hair flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b hair shrink-0">
          <div>
            {/* 영어 머리글·코드 글꼴 삭제(2026-10-20, 견적서 미리보기와 같은 방향) */}
            <h2 className="display text-[26px] leading-tight">견적서</h2>
            <div className="text-[15px] text-dim mt-1">{items.length}종 담김</div>
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
                const info = infoMap.get(item.productId);
                const unitPrice = info?.price ?? null;
                const lineSubtotal = unitPrice != null ? unitPrice * item.quantity : null;
                const inStock = (info?.stock ?? 0) > 0;
                return (
                  <div key={item.productId} className="px-6 py-4 hover:bg-edred/[0.03] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[17px] font-semibold leading-snug">{item.description}</div>
                        <div className="text-[14px] text-dim mt-0.5 tabular-nums">
                          {item.partNo}
                          {info && (
                            <span className={inStock ? "text-edred font-semibold" : ""}>
                              {" · "}{inStock ? `재고 ${info.stock}` : leadTimeLabel(info.category, item.description)}
                            </span>
                          )}
                        </div>
                        {lineSubtotal != null && (
                          <div className="text-[14px] text-dim mt-1.5 tabular-nums">
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
                const up = infoMap.get(item.productId)?.price ?? null;
                return up != null ? sum + up * item.quantity : sum;
              }, 0);
              const hasPrices = items.some((item) => infoMap.get(item.productId)?.price != null);
              if (!hasPrices) return null;
              // 미리보기 화면과 같은 계산(부가세 10% 반올림)
              const vat = Math.round(total * 0.1);
              return (
                <div className="py-2 border-b hair mb-1 tabular-nums">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[15px] font-semibold">합계 (부가세 포함)</span>
                    <span className="text-[22px] font-bold">{(total + vat).toLocaleString("ko-KR")}원</span>
                  </div>
                  <div className="flex justify-between text-[14px] text-dim mt-0.5">
                    <span>공급가 {total.toLocaleString("ko-KR")}원</span>
                    <span>부가세 {vat.toLocaleString("ko-KR")}원</span>
                  </div>
                </div>
              );
            })()}
            <button
              onClick={handleSavePdf}
              className="w-full py-4 bg-edred text-paper text-[17px] font-semibold hover:bg-ink transition-colors"
            >
              견적서 PDF 저장 →
            </button>
            <button
              onClick={clearAll}
              className="w-full py-3 border hair text-[14px] text-dim hover:text-ink hover:border-ink transition-colors"
            >
              전체 비우기
            </button>
            <div className="text-[14px] text-ink/80 pt-1">
              ※ 로그인 없이 공개가로 저장됩니다.
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
