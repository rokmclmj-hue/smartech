"use client";

import { useEffect, useState, useCallback } from "react";

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
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  DELIVERY_INQUIRY: "bg-blue-100 text-blue-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const url = filter === "ALL" ? "/api/admin/orders" : `/api/admin/orders?status=${filter}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("주문 데이터를 불러오지 못했습니다");
        return r.json();
      })
      .then((data) => {
        setOrders(data);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function doAction(orderId: number, action: string) {
    setActionLoading(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });
      if (!res.ok) throw new Error("처리 실패");
      fetchOrders();
    } catch (e) {
      alert(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">주문 관리</h1>

      {/* 필터 탭 */}
      <div className="flex gap-2 border-b border-gray-200">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
              filter === opt.value
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 에러 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
      )}

      {/* 테이블 */}
      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "주문번호",
                    "고객사",
                    "담당자",
                    "금액",
                    "세금계산서",
                    "납기문의",
                    "상태",
                    "날짜",
                    "액션",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                      주문이 없습니다
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr
                      key={o.id}
                      className={`hover:bg-gray-50 ${o.deliveryIssue ? "bg-blue-50" : ""}`}
                    >
                      <td className="px-4 py-3 font-mono text-blue-700 font-medium">#{o.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{o.company}</td>
                      <td className="px-4 py-3">
                        {o.deliveryIssue && o.contactName ? (
                          <div>
                            <div className="font-semibold text-blue-700">{o.contactName}</div>
                            {o.contactPhone && (
                              <a
                                href={`tel:${o.contactPhone}`}
                                className="text-xs text-blue-500 hover:underline"
                              >
                                {o.contactPhone}
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-600">{o.contactName ?? "-"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {o.amount > 0 ? `₩${o.amount.toLocaleString("ko-KR")}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {o.taxInvoiceRequested ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                              신청됨
                            </span>
                            <button
                              onClick={() => doAction(o.id, "taxInvoiceDone")}
                              disabled={actionLoading === o.id}
                              className="text-xs text-gray-500 hover:text-green-600 underline"
                            >
                              처리완료
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {o.deliveryIssue ? (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            납기문의
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            STATUS_COLOR[o.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS_LABEL[o.status] ?? o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(o.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {o.status === "PENDING" && (
                            <button
                              onClick={() => doAction(o.id, "confirm")}
                              disabled={actionLoading === o.id}
                              className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors"
                            >
                              확정
                            </button>
                          )}
                          {o.status !== "CANCELLED" && o.status !== "CONFIRMED" && (
                            <button
                              onClick={() => {
                                if (confirm("이 주문을 취소하시겠습니까?")) doAction(o.id, "cancel");
                              }}
                              disabled={actionLoading === o.id}
                              className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                            >
                              취소
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
