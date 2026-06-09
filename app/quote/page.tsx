"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type CartItem = {
  productId: number;
  partNo: string;
  description: string;
  quantity: number;
  unitPrice?: number; // 등급별 단가 (서버에서 받아온 값)
};

const TIER_MULTIPLIERS: Record<string, number> = {
  ENDUSER: 1.40,
  OEM: 1.25,
  DEALER: 1.20,
  KEY_DEALER: 1.15,
  VIP_DEALER: 1.10,
  ADMIN: 1.00,
};

export default function QuotePage() {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  const tier = (session?.user as any)?.tier as string | undefined;
  const showPrice = tier && tier !== "PENDING" && tier !== "ADMIN" ? true : tier === "ADMIN";
  const isPending = tier === "PENDING";

  // 장바구니 로드 + 로그인 시 단가 자동 조회 (한 번에)
  useEffect(() => {
    const stored: CartItem[] = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
    setCart(stored);

    // 로그인 확인 후 가격 조회
    if (status !== "authenticated" || !showPrice || stored.length === 0) return;
    const ids = stored.map((i) => i.productId);
    fetch("/api/products/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: ids }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.prices) return;
        setCart((prev) =>
          prev.map((item) =>
            data.prices[item.productId] != null
              ? { ...item, unitPrice: data.prices[item.productId] }
              : item
          )
        );
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, tier]);

  function updateQty(productId: number, qty: number) {
    const updated = cart
      .map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
      .filter((i) => i.quantity > 0);
    setCart(updated);
    localStorage.setItem("quoteCart", JSON.stringify(updated));
    window.dispatchEvent(new Event("quoteCartUpdated"));
  }

  function remove(productId: number) {
    const updated = cart.filter((i) => i.productId !== productId);
    setCart(updated);
    localStorage.setItem("quoteCart", JSON.stringify(updated));
    window.dispatchEvent(new Event("quoteCartUpdated"));
  }

  /** 등급 배수로 단가 계산 (클라이언트 추정치, 실제는 서버에서 계산) */
  function calcUnitPrice(item: CartItem): number | null {
    if (!tier) return null;
    const multiplier = TIER_MULTIPLIERS[tier];
    if (!multiplier) return null;
    // unitPrice가 서버에서 내려온 경우 우선 사용
    if (item.unitPrice != null) return item.unitPrice;
    return null; // costPrice를 클라이언트가 모르므로 null
  }

  const totalAmount = cart.reduce((sum, item) => {
    const up = calcUnitPrice(item);
    return up != null ? sum + up * item.quantity : sum;
  }, 0);

  const hasPriceData = cart.some((item) => item.unitPrice != null);

  async function submitQuote() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/quote/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          note: note || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDone(data.quoteId);
        localStorage.removeItem("quoteCart");
        window.dispatchEvent(new Event("quoteCartUpdated"));
        setCart([]);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "오류가 발생했습니다. 다시 시도해 주세요.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  async function savePdf() {
    if (!hasPriceData) return;
    setSavingPdf(true);
    try {
      const res = await fetch("/api/quote/pdf-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.productId,
            partNo: i.partNo,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice ?? 0,
          })),
          note: note || null,
        }),
      });
      if (!res.ok) { alert("PDF 생성에 실패했습니다."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `견적서_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setSavingPdf(false);
    }
  }

  // 로딩 중
  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  // 비로그인
  if (status === "unauthenticated") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-600 mb-2 font-medium">견적 카트를 이용하려면 로그인이 필요합니다.</p>
        <p className="text-gray-400 text-sm mb-6">로그인 후 우대 가격을 확인하실 수 있습니다.</p>
        <Link
          href="/auth/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors"
        >
          로그인
        </Link>
      </div>
    );
  }

  // 견적 접수 완료
  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">발주 요청이 접수되었습니다</h2>
        <p className="text-gray-500 mb-2">접수번호: #{done}</p>
        <p className="text-gray-500 mb-4">담당자가 확인 후 연락드리겠습니다.</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/mypage"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors"
          >
            진행 상황 확인
          </Link>
          <Link
            href="/#products"
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            제품 계속 보기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">견적 카트</h1>

      {/* PENDING 등급 안내 */}
      {isPending && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          현재 계정은 <strong>관리자 승인 대기 중</strong>입니다. 승인 후 가격이 표시됩니다.
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <p className="text-gray-500 mb-4">견적 카트가 비어 있습니다.</p>
          <Link href="/#products" className="text-blue-600 hover:underline text-sm">
            제품 보러 가기 →
          </Link>
        </div>
      ) : (
        <>
          {/* 품목 목록 — 모바일: 카드형, 데스크탑: 테이블형 */}
          <div className="space-y-3 md:space-y-0 md:bg-white md:border md:border-gray-200 md:rounded-2xl md:overflow-hidden">
            {/* 데스크탑 테이블 헤더 */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-200">
              <div className="col-span-5">품목</div>
              <div className="col-span-2 text-center">단가</div>
              <div className="col-span-2 text-center">수량</div>
              <div className="col-span-2 text-right">소계</div>
              <div className="col-span-1"></div>
            </div>

            {cart.map((item) => {
              const unitPrice = calcUnitPrice(item);
              const subtotal = unitPrice != null ? unitPrice * item.quantity : null;

              return (
                <div key={item.productId}>
                  {/* 모바일 카드 */}
                  <div className="md:hidden bg-white border border-gray-200 rounded-xl p-4">
                    {/* 품목명 */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 font-mono truncate">{item.partNo}</p>
                        <p className="text-sm font-medium text-gray-800 leading-snug mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(item.productId)}
                        className="flex-shrink-0 text-red-400 hover:text-red-600 text-xs min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="삭제"
                      >
                        ✕
                      </button>
                    </div>

                    {/* 수량 + 소계 */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">수량</span>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateQty(item.productId, parseInt(e.target.value) || 1)}
                          className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[44px]"
                          aria-label="수량"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-0.5">소계</p>
                        {isPending ? (
                          <span className="text-amber-500 text-sm">승인 대기</span>
                        ) : !showPrice ? (
                          <span className="text-gray-400 text-sm">-</span>
                        ) : subtotal != null ? (
                          <span className="text-sm font-semibold text-gray-800 tabular-nums">
                            {subtotal.toLocaleString("ko-KR")}원
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </div>

                    {/* 단가 */}
                    {showPrice && !isPending && (
                      <p className="text-xs text-gray-400 mt-2">
                        단가:{" "}
                        {unitPrice != null
                          ? `${unitPrice.toLocaleString("ko-KR")}원`
                          : "확인 중"}
                      </p>
                    )}
                  </div>

                  {/* 데스크탑 테이블 행 */}
                  <div className="hidden md:grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-gray-100 last:border-0">
                    <div className="col-span-5">
                      <p className="text-xs text-blue-600 font-mono">{item.partNo}</p>
                      <p className="text-sm font-medium text-gray-800 leading-tight">{item.description}</p>
                    </div>
                    <div className="col-span-2 text-center text-sm">
                      {isPending ? (
                        <span className="text-amber-500 text-xs">승인 대기</span>
                      ) : !showPrice ? (
                        <span className="text-gray-400 text-xs">로그인 후 확인</span>
                      ) : unitPrice != null ? (
                        <span className="text-gray-700">{unitPrice.toLocaleString("ko-KR")}원</span>
                      ) : (
                        <span className="text-gray-400 text-xs">확인 중</span>
                      )}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateQty(item.productId, parseInt(e.target.value) || 1)}
                        className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label="수량"
                      />
                    </div>
                    <div className="col-span-2 text-right text-sm font-medium text-gray-800">
                      {isPending ? (
                        <span className="text-amber-500 text-xs">-</span>
                      ) : !showPrice ? (
                        <span className="text-gray-400 text-xs">-</span>
                      ) : subtotal != null ? (
                        <span>{subtotal.toLocaleString("ko-KR")}원</span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => remove(item.productId)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 합계 */}
          {showPrice && !isPending && hasPriceData && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">총 금액 (VAT 별도)</span>
              <span className="text-xl font-bold text-blue-700">
                {totalAmount.toLocaleString("ko-KR")}원
              </span>
            </div>
          )}

          {/* 요청 사항 */}
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

          {/* 버튼 2개 */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={savePdf}
              disabled={savingPdf || !hasPriceData || cart.length === 0}
              className="flex-1 bg-white border border-gray-300 hover:border-gray-400 disabled:opacity-50 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
            >
              {savingPdf ? "생성 중..." : "PDF 저장"}
            </button>
            <button
              onClick={submitQuote}
              disabled={submitting || cart.length === 0}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {submitting ? "접수 중..." : "발주 요청하기"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
