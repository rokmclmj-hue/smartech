"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/lib/toast";

// ── 타입 정의 ─────────────────────────────────────────────────

interface QuoteDetailUser {
  id: number;
  email: string;
  name: string;
  company: string;
  phone: string | null;
  businessNo: string | null;
  tier: string;
}

interface QuoteDetailAdmin {
  id: number;
  name: string;
  email: string;
}

interface QuoteDetailProduct {
  id: number;
  partNo: string;
  description: string;
  category: string | null;
  costPrice: number;
  stock: number;
}

interface QuoteDetailItem {
  id: number;
  quoteId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product: QuoteDetailProduct;
}

interface QuoteDetailOrder {
  id: number;
  status: string;
  confirmedAt: string | null;
  deliveryNoteIssuedAt: string | null;
  deliveryNoteCount: number;
}

interface QuoteDetail {
  id: number;
  userId: number;
  status: string;
  note: string | null;
  createdAt: string;
  expiresAt: string | null;
  taxInvoiceRequested: boolean;
  totalAmount: number | null;
  sentAt: string | null;
  sendCount: number;
  createdByAdminId: number | null;
  user: QuoteDetailUser;
  createdByAdmin: QuoteDetailAdmin | null;
  items: QuoteDetailItem[];
  order: QuoteDetailOrder | null;
  // 계산 필드
  subtotal: number;
  vat: number;
  grandTotal: number;
  quoteNo: string;
  isExpired: boolean;
}

// ── 상수 ─────────────────────────────────────────────────────

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

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "대기중",
  CONFIRMED: "확정",
  CANCELLED: "취소",
  DELIVERED: "납품완료",
};

const TIER_COLOR: Record<string, string> = {
  ADMIN: "border-edred text-edred",
  VIP: "border-ink text-ink",
  APPROVED: "border-ink/40 text-ink",
  PENDING: "border-line text-dim",
  REJECTED: "border-line text-dim line-through",
};

// ── 포맷 헬퍼 ────────────────────────────────────────────────

function fmtKRW(n: number): string {
  return "₩" + Math.round(n).toLocaleString("ko-KR");
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    fmtDate(iso) +
    " " +
    d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
  );
}

// ── 컴포넌트 ─────────────────────────────────────────────────

