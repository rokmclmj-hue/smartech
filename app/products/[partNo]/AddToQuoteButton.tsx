"use client";
import { useState } from "react";

type Props = { product: { id: number; partNo: string; description: string } };

export default function AddToQuoteButton({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function addToCart() {
    const stored = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
    const existing = stored.find((i: any) => i.productId === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      stored.push({ productId: product.id, partNo: product.partNo, description: product.description, quantity: qty });
    }
    localStorage.setItem("quoteCart", JSON.stringify(stored));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-6 flex items-center gap-3">
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
        className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={addToCart}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        {added ? "✓ 견적 카트에 추가됨" : "견적 카트에 추가"}
      </button>
    </div>
  );
}
