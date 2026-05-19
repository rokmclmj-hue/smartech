"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
  const [showLoginGate, setShowLoginGate] = useState(false);

  function loadItems() {
    try {
      const stored = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
      setItems(Array.isArray(stored) ? stored : []);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    if (open) {
      loadItems();
      setShowLoginGate(false);
    }
  }, [open]);

  useEffect(() => {
    window.addEventListener("quoteCartUpdated", loadItems);
    return () => window.removeEventListener("quoteCartUpdated", loadItems);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showLoginGate) setShowLoginGate(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, showLoginGate]);

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

  function handleSavePdf() {
    if (!session) {
      setShowLoginGate(true);
    } else {
      window.location.href = "/quote";
    }
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-paper border-l hair flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b hair shrink-0">
          <div>
            <div className="mono text-[10px] tracking-[0.16em] uppercase text-dim">QUOTE CART</div>
            <h2 className="display text-[22px] leading-tight mt-1">견적서</h2>
            <div className="mono text-[11px] text-dim mt-1">{items.length}종 선택됨</div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 ml-4 w-8 h-8 flex items-center justify-center border hair hover:bg-ink hover:text-paper transition-colors text-[18px] leading-none"
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
              {items.map((item) => (
                <div key={item.productId} className="px-4 py-3 hover:bg-edred/[0.03] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="mono text-[11px] text-dim">{item.partNo}</div>
                      <div className="text-[13px] leading-snug mt-0.5">{item.description}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQty(item.productId, parseInt(e.target.value) || 1)
                        }
                        className="w-12 border hair px-1 py-1.5 text-[12px] text-center focus:outline-none focus:border-ink bg-transparent"
                        aria-label="수량"
                      />
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="px-2.5 py-1.5 text-[14px] border hair border-ink/20 hover:bg-edred hover:text-paper hover:border-edred transition-colors leading-none"
                        aria-label="삭제"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t hair shrink-0 space-y-2">
            <button
              onClick={handleSavePdf}
              className="w-full py-3 bg-ink text-paper text-[13px] mono tracking-wider hover:bg-edred transition-colors"
            >
              견적서 저장 (PDF) →
            </button>
            <button
              onClick={clearAll}
              className="w-full py-2 border hair text-[12px] text-dim hover:text-ink hover:border-ink transition-colors"
            >
              전체 비우기
            </button>
            <div className="mono text-[10px] text-dim pt-1">
              ※ 로그인 시 등급별 확정가 적용 · 가격은 VAT 별도
            </div>
          </div>
        )}

        {/* 로그인 게이트 오버레이 */}
        {showLoginGate && (
          <div className="absolute inset-0 z-10 bg-paper/95 backdrop-blur-sm flex flex-col items-center justify-center p-8">
            <div className="mono text-[10px] tracking-[0.16em] uppercase text-dim mb-4">로그인 필요</div>
            <h3 className="display text-[24px] leading-tight text-center mb-2">
              견적서 저장을<br />위해 로그인하세요
            </h3>
            <p className="text-[12px] text-dim text-center mb-6">
              로그인 후 등급별 확정가가 적용되며<br />PDF로 저장할 수 있습니다.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 bg-ink text-paper text-[13px] mono tracking-wider hover:bg-edred transition-colors mb-3"
            >
              로그인하기 →
            </Link>
            <button
              onClick={() => setShowLoginGate(false)}
              className="text-[12px] text-dim hover:text-ink transition-colors"
            >
              계속 둘러보기
            </button>
          </div>
        )}
      </div>
    </>
  );
}
