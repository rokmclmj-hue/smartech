"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";

type Customer = {
  id: number;
  name: string;
  company: string;
  phone: string | null;
  email: string;
  businessNo: string | null;
  tier: string;
};

type ProductHit = {
  id: number;
  partNo: string;
  description: string;
  category: string | null;
  stock: number;
  imageUrl: string | null;
  costPrice: number;
  unitPrice: number;
};

type LineItem = {
  productId: number;
  partNo: string;
  description: string;
  quantity: number;
  unitPrice: number;
  defaultUnitPrice: number;
};

const TIER_LABEL: Record<string, string> = {
  ENDUSER: "엔드유저",
  OEM: "OEM",
  DEALER: "딜러",
  KEY_DEALER: "키딜러",
  VIP_DEALER: "VIP 딜러",
};

function formatKRW(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(n)) + "원";
}

function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function AdminProxyQuotesPage() {
  const toast = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // 고객 검색
  const [customerQ, setCustomerQ] = useState("");
  const debouncedCustomerQ = useDebounce(customerQ);
  const [customerHits, setCustomerHits] = useState<Customer[]>([]);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const customerBoxRef = useRef<HTMLDivElement>(null);

  // 상품 검색
  const [productQ, setProductQ] = useState("");
  const debouncedProductQ = useDebounce(productQ);
  const [productHits, setProductHits] = useState<ProductHit[]>([]);
  const [productOpen, setProductOpen] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const productBoxRef = useRef<HTMLDivElement>(null);

  // 견적 품목
  const [lines, setLines] = useState<LineItem[]>([]);

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (customerBoxRef.current && !customerBoxRef.current.contains(e.target as Node)) {
        setCustomerOpen(false);
      }
      if (productBoxRef.current && !productBoxRef.current.contains(e.target as Node)) {
        setProductOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // 고객 검색 fetch
  useEffect(() => {
    const q = debouncedCustomerQ.trim();
    if (q.length === 0) {
      setCustomerHits([]);
      return;
    }
    let abort = false;
    setCustomerLoading(true);
    fetch(`/api/admin/customers/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!abort) setCustomerHits(d.items ?? []);
      })
      .catch(() => {
        if (!abort) setCustomerHits([]);
      })
      .finally(() => {
        if (!abort) setCustomerLoading(false);
      });
    return () => {
      abort = true;
    };
  }, [debouncedCustomerQ]);

  // 상품 검색 fetch
  useEffect(() => {
    const q = debouncedProductQ.trim();
    if (q.length === 0 || !customer) {
      setProductHits([]);
      return;
    }
    let abort = false;
    setProductLoading(true);
    fetch(
      `/api/admin/products/search?q=${encodeURIComponent(q)}&tier=${encodeURIComponent(customer.tier)}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (!abort) setProductHits(d.items ?? []);
      })
      .catch(() => {
        if (!abort) setProductHits([]);
      })
      .finally(() => {
        if (!abort) setProductLoading(false);
      });
    return () => {
      abort = true;
    };
  }, [debouncedProductQ, customer]);

  function selectCustomer(c: Customer) {
    setCustomer(c);
    setCustomerQ("");
    setCustomerOpen(false);
    if (lines.length > 0) {
      toast.info("고객이 변경되어 단가는 그대로 유지됩니다. 필요 시 수정하세요.");
    }
  }

  function clearCustomer() {
    setCustomer(null);
    setCustomerQ("");
    setLines([]);
  }

  function addProduct(p: ProductHit) {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          partNo: p.partNo,
          description: p.description,
          quantity: 1,
          unitPrice: p.unitPrice,
          defaultUnitPrice: p.unitPrice,
        },
      ];
    });
    setProductQ("");
    setProductOpen(false);
  }

  function updateQuantity(id: number, qty: number) {
    if (!Number.isFinite(qty) || qty < 1) qty = 1;
    setLines((prev) =>
      prev.map((l) => (l.productId === id ? { ...l, quantity: qty } : l))
    );
  }

  function updateUnitPrice(id: number, price: number) {
    if (!Number.isFinite(price) || price < 0) price = 0;
    setLines((prev) =>
      prev.map((l) => (l.productId === id ? { ...l, unitPrice: price } : l))
    );
  }

  function removeLine(id: number) {
    setLines((prev) => prev.filter((l) => l.productId !== id));
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const vat = Math.round(subtotal * 0.1);
  const total = subtotal + vat;

  async function submitQuote() {
    if (!customer) {
      toast.error("고객을 먼저 선택해주세요.");
      return;
    }
    if (lines.length === 0) {
      toast.error("상품을 1개 이상 추가해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/proxy-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "견적서 발행에 실패했습니다.");
        setSubmitting(false);
        return;
      }
      router.push(`/quote/${data.quoteId}`);
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto">
      {/* 헤더 — 다른 admin 페이지와 동일한 패턴 (NEW 뱃지만 유지) */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="mono text-[11px] dim tracking-[0.15em] uppercase">
            — 06 · PROXY QUOTES
          </div>
          <span className="mono text-[9px] font-bold tracking-[0.15em] bg-edred text-white px-1.5 py-[2px] rounded">
            NEW
          </span>
        </div>
        <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink">
          대행 <span className="italic text-edred">견적서</span>
        </h1>
        <p className="dim text-[13px] mt-3">
          고객을 검색하고 상품을 추가하면 등급별 단가로 자동 계산됩니다.
        </p>
      </div>

      {/* 검색 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 고객 검색 */}
        <div ref={customerBoxRef} className="relative">
          <label className="mono text-[10px] tracking-[0.18em] uppercase dim mb-2 block">
            01 / 고객
          </label>

          {customer ? (
            <div className="border-2 border-edred rounded-md p-4 bg-edred/5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[16px] font-semibold text-ink mb-1 truncate">
                    {customer.company}
                  </div>
                  <div className="text-[13px] text-dim truncate">
                    {customer.name} · {customer.phone ?? "—"}
                  </div>
                  <div className="mt-2 inline-block mono text-[10px] tracking-[0.15em] bg-edred text-white px-2 py-[3px] rounded">
                    {TIER_LABEL[customer.tier] ?? customer.tier}
                  </div>
                </div>
                <button
                  onClick={clearCustomer}
                  className="text-[12px] text-dim hover:text-edred transition-colors shrink-0"
                >
                  변경
                </button>
              </div>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={customerQ}
                onChange={(e) => {
                  setCustomerQ(e.target.value);
                  setCustomerOpen(true);
                }}
                onFocus={() => setCustomerOpen(true)}
                placeholder="상호 · 이름 · 연락처 · 초성 검색 (예: ㅎㄷ)"
                className="w-full border hair rounded-md px-4 py-3 text-[14px] focus:outline-none focus:border-edred"
              />
              {customerOpen && customerQ.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 border hair rounded-md bg-paper shadow-lg z-20 max-h-[320px] overflow-auto">
                  {customerLoading ? (
                    <div className="px-4 py-3 text-[12px] dim">검색 중…</div>
                  ) : customerHits.length === 0 ? (
                    <div className="px-4 py-3 text-[12px] dim">검색 결과 없음</div>
                  ) : (
                    customerHits.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className="w-full text-left px-4 py-3 hover:bg-edred/5 border-b hair last:border-b-0 transition-colors"
                      >
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-[14px] font-medium text-ink truncate">
                            {c.company}
                          </span>
                          <span className="mono text-[9px] tracking-[0.15em] text-edred shrink-0">
                            {TIER_LABEL[c.tier] ?? c.tier}
                          </span>
                        </div>
                        <div className="text-[12px] text-dim truncate">
                          {c.name} · {c.phone ?? "—"}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* 상품 검색 */}
        <div ref={productBoxRef} className="relative">
          <label className="mono text-[10px] tracking-[0.18em] uppercase dim mb-2 block">
            02 / 상품 추가
          </label>
          <input
            type="text"
            value={productQ}
            onChange={(e) => {
              setProductQ(e.target.value);
              setProductOpen(true);
            }}
            onFocus={() => setProductOpen(true)}
            disabled={!customer}
            placeholder={
              customer
                ? "파트번호 · 제품명 · 초성 검색"
                : "고객을 먼저 선택해주세요"
            }
            className="w-full border hair rounded-md px-4 py-3 text-[14px] focus:outline-none focus:border-edred disabled:bg-ink/5 disabled:cursor-not-allowed"
          />
          {productOpen && productQ.trim().length > 0 && customer && (
            <div className="absolute top-full left-0 right-0 mt-1 border hair rounded-md bg-paper shadow-lg z-20 max-h-[320px] overflow-auto">
              {productLoading ? (
                <div className="px-4 py-3 text-[12px] dim">검색 중…</div>
              ) : productHits.length === 0 ? (
                <div className="px-4 py-3 text-[12px] dim">검색 결과 없음</div>
              ) : (
                productHits.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="w-full text-left px-4 py-3 hover:bg-edred/5 border-b hair last:border-b-0 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-medium text-ink truncate">
                          {p.description}
                        </div>
                        <div className="mono text-[11px] dim">
                          {p.partNo} · 재고 {p.stock}
                        </div>
                      </div>
                      <div className="text-[14px] font-semibold text-edred shrink-0">
                        {formatKRW(p.unitPrice)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 견적 품목 */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <label className="mono text-[10px] tracking-[0.18em] uppercase dim">
            03 / 견적 품목 ({lines.length}건)
          </label>
        </div>
        <div className="border hair rounded-md overflow-hidden">
          <div className="grid grid-cols-[120px_1fr_90px_140px_140px_44px] gap-3 px-4 py-3 border-b hair bg-ink/5 mono text-[10px] tracking-[0.15em] uppercase dim">
            <div>파트번호</div>
            <div>제품명</div>
            <div className="text-right">수량</div>
            <div className="text-right">단가</div>
            <div className="text-right">소계</div>
            <div></div>
          </div>
          {lines.length === 0 ? (
            <div className="px-4 py-12 text-center text-[13px] dim">
              {customer
                ? "상품을 검색해 추가해주세요."
                : "고객을 선택하면 상품을 추가할 수 있습니다."}
            </div>
          ) : (
            lines.map((l) => {
              const lineTotal = l.unitPrice * l.quantity;
              const overridden = l.unitPrice !== l.defaultUnitPrice;
              return (
                <div
                  key={l.productId}
                  className="grid grid-cols-[120px_1fr_90px_140px_140px_44px] gap-3 px-4 py-3 border-b hair last:border-b-0 items-center"
                >
                  <div className="mono text-[12px] text-ink truncate">
                    {l.partNo}
                  </div>
                  <div className="text-[13px] text-ink truncate">
                    {l.description}
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={l.quantity}
                    onChange={(e) =>
                      updateQuantity(l.productId, parseInt(e.target.value) || 1)
                    }
                    className="w-full text-right border hair rounded px-2 py-1 text-[13px] focus:outline-none focus:border-edred"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={l.unitPrice}
                      onChange={(e) =>
                        updateUnitPrice(l.productId, parseInt(e.target.value) || 0)
                      }
                      className={`w-full text-right border rounded px-2 py-1 text-[13px] focus:outline-none focus:border-edred ${
                        overridden ? "border-edred" : "hair"
                      }`}
                    />
                    {overridden && (
                      <span className="absolute -top-2 right-1 mono text-[8px] bg-edred text-white px-1 rounded tracking-wider">
                        수정
                      </span>
                    )}
                  </div>
                  <div className="text-right text-[13px] font-medium text-ink">
                    {formatKRW(lineTotal)}
                  </div>
                  <button
                    onClick={() => removeLine(l.productId)}
                    className="text-dim hover:text-edred text-[14px]"
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* 합계 */}
        {lines.length > 0 && (
          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-[360px] border hair rounded-md p-4 bg-ink/[0.02]">
              <div className="text-[13px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="dim">공급가액</span>
                  <span className="text-ink">{formatKRW(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dim">부가세 (10%)</span>
                  <span className="text-ink">{formatKRW(vat)}</span>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t hair text-[16px]">
                  <span className="font-semibold text-ink">합계</span>
                  <span className="font-bold text-edred">{formatKRW(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 발행 버튼 */}
      <div className="mt-10 flex justify-end">
        <button
          type="button"
          onClick={submitQuote}
          disabled={submitting || !customer || lines.length === 0}
          className="bg-edred text-white px-6 py-3 rounded-md text-[14px] font-semibold tracking-tight hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {submitting ? "발행 중…" : "견적서 발행 →"}
        </button>
      </div>
    </div>
  );
}
