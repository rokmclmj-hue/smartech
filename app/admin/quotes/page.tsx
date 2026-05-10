"use client";

import { useEffect, useState, useCallback } from "react";

type QuoteItem = {
  id: number;
  company: string;
  contactName: string;
  email: string;
  amount: number;
  status: string;
  expiresAt: string | null;
  isExpired: boolean;
  createdAt: string;
  itemCount: number;
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "DRAFT", label: "임시저장" },
  { value: "SENT", label: "발송됨" },
  { value: "CONFIRMED", label: "확정" },
  { value: "CANCELLED", label: "취소" },
];

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "임시저장",
  SENT: "발송됨",
  CONFIRMED: "확정",
  CANCELLED: "취소",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchQuotes = useCallback(() => {
    setLoading(true);
    const url = filter === "ALL" ? "/api/admin/quotes" : `/api/admin/quotes?status=${filter}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("견적 데이터를 불러오지 못했습니다");
        return r.json();
      })
      .then((data) => {
        setQuotes(data);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  async function resendQuote(quoteId: number) {
    setActionLoading(quoteId);
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId, action: "resend" }),
      });
      if (!res.ok) throw new Error("재발송 실패");
      alert("견적서를 재발송했습니다");
      fetchQuotes();
    } catch (e) {
      alert(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">견적 내역</h1>

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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["견적번호", "고객사", "담당자", "금액", "품목수", "상태", "유효기간", "날짜", "액션"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                      견적이 없습니다
                    </td>
                  </tr>
                ) : (
                  quotes.map((q) => (
                    <tr
                      key={q.id}
                      className={`hover:bg-gray-50 ${q.isExpired ? "bg-gray-50 opacity-75" : ""}`}
                    >
                      <td className="px-4 py-3 font-mono text-blue-700 font-medium">#{q.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{q.company}</td>
                      <td className="px-4 py-3 text-gray-600">{q.contactName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {q.amount > 0 ? `₩${q.amount.toLocaleString("ko-KR")}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{q.itemCount}개</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${
                              STATUS_COLOR[q.status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {STATUS_LABEL[q.status] ?? q.status}
                          </span>
                          {q.isExpired && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium w-fit">
                              만료됨
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {q.expiresAt
                          ? new Date(q.expiresAt).toLocaleDateString("ko-KR")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(q.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => resendQuote(q.id)}
                          disabled={actionLoading === q.id}
                          className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === q.id ? "발송 중..." : "재발송"}
                        </button>
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
