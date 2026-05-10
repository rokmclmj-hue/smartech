"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";

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
  sentAt: string | null;
  sendCount: number;
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
  DRAFT: "border-line text-dim",
  SENT: "border-ink text-ink",
  CONFIRMED: "border-edred text-edred",
  CANCELLED: "border-line text-dim line-through",
};

const LIMIT = 50;

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR") + " " + d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminQuotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 초기값 읽기
  const initStatus = searchParams.get("status") ?? "ALL";
  const initSearch = searchParams.get("search") ?? "";
  const initPage = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);

  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState(initStatus);
  const [search, setSearch] = useState(initSearch);
  const [page, setPage] = useState(initPage);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const { success, error: toastError, confirm } = useToast();

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // URL 동기화 헬퍼
  const pushUrl = useCallback(
    (nextFilter: string, nextSearch: string, nextPage: number) => {
      const params = new URLSearchParams();
      if (nextFilter !== "ALL") params.set("status", nextFilter);
      if (nextSearch) params.set("search", nextSearch);
      if (nextPage > 1) params.set("page", String(nextPage));
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [router]
  );

  // 데이터 fetch
  const fetchQuotes = useCallback(
    (f: string, s: string, p: number) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (f !== "ALL") params.set("status", f);
      if (s) params.set("search", s);
      params.set("page", String(p));
      params.set("limit", String(LIMIT));
      fetch(`/api/admin/quotes?${params.toString()}`)
        .then((r) => {
          if (!r.ok) throw new Error("견적 데이터를 불러오지 못했습니다");
          return r.json();
        })
        .then((data: { items: QuoteItem[]; total: number }) => {
          setQuotes(data.items);
          setTotal(data.total);
          setFetchError(null);
        })
        .catch((e: Error) => setFetchError(e.message))
        .finally(() => setLoading(false));
    },
    []
  );

  // filter/page 변경 시 fetch
  useEffect(() => {
    fetchQuotes(filter, search, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  // 검색 디바운스
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const nextPage = 1;
      setPage(nextPage);
      pushUrl(filter, value, nextPage);
      fetchQuotes(filter, value, nextPage);
    }, 300);
  }

  function handleFilterChange(value: string) {
    setFilter(value);
    setPage(1);
    pushUrl(value, search, 1);
    // fetchQuotes는 useEffect가 처리
  }

  function handlePageChange(next: number) {
    setPage(next);
    pushUrl(filter, search, next);
    // fetchQuotes는 useEffect가 처리
  }

  // 발송
  async function sendQuote(quoteId: number, email: string, force = false) {
    if (!force) {
      const ok = await confirm({
        message: `${email} 으로 견적서를 발송하시겠습니까?`,
        confirmLabel: "발송",
      });
      if (!ok) return;
    }

    setActionLoading(quoteId);
    try {
      const url = `/api/admin/quotes/${quoteId}/send${force ? "?force=1" : ""}`;
      const res = await fetch(url, { method: "POST" });
      const data = await res.json().catch(() => ({})) as {
        ok?: boolean;
        sentTo?: string;
        error?: string;
        lastSentAt?: string;
      };

      if (res.status === 409) {
        // 24시간 내 재발송 확인
        const lastSent = data.lastSentAt ? fmtDateTime(data.lastSentAt) : "알 수 없음";
        const retry = await confirm({
          message: "이미 24시간 내 발송됨. 재발송하시겠습니까?",
          detail: `마지막 발송: ${lastSent}`,
          confirmLabel: "재발송",
          destructive: true,
        });
        if (retry) {
          setActionLoading(null);
          await sendQuote(quoteId, email, true);
        }
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "발송 실패");
      success(`✉ ${data.sentTo} 으로 발송됨`);
      fetchQuotes(filter, search, page);
    } catch (e) {
      toastError(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  // 복제
  async function duplicateQuote(quoteId: number) {
    const ok = await confirm({
      message: "이 견적을 복제하시겠습니까?",
      detail: "DRAFT 상태로 새 견적이 생성됩니다.",
      confirmLabel: "복제",
    });
    if (!ok) return;

    setActionLoading(quoteId);
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({})) as { quoteId?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? "복제 실패");
      success(`새 견적 #${data.quoteId} 가 생성되었습니다`);
      fetchQuotes(filter, search, page);
    } catch (e) {
      toastError(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
      {/* 헤더 */}
      <div>
        <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
          — 04 · QUOTES
        </div>
        <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink">
          견적 <span className="italic text-edred">내역</span>
        </h1>
      </div>

      {/* 검색 + 필터 */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="회사명·담당자·이메일·견적번호 검색"
          className="w-full max-w-md border hair bg-paper px-4 py-2 text-[13px] text-ink placeholder:dim outline-none focus:border-ink transition-colors"
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

      {loading ? (
        <div className="text-center py-16 mono text-[11px] dim tracking-[0.12em] uppercase">
          — Loading
        </div>
      ) : (
        <>
          <div className="border hair bg-paper overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[960px]">
                <thead>
                  <tr className="border-b hair">
                    {[
                      "견적번호",
                      "고객사",
                      "담당자",
                      "금액",
                      "품목",
                      "상태",
                      "유효기간",
                      "발송",
                      "날짜",
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
                  {quotes.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-16 text-center dim text-[13px]">
                        견적이 없습니다
                      </td>
                    </tr>
                  ) : (
                    quotes.map((q) => (
                      <tr
                        key={q.id}
                        className={`border-b hair last:border-b-0 hover:bg-ink/[0.02] transition-colors ${
                          q.isExpired ? "opacity-60" : ""
                        }`}
                      >
                        <td className="px-4 py-3 mono text-[12px] tabular text-edred font-medium">
                          <a
                            href={`/admin/quotes/${q.id}`}
                            className="hover:underline"
                          >
                            #{q.id}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-ink">{q.company}</td>
                        <td className="px-4 py-3 dim">{q.contactName}</td>
                        <td className="px-4 py-3 mono text-[12px] tabular text-ink">
                          {q.amount > 0 ? `₩${q.amount.toLocaleString("ko-KR")}` : "—"}
                        </td>
                        <td className="px-4 py-3 mono text-[11px] dim">{q.itemCount}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`mono text-[10px] tracking-[0.08em] uppercase border px-2 py-0.5 ${
                                STATUS_COLOR[q.status] ?? "border-line text-dim"
                              }`}
                            >
                              {STATUS_LABEL[q.status] ?? q.status}
                            </span>
                            {q.isExpired && (
                              <span className="mono text-[9px] tracking-[0.1em] uppercase text-edred">
                                만료
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 mono text-[11px] dim">
                          {q.expiresAt
                            ? new Date(q.expiresAt).toLocaleDateString("ko-KR")
                            : "—"}
                        </td>
                        {/* 발송 컬럼 */}
                        <td className="px-4 py-3 mono text-[11px] dim">
                          {q.sentAt ? (
                            <span title={fmtDateTime(q.sentAt)}>
                              {new Date(q.sentAt).toLocaleDateString("ko-KR")}
                              {q.sendCount > 1 && (
                                <span className="ml-1 text-edred">×{q.sendCount}</span>
                              )}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 mono text-[11px] dim">
                          {new Date(q.createdAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => sendQuote(q.id, q.email)}
                              disabled={actionLoading === q.id}
                              className="mono text-[10px] tracking-[0.1em] uppercase border border-ink px-2.5 py-1 hover:bg-ink hover:text-paper disabled:opacity-40 transition-colors"
                            >
                              {actionLoading === q.id ? "..." : "Send"}
                            </button>
                            <button
                              onClick={() => duplicateQuote(q.id)}
                              disabled={actionLoading === q.id}
                              className="mono text-[10px] tracking-[0.1em] uppercase border border-line text-dim px-2.5 py-1 hover:border-ink hover:text-ink disabled:opacity-40 transition-colors"
                            >
                              Copy
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
          <div className="flex items-center gap-4 justify-end">
            <span className="mono text-[11px] dim">
              {page} / {totalPages} 페이지 ({total}건)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="mono text-[10px] tracking-[0.1em] uppercase border border-line text-dim px-3 py-1.5 hover:border-ink hover:text-ink disabled:opacity-30 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="mono text-[10px] tracking-[0.1em] uppercase border border-line text-dim px-3 py-1.5 hover:border-ink hover:text-ink disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