export default function AdminQuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error: toastError, confirm } = useToast();

  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"send" | "duplicate" | null>(null);

  const loadQuote = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/quotes/${id}/detail`)
      .then((r) => {
        if (!r.ok) throw new Error("견적 데이터를 불러오지 못했습니다");
        return r.json() as Promise<QuoteDetail>;
      })
      .then((data) => {
        setQuote(data);
        setFetchError(null);
      })
      .catch((e: Error) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  // ── 발송 ───────────────────────────────────────────────────
  async function handleSend(force = false) {
    if (!quote) return;
    if (!force) {
      const ok = await confirm({
        message: `${quote.user.email} 으로 견적서를 발송하시겠습니까?`,
        confirmLabel: "발송",
      });
      if (!ok) return;
    }

    setActionLoading("send");
    try {
      const url = `/api/admin/quotes/${id}/send${force ? "?force=1" : ""}`;
      const res = await fetch(url, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        sentTo?: string;
        error?: string;
        lastSentAt?: string;
      };

      if (res.status === 409) {
        const lastSent = data.lastSentAt ? fmtDateTime(data.lastSentAt) : "알 수 없음";
        const retry = await confirm({
          message: "이미 24시간 내 발송됨. 재발송하시겠습니까?",
          detail: `마지막 발송: ${lastSent}`,
          confirmLabel: "재발송",
          destructive: true,
        });
        setActionLoading(null);
        if (retry) await handleSend(true);
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "발송 실패");
      success(`✉ ${data.sentTo} 으로 발송됨`);
      loadQuote();
    } catch (e) {
      toastError(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  // ── 복제 ───────────────────────────────────────────────────
  async function handleDuplicate() {
    const ok = await confirm({
      message: "이 견적을 복제하시겠습니까?",
      detail: "DRAFT 상태로 새 견적이 생성됩니다.",
      confirmLabel: "복제",
    });
    if (!ok) return;

    setActionLoading("duplicate");
    try {
      const res = await fetch(`/api/admin/quotes/${id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => ({}))) as {
        quoteId?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "복제 실패");
      success(`새 견적 #${data.quoteId} 가 생성되었습니다`);
      router.push(`/admin/quotes/${data.quoteId}`);
    } catch (e) {
      toastError(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  // ── 렌더링: 로딩 ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-6 py-20 text-center mono text-[11px] dim tracking-[0.15em] uppercase">
        — Loading
      </div>
    );
  }

  // ── 렌더링: 에러 ─────────────────────────────────────────
  if (fetchError || !quote) {
    return (
      <div className="px-6 py-10 max-w-[960px] mx-auto">
        <div className="border border-edred/30 bg-edred/5 text-edred px-5 py-4">
          {fetchError ?? "견적을 불러올 수 없습니다"}
        </div>
      </div>
    );
  }

  const expiresAt = quote.expiresAt ?? null;

  // ── 렌더링: 본문 ─────────────────────────────────────────
  return (
    <div className="px-6 py-10 max-w-[960px] mx-auto space-y-10">

      {/* Top: 뒤로가기 + 헤더 */}
      <div>
        <Link
          href="/admin/quotes"
          className="mono text-[11px] dim tracking-[0.12em] uppercase hover:text-ink transition-colors inline-block mb-6"
        >
          ← 견적 내역
        </Link>
        <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
          — 04 · QUOTE DETAIL
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="display text-[40px] leading-none text-ink">
            견적 <span className="italic text-edred">#{quote.quoteNo}</span>
          </h1>
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <span
              className={`mono text-[10px] tracking-[0.1em] uppercase border px-2.5 py-1 ${
                STATUS_COLOR[quote.status] ?? "border-line text-dim"
              }`}
            >
              {STATUS_LABEL[quote.status] ?? quote.status}
            </span>
            {quote.isExpired && (
              <span className="mono text-[10px] tracking-[0.1em] uppercase border border-edred/50 text-edred px-2.5 py-1">
                만료
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: 메타 (4컬럼 그리드) */}
      <section className="border hair bg-paper">
        <div className="mono text-[10px] dim tracking-[0.15em] uppercase px-5 pt-5 pb-3 border-b hair">
          — 01 · 기본 정보
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y border-line/30">
          <MetaCell label="작성일" value={fmtDate(quote.createdAt)} />
          <MetaCell
            label="유효기간"
            value={expiresAt ? fmtDate(expiresAt) : "—"}
            accent={quote.isExpired}
          />
          <MetaCell
            label="작성자"
            value={quote.createdByAdmin?.name ?? "—"}
            sub={quote.createdByAdmin?.email}
          />
          <MetaCell
            label="발송"
            value={quote.sentAt ? fmtDate(quote.sentAt) : "—"}
            sub={quote.sendCount > 0 ? `총 ${quote.sendCount}회` : undefined}
          />
        </div>
      </section>

      {/* Section 2: 거래처 정보 (2컬럼) */}
      <section className="border hair bg-paper">
        <div className="mono text-[10px] dim tracking-[0.15em] uppercase px-5 pt-5 pb-3 border-b hair">
          — 02 · 거래처 정보
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-x border-line/30">
          {/* 수신 고객사 */}
          <div className="px-5 py-5 space-y-2">
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-3">
              TO · 수신
            </div>
            <div className="text-[18px] font-medium text-ink">
              {quote.user.company} 귀중
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`mono text-[9px] tracking-[0.1em] uppercase border px-1.5 py-0.5 ${
                  TIER_COLOR[quote.user.tier] ?? "border-line text-dim"
                }`}
              >
                {quote.user.tier}
              </span>
            </div>
            <InfoLine label="담당자" value={quote.user.name} />
            <InfoLine label="E-mail" value={quote.user.email} />
            {quote.user.phone && (
              <InfoLine label="Tel" value={quote.user.phone} />
            )}
            {quote.user.businessNo && (
              <InfoLine label="사업자번호" value={quote.user.businessNo} />
            )}
          </div>

          {/* 공급자 (스마텍 하드코딩) */}
          <div className="px-5 py-5 space-y-2">
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-3">
              FROM · 발신
            </div>
            <div className="text-[18px] font-medium text-ink">(주)스마텍</div>
            <div className="text-[12px] dim mt-1">
              Edwards Vacuum Korea Authorized Distributor
            </div>
            <InfoLine label="사업자번호" value="000-00-00000" />
            <InfoLine label="대표자" value="이명재" />
            <InfoLine label="주소" value="경기도 수원시 신원로 55, 907호" />
            <InfoLine label="TEL" value="031-204-7170" />
            <InfoLine label="E-mail" value="info@smartech.co.kr" />
          </div>
        </div>
      </section>

      {/* Section 3: 품목 테이블 */}
      <section className="border hair bg-paper">
        <div className="mono text-[10px] dim tracking-[0.15em] uppercase px-5 pt-5 pb-3 border-b hair">
          — 03 · 품목 명세 ({quote.items.length} LINES)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[640px]">
            <thead>
              <tr className="border-b hair">
                {["No", "파트번호", "제품명", "카테고리", "수량", "단가", "소계"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left mono text-[10px] dim tracking-[0.1em] uppercase font-normal"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b hair last:border-b-0 ${
                    idx % 2 === 1 ? "bg-ink/[0.015]" : ""
                  }`}
                >
                  <td className="px-4 py-3 mono text-[11px] dim">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3 mono text-[12px] text-ink font-medium">
                    {item.product.partNo}
                  </td>
                  <td className="px-4 py-3 text-ink">{item.product.description}</td>
                  <td className="px-4 py-3 mono text-[11px] dim">
                    {item.product.category ?? "—"}
                  </td>
                  <td className="px-4 py-3 mono text-[12px] text-ink tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 mono text-[12px] text-ink tabular-nums">
                    {fmtKRW(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 mono text-[12px] font-medium text-ink tabular-nums">
                    {fmtKRW(item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 합계 */}
        <div className="border-t hair px-5 py-5 flex justify-end">
          <div className="w-64 space-y-2">
            <SummaryRow label="공급가액" value={fmtKRW(quote.subtotal)} />
            <SummaryRow label="부가세 (VAT 10%)" value={fmtKRW(quote.vat)} />
            <div className="border-t hair pt-2">
              <SummaryRow
                label="총액"
                value={fmtKRW(quote.grandTotal)}
                bold
              />
            </div>
          </div>
        </div>

        {/* 비고 */}
        {quote.note && (
          <div className="border-t hair px-5 py-4">
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-1">
              REMARK · 비고
            </div>
            <p className="text-[13px] text-ink">{quote.note}</p>
          </div>
        )}
      </section>

      {/* Section 4: 발송 이력 */}
      {quote.sendCount > 0 && (
        <section className="border hair bg-paper px-5 py-5">
          <div className="mono text-[10px] dim tracking-[0.15em] uppercase mb-4">
            — 04 · 발송 이력
          </div>
          <div className="grid grid-cols-2 gap-6">
            <MetaCell
              label="마지막 발송"
              value={quote.sentAt ? fmtDateTime(quote.sentAt) : "—"}
            />
            <MetaCell label="총 발송 횟수" value={`${quote.sendCount}회`} />
          </div>
        </section>
      )}

      {/* Section 5: 연결된 주문 */}
      {quote.order && (
        <section className="border hair bg-paper px-5 py-5">
          <div className="mono text-[10px] dim tracking-[0.15em] uppercase mb-4">
            — 05 · 연결된 주문
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <div className="text-[15px] text-ink font-medium">
                주문 #{quote.order.id} —{" "}
                <span className="mono text-[13px]">
                  {ORDER_STATUS_LABEL[quote.order.status] ?? quote.order.status}
                </span>
              </div>
              {quote.order.confirmedAt && (
                <div className="mono text-[11px] dim">
                  확정일: {fmtDate(quote.order.confirmedAt)}
                </div>
              )}
            </div>
            <Link
              href={`/admin/orders/${quote.order.id}`}
              className="mono text-[10px] tracking-[0.1em] uppercase border border-ink text-ink px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors"
            >
              주문 상세 보기 →
            </Link>
          </div>
        </section>
      )}

      {/* Section 6: 액션 버튼 */}
      <section className="border hair bg-paper px-5 py-5">
        <div className="mono text-[10px] dim tracking-[0.15em] uppercase mb-4">
          — 06 · 액션
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleSend()}
            disabled={actionLoading !== null}
            className="mono text-[11px] tracking-[0.1em] uppercase border border-ink text-ink px-5 py-2.5 hover:bg-ink hover:text-paper disabled:opacity-40 transition-colors"
          >
            {actionLoading === "send" ? "발송 중..." : "발송"}
          </button>
          <button
            onClick={handleDuplicate}
            disabled={actionLoading !== null}
            className="mono text-[11px] tracking-[0.1em] uppercase border border-line text-dim px-5 py-2.5 hover:border-ink hover:text-ink disabled:opacity-40 transition-colors"
          >
            {actionLoading === "duplicate" ? "복제 중..." : "복제"}
          </button>
          <button
            onClick={() => window.open(`/api/quote/${id}/pdf`)}
            disabled={actionLoading !== null}
            className="mono text-[11px] tracking-[0.1em] uppercase border border-line text-dim px-5 py-2.5 hover:border-edred hover:text-edred disabled:opacity-40 transition-colors"
          >
            PDF 다운로드
          </button>
        </div>
      </section>
    </div>
  );
}

// ── 공통 소형 컴포넌트 ────────────────────────────────────────

function MetaCell({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="px-5 py-4">
      <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-1">
        {label}
      </div>
      <div
        className={`text-[14px] ${accent ? "text-edred" : "text-ink"}`}
      >
        {value}
      </div>
      {sub && <div className="mono text-[10px] dim mt-0.5">{sub}</div>}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[13px] text-ink">
      <span className="mono text-[10px] dim tracking-[0.05em] mr-2">{label}:</span>
      {value}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={`mono text-[11px] ${bold ? "text-ink" : "dim"} tracking-[0.05em]`}>
        {label}
      </span>
      <span className={`mono text-[13px] tabular-nums ${bold ? "text-ink font-medium" : "text-ink"}`}>
        {value}
      </span>
    </div>
  );
}
