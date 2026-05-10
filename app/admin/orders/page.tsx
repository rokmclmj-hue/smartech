"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/lib/toast";

type OrderItem = {
  id: number;
  quoteId: number;
  company: string;
  contactName: string | null;
  contactPhone: string | null;
  amount: number;
  taxInvoiceRequested: boolean;
  deliveryIssue: boolean;
  status: string;
  confirmedAt: string | null;
  createdAt: string;
  deliveryNoteIssuedAt: string | null;
  deliveryNoteCount: number;
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "PENDING", label: "대기" },
  { value: "CONFIRMED", label: "확정" },
  { value: "CANCELLED", label: "취소" },
  { value: "DELIVERY_INQUIRY", label: "납기문의" },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기",
  CONFIRMED: "확정",
  CANCELLED: "취소",
  DELIVERY_INQUIRY: "납기문의",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "border-ink/40 text-ink",
  CONFIRMED: "border-edred text-edred",
  CANCELLED: "border-line text-dim line-through",
  DELIVERY_INQUIRY: "border-ink bg-ink text-paper",
};

const PAGE_LIMIT = 50;

export default function AdminOrdersPage() {
  const { success, error: toastError, confirm } = useToast();

  const [items, setItems] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // 디바운스용 타이머
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(
    (currentFilter: string, currentSearch: string, currentPage: number) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentFilter !== "ALL") params.set("status", currentFilter);
      if (currentSearch) params.set("search", currentSearch);
      params.set("page", String(currentPage));
      params.set("limit", String(PAGE_LIMIT));

      fetch(`/api/admin/orders?${params.toString()}`)
        .then((r) => {
          if (!r.ok) throw new Error("주문 데이터를 불러오지 못했습니다");
          return r.json() as Promise<{ items: OrderItem[]; total: number }>;
        })
        .then((data) => {
          setItems(data.items);
          setTotal(data.total);
          setFetchError(null);
        })
        .catch((e: unknown) =>
          setFetchError(e instanceof Error ? e.message : "오류가 발생했습니다")
        )
        .finally(() => setLoading(false));
    },
    []
  );

  // 필터·페이지 변경 시 즉시 fetch
  useEffect(() => {
    fetchOrders(filter, search, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  // 검색어 디바운스 (300ms) — 검색어가 바뀌면 페이지를 1로 리셋
  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchOrders(filter, value, 1);
    }, 300);
  }

  // 필터 변경 시 페이지 리셋
  function handleFilterChange(value: string) {
    setFilter(value);
    setPage(1);
  }

  async function doConfirm(orderId: number) {
    const ok = await confirm({
      message: "이 주문을 확정하시겠습니까?",
      detail: "재고가 자동 차감됩니다.",
    });
    if (!ok) return;

    setActionLoading(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "confirm" }),
      });

      if (res.status === 400) {
        const body = (await res.json()) as {
          error: string;
          partNo?: string;
          requested?: number;
          available?: number;
        };
        if (body.partNo !== undefined) {
          toastError(
            `${body.partNo} 재고 부족 (${body.available}/${body.requested})`
          );
        } else {
          toastError(body.error ?? "처리 실패");
        }
        return;
      }

      if (res.status === 409) {
        const body = (await res.json()) as { error: string; currentStatus?: string };
        toastError(body.error ?? "이미 처리된 주문입니다");
        fetchOrders(filter, search, page);
        return;
      }

      if (!res.ok) {
        toastError("처리 실패");
        return;
      }

      fetchOrders(filter, search, page);
    } catch {
      toastError("오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  async function doCancel(orderId: number) {
    const ok = await confirm({
      message: "이 주문을 취소하시겠습니까?",
      destructive: true,
    });
    if (!ok) return;

    setActionLoading(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "cancel" }),
      });

      if (res.status === 409) {
        const body = (await res.json()) as { error: string; currentStatus?: string };
        toastError(body.error ?? "이미 처리된 주문입니다");
        fetchOrders(filter, search, page);
        return;
      }

      if (!res.ok) {
        toastError("처리 실패");
        return;
      }

      fetchOrders(filter, search, page);
    } catch {
      toastError("오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  async function doTaxInvoiceDone(orderId: number) {
    setActionLoading(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "taxInvoiceDone" }),
      });
      if (!res.ok) {
        toastError("처리 실패");
        return;
      }
      fetchOrders(filter, search, page);
    } catch {
      toastError("오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  function downloadDeliveryPdf(orderId: number) {
    window.open(`/api/admin/orders/${orderId}/delivery-pdf`, "_blank");
    success("거래명세표가 다운로드됩니다");
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <div className="px-6 py-10 max-w-[1400px] mx-auto space-y-8">
      {/* 헤더 */}
      <div>
        <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
          — 02 · ORDERS
        </div>
        <h1 className="display text-[40px] leading-none text-ink">
          주문 <span className="italic text-edred">관리</span>
        </h1>
      </div>

      {/* 검색 + 필터 */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="회사명·담당자·전화·주문번호 검색"
          className="border hair bg-paper text-ink text-[13px] px-4 py-2 w-full max-w-sm placeholder:text-dim focus:outline-none focus:border-ink"
        />
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={`chip ${filter === opt.value ? "active" : ""}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {fetchError && (
        <div className="border border-edred/30 bg-edred/5 px-5 py-4 text-edred text-sm">
          {fetchError}
        </div>
      )}

      {loading && (
        <div className="text-center py-16 mono text-[11px] dim tracking-[0.12em] uppercase">
          — Loading
        </div>
      )}

      {!loading && !fetchError && (
        <>
          <div className="border hair bg-paper overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[1080px]">
                <thead>
                  <tr className="border-b hair">
                    {[
                      "주문번호",
                      "고객사",
                      "담당자",
                      "금액",
                      "세금계산서",
                      "납기문의",
                      "상태",
                      "날짜",
                      "명세표",
                      "액션",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left mono text-[10px] dim tracking-[0.12em] uppercase font-normal"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-16 text-center dim text-[13px]"
                      >
                        주문이 없습니다
                      </td>
                    </tr>
                  ) : (
                    items.map((o) => (
                      <tr
                        key={o.id}
                        className={`border-b hair last:border-b-0 hover:bg-ink/[0.02] transition-colors ${
                          o.deliveryIssue ? "bg-edred/[0.03]" : ""
                        }`}
                      >
                        {/* 주문번호 */}
                        <td className="px-4 py-3 mono text-[12px] tabular text-edred font-medium">
                          <a
                            href={`/admin/orders/${o.id}`}
                            className="hover:underline"
                          >
                            #{o.id}
                          </a>
                        </td>

                        {/* 고객사 */}
                        <td className="px-4 py-3 text-ink">{o.company}</td>

                        {/* 담당자 */}
                        <td className="px-4 py-3">
                          {o.deliveryIssue && o.contactName ? (
                            <div>
                              <div className="text-edred font-semibold">
                                {o.contactName}
                              </div>
                              {o.contactPhone && (
                                <a
                                  href={`tel:${o.contactPhone}`}
                                  className="mono text-[11px] text-edred hover:underline"
                                >
                                  {o.contactPhone}
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="dim">{o.contactName ?? "—"}</span>
                          )}
                        </td>

                        {/* 금액 */}
                        <td className="px-4 py-3 mono text-[12px] tabular text-ink">
                          {o.amount > 0
                            ? `₩${o.amount.toLocaleString("ko-KR")}`
                            : "—"}
                        </td>

                        {/* 세금계산서 */}
                        <td className="px-4 py-3">
                          {o.taxInvoiceRequested ? (
                            <div className="flex items-center gap-2">
                              <span className="mono text-[10px] tracking-[0.08em] uppercase border border-ink px-2 py-0.5 text-ink">
                                신청
                              </span>
                              <button
                                onClick={() => doTaxInvoiceDone(o.id)}
                                disabled={actionLoading === o.id}
                                className="mono text-[10px] dim hover:text-edred underline"
                              >
                                완료
                              </button>
                            </div>
                          ) : (
                            <span className="dim">—</span>
                          )}
                        </td>

                        {/* 납기문의 */}
                        <td className="px-4 py-3">
                          {o.deliveryIssue ? (
                            <span className="mono text-[10px] tracking-[0.08em] uppercase bg-edred text-paper px-2 py-0.5">
                              문의
                            </span>
                          ) : (
                            <span className="dim">—</span>
                          )}
                        </td>

                        {/* 상태 */}
                        <td className="px-4 py-3">
                          <span
                            className={`mono text-[10px] tracking-[0.08em] uppercase border px-2 py-0.5 ${
                              STATUS_COLOR[o.status] ?? "border-line text-dim"
                            }`}
                          >
                            {STATUS_LABEL[o.status] ?? o.status}
                          </span>
                        </td>

                        {/* 날짜 */}
                        <td className="px-4 py-3 mono text-[11px] dim">
                          {new Date(o.createdAt).toLocaleDateString("ko-KR")}
                        </td>

                        {/* 명세표 발급 정보 */}
                        <td className="px-4 py-3">
                          {o.deliveryNoteCount > 0 ? (
                            <div>
                              <span className="mono text-[11px] text-ink">
                                {o.deliveryNoteCount}회
                              </span>
                              {o.deliveryNoteIssuedAt && (
                                <div className="mono text-[10px] dim">
                                  {new Date(
                                    o.deliveryNoteIssuedAt
                                  ).toLocaleDateString("ko-KR")}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="dim">—</span>
                          )}
                        </td>

                        {/* 액션 */}
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {o.status === "PENDING" && (
                              <button
                                onClick={() => doConfirm(o.id)}
                                disabled={actionLoading === o.id}
                                className="mono text-[10px] tracking-[0.1em] uppercase bg-edred text-paper px-2.5 py-1 hover:bg-edred2 disabled:opacity-40 transition-colors"
                              >
                                확정
                              </button>
                            )}
                            {o.status !== "CANCELLED" &&
                              o.status !== "CONFIRMED" && (
                                <button
                                  onClick={() => doCancel(o.id)}
                                  disabled={actionLoading === o.id}
                                  className="mono text-[10px] tracking-[0.1em] uppercase border border-line text-dim px-2.5 py-1 hover:border-ink hover:text-ink disabled:opacity-40 transition-colors"
                                >
                                  취소
                                </button>
                              )}
                            <button
                              onClick={() => downloadDeliveryPdf(o.id)}
                              disabled={o.status !== "CONFIRMED"}
                              title={
                                o.status !== "CONFIRMED"
                                  ? "확정된 주문만 발행 가능"
                                  : "거래명세표 PDF 다운로드"
                              }
                              className="mono text-[10px] tracking-[0.1em] uppercase border border-ink text-ink px-2.5 py-1 hover:bg-ink hover:text-paper disabled:border-line disabled:text-dim disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                            >
                              {o.deliveryNoteCount > 0
                                ? `명세표 (${o.deliveryNoteCount}x)`
                                : "명세표"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between">
            <span className="mono text-[11px] dim">
              총 {total.toLocaleString("ko-KR")}건 · {page}/{totalPages} 페이지
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="mono text-[10px] tracking-[0.1em] uppercase border border-line text-dim px-3 py-1.5 hover:border-ink hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="mono text-[10px] tracking-[0.1em] uppercase border border-line text-dim px-3 py-1.5 hover:border-ink hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
