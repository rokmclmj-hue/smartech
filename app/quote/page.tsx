"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CartItem = { productId: number; partNo: string; description: string; quantity: number };

export default function QuotePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
    setCart(stored);
  }, []);

  if (status === "unauthenticated") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-600 mb-4">견적 카트를 이용하려면 로그인이 필요합니다.</p>
        <Link href="/auth/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors">로그인</Link>
      </div>
    );
  }

  function updateQty(productId: number, qty: number) {
    const updated = cart.map((i) => i.productId === productId ? { ...i, quantity: qty } : i).filter((i) => i.quantity > 0);
    setCart(updated);
    localStorage.setItem("quoteCart", JSON.stringify(updated));
  }

  function remove(productId: number) {
    const updated = cart.filter((i) => i.productId !== productId);
    setCart(updated);
    localStorage.setItem("quoteCart", JSON.stringify(updated));
  }

  async function submitQuote() {
    setSubmitting(true);
    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })), note }),
    });
    setSubmitting(false);
    if (res.ok) {
      const data = await res.json();
      setDone(data.quoteId);
      localStorage.removeItem("quoteCart");
      setCart([]);
    }
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">견적이 접수되었습니다</h2>
        <p className="text-gray-500 mb-2">견적번호: #{done}</p>
        <p className="text-gray-500 mb-8">담당자가 검토 후 연락드리겠습니다.</p>
        <Link href="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors">제품 계속 보기</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">견적 카트</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <p className="text-gray-500 mb-4">견적 카트가 비어 있습니다.</p>
          <Link href="/products" className="text-blue-600 hover:underline text-sm">제품 보러 가기 →</Link>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl divide-y">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="text-xs text-blue-600 font-mono">{item.partNo}</p>
                  <p className="text-sm font-medium text-gray-800">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQty(item.productId, parseInt(e.target.value) || 1)}
                    className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center"
                  />
                  <button onClick={() => remove(item.productId)} className="text-red-400 hover:text-red-600 text-xs">삭제</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">요청 사항 (선택)</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="납기, 수량 협의 등 특이사항을 적어주세요..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={submitQuote}
            disabled={submitting}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {submitting ? "접수 중..." : "견적 요청하기"}
          </button>
        </>
      )}
    </div>
  );
}
