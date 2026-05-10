"use client";
import { useState } from "react";

type Props = {
  product: { id: number; partNo: string; description: string };
  /** compact=true: 모바일 하단 바용 작은 버튼 (수량 입력 없음) */
  compact?: boolean;
};

export default function AddToQuoteButton({ product, compact = false }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function addToCart() {
    const stored = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
    const existing = stored.find((i: { productId: number }) => i.productId === product.id);
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

    // 같은 탭 Navbar 카트 카운트 갱신용 이벤트
    window.dispatchEvent(new Event("quoteCartUpdated"));

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (compact) {
    // 모바일 하단 바용 — 수량 없이 버튼만
    return (
      <button
        onClick={addToCart}
        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px] whitespace-nowrap ${
          added
            ? "bg-green-600 text-white"
            : "bg-blue-600 hover:bg-blue-500 text-white"
        }`}
      >
        {added ? "✓ 담김" : "견적 담기"}
      </button>
    );
  }

  return (
    <div className="mt-6 flex items-center gap-3">
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
        className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
        aria-label="수량"
      />
      <button
        onClick={addToCart}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors min-h-[44px]"
      >
        {added ? "✓ 견적 카트에 추가됨" : "견적 카트에 추가"}
      </button>
    </div>
  );
}
