"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/lib/toast";

// ── 타입 ──────────────────────────────────────────────────────────────────────

type ProductDetail = {
  id: number;
  partNo: string;
  description: string;
  category: string | null;
  costPrice: number;
  stock: number;
};

type QuoteItem = {
  id: number;
  quoteId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product: ProductDetail;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
} | null;

type QuoteDetail = {
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
  items: QuoteItem[];
  createdByAdmin: AdminUser;
};

type UserDetail = {
  id: number;
  email: string;
  name: string;
  company: string;
  phone: string | null;
  businessNo: string | null;
  tier: string;
};

type OrderDetail = {
  id: number;
  quoteId: number;
  userId: number;
  status: string;
  contactName: string | null;
  contactPhone: string | null;
  deliveryIssue: boolean;
  confirmedAt: string | null;
  createdAt: string;
  deliveryNoteIssuedAt: string | null;
  deliveryNoteCount: number;
  user: UserDetail;
  quote: QuoteDetail;
  subtotal: number;
  vat: number;
  grandTotal: number;
  noteNo: string;
  quoteNo: string;
};

// ── 상수 ──────────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기",
  CONFIRMED: "확정",
  CANCELLED: "취소",
  DELIVERY_INQUIRY: "납기문의",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "border-ink/40 text-ink",
  CONFIRMED: "border-edred text-edred",
  CANCELLED: "border-line text-dim",
  DELIVERY_INQUIRY: "border-ink bg-ink text-paper",
};

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₩${n.toLocaleString("ko-KR")}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ko-KR");
}

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error: toastError, confirm } = useToast();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  function fetchOrder() {
    setLoading(true);
    fetch(`/api/admin/orders/${id}/detail`)
      .then((r) => {
        if (!r.ok) throw new Error("주문을 불러오지 못했습니다");
        return r.json() as Promise<OrderDetail>;
      })
      .then((data) => setOrder(data))
      .catch(() => toastError("주문 정보를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function doConfirm() {
    if (!order) return;
    const ok = await confirm({
      message: "이 주문을 확정하시겠습니까?",
      detail: "재고가 자동 차감됩니다.",
    });
    if (!ok) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action: "confirm" }),
      });

      if (res.status === 400) {
        const body = (await res.json()) as {
          error: string;
          partNo?: string;
          requested?: number;
          available?: number;
        };
        if (body.partNo !== undefined) {
          toastError(`${body.partNo} 재고 부족 (${body.available}/${body.requested})`);
        } else {
          toastError(body.error ?? "처리 실패");
        }
        return;
      }

      if (res.status === 409) {
        const body = (await res.json()) as { error: string };
        toastError(body.error ?? "이미 처리된 주문입니다");
        fetchOrder();
        return;
      }

      if (!res.ok) {
        toastError("처리 실패");
        return;
      }

      success("주문이 확정되었습니다");
      fetchOrder();
    } catch {
      toastError("오류가 발생했습니다");
    } finally {
      setActionLoading(false);
    }
  }

  async function doCancel() {
    if (!order) return;
    const ok = await confirm({
      message: "이 주문을 취소하시겠습니까?",
      destructive: true,
    });
    if (!ok) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action: "cancel" }),
      });

      if (res.status === 409) {
        const body = (await res.json()) as { error: string };
        toastError(body.error ?? "이미 처리된 주문입니다");
        fetchOrder();
        return;
      }

      if (!res.ok) {
        toastError("처리 실패");
        return;
      }

      success("주문이 취소되었습니다");
      fetchOrder();
    } catch {
      toastError("오류가 발생했습니다");
    } finally {
      setActionLoading(false);
    }
  }

  async function doTaxInvoiceDone() {
    if (!order) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action: "taxInvoiceDone" }),
      });
      if (!res.ok) {
        toastError("처리 실패");
        return;
      }
      success("세금계산서 처리 완료");
      fetchOrder();
    } catch {
      toastError("오류가 발생했습니다");
    } finally {
      setActionLoading(false);
    }
  }

  // ── 로딩 ────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="px-6 py-10 max-w-[1200px] mx-auto">
        <div className="mono text-[11px] dim tracking-[0.12em] uppercase py-16 text-center">
          — Loading
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-6 py-10 max-w-[1200px] mx-auto">
        <div className="border border-edred/30 bg-edred/5 px-5 py-4 text-edred text-sm">
          주문을 찾을 수 없습니다
        </div>
      </div>
    );
  }

  const canConfirm = order.status === "PENDING";
  const canCancel = order.status === "PENDING" || order.status === "DELIVERY_INQUIRY";
  const canDeliveryPdf = order.status === "CONFIRMED";

  // ── 렌더 ────────────────────────────────────────────────────────────────────

  return (
    <div className="px-6 py-10 max-w-[1200px] mx-auto space-y-10">

      {/* ── Top: 뒤로가기 + 헤더 ── */}
      <div>
        <button
          onClick={() => router.push("/admin/orders")}
          className="mono text-[11px] dim tracking-[0.12em] uppercase hover:text-ink transition-colors mb-6 inline-flex items-center gap-1"
        >
          ← 주문 관리
        </button>

        <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
          — 02 · ORDER DETAIL
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="display text-[40px] leading-none text-ink">
            주문 <span className="italic text-edred">#{order.id}</span>
          </h1>
          <span
            className={`mono text-[11px] tracking-[0.1em] uppercase border px-3 py-1.5 self-center ${
              STATUS_COLOR[order.status] ?? "border-line text-dim"
            }`}
          >
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
      </div>

      {/* ── Section 1: 메타 (4 컬럼) ── */}
      <section className="border hair bg-paper p-6">
        <div className="mono text-[10px] dim tracking-[0.15em] uppercase mb-4">
          — 주문 정보
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-1">
              주문일
            </div>
            <div className="text-[13px] text-ink">{fmtDate(order.createdAt)}</div>
          </div>
          <div>
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-1">
              확정일
            </div>
            <div className="text-[13px] text-ink">{fmtDate(order.confirmedAt)}</div>
          </div>
          <div>
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-1">
              견적번호
            </div>
            <Link
              href={`/admin/quotes/${order.quoteId}`}
              className="mono text-[12px] text-edred hover:underline"
            >
              {order.quoteNo}
            </Link>
          </div>
          <div>
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-1">
              작성자
            </div>
            <div className="text-[13px] text-ink">
              {order.quote.createdByAdmin?.name ?? "—"}
            </div>
            {order.quote.createdByAdmin?.email && (
              <div className="mono text-[11px] dim">
                {order.quote.createdByAdmin.email}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 2: 거래처 정보 (2 컬럼) ── */}
      <section className="border hair bg-paper p-6">
        <div className="mono text-[10px] dim tracking-[0.15em] uppercase mb-4">
          — 거래처 정보
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 좌: 고객사 */}
          <div>
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-2">
              수요자 (고객사)
            </div>
            <div className="text-[15px] font-semibold text-ink mb-1">
              {order.user.company}
            </div>
            <div className="text-[13px] dim mb-0.5">{order.user.name}</div>
            {order.user.phone && (
              <a
                href={`tel:${order.user.phone}`}
                className="mono text-[12px] text-ink hover:text-edred hover:underline transition-colors"
              >
                {order.user.phone}
              </a>
            )}
            {order.user.businessNo && (
              <div className="mono text-[11px] dim mt-1">
                사업자 {order.user.businessNo}
              </div>
            )}
          </div>
          {/* 우: 공급자 */}
          <div>
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-2">
              공급자
            </div>
            <div className="text-[15px] font-semibold text-ink mb-1">
              스마텍 주식회사
            </div>
            <div className="mono text-[11px] dim">사업자 000-00-00000</div>
          </div>
        </div>
      </section>

      {/* ── Section 3: 납기·세금계산서 정보 ── */}
      <section className="border hair bg-paper p-6">
        <div className="mono text-[10px] dim tracking-[0.15em] uppercase mb-4">
          — 납기 · 세금계산서
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 납기문의 */}
          <div>
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-2">
              납기문의
            </div>
            {order.deliveryIssue ? (
              <div className="space-y-1">
                <span className="mono text-[10px] tracking-[0.08em] uppercase bg-edred text-paper px-2 py-0.5">
                  문의
                </span>
                {order.contactName && (
                  <div className="text-[13px] text-edred font-semibold mt-1">
                    {order.contactName}
                  </div>
                )}
                {order.contactPhone && (
                  <a
                    href={`tel:${order.contactPhone}`}
                    className="mono text-[12px] text-edred hover:underline"
                  >
                    {order.contactPhone}
                  </a>
                )}
              </div>
            ) : (
              <span className="dim text-[13px]">—</span>
            )}
          </div>

          {/* 세금계산서 */}
          <div>
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-2">
              세금계산서
            </div>
            {order.quote.taxInvoiceRequested ? (
              <span className="mono text-[10px] tracking-[0.08em] uppercase border border-ink px-2 py-0.5 text-ink">
                신청
              </span>
            ) : (
              <span className="dim text-[13px]">—</span>
            )}
          </div>

          {/* 거래명세표 */}
          <div>
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-2">
              거래명세표
            </div>
            {order.deliveryNoteCount > 0 ? (
              <div className="space-y-0.5">
                <div className="mono text-[12px] text-ink">
                  {order.deliveryNoteCount}회 발급
                </div>
                {order.deliveryNoteIssuedAt && (
                  <div className="mono text-[11px] dim">
                    최근: {fmtDate(order.deliveryNoteIssuedAt)}
                  </div>
                )}
                <div className="mono text-[11px] dim">{order.noteNo}</div>
              </div>
            ) : (
              <span className="dim text-[13px]">미발급</span>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 4: 품목 테이블 ── */}
      <section className="border hair bg-paper overflow-hidden">
        <div className="mono text-[10px] dim tracking-[0.15em] uppercase px-6 py-4 border-b hair">
          — 품목
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[780px]">
            <thead>
              <tr className="border-b hair">
                {["No", "파트번호", "제품명", "카테고리", "수량", "단가", "공급가액", "세액"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left mono text-[10px] dim tracking-[0.12em] uppercase font-normal"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {order.quote.items.map((item, idx) => {
                const lineTotal = item.unitPrice * item.quantity;
                const lineVat = Math.round(lineTotal * 0.1);
                return (
                  <tr key={item.id} className="border-b hair last:border-b-0 hover:bg-ink/[0.02]">
                    <td className="px-4 py-3 mono text-[11px] dim">{idx + 1}</td>
                    <td className="px-4 py-3 mono text-[12px] text-edred font-medium">
                      {item.product.partNo}
                    </td>
                    <td className="px-4 py-3 text-ink">{item.product.description}</td>
                    <td className="px-4 py-3 dim text-[12px]">
                      {item.product.category ?? "—"}
                    </td>
                    <td className="px-4 py-3 mono text-[12px] tabular text-ink">
                      {item.quantity.toLocaleString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 mono text-[12px] tabular text-ink">
                      {fmt(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 mono text-[12px] tabular text-ink">
                      {fmt(lineTotal)}
                    </td>
                    <td className="px-4 py-3 mono text-[12px] tabular dim">
                      {fmt(lineVat)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 합계 */}
        <div className="border-t hair px-6 py-4">
          <div className="flex justify-end">
            <div className="space-y-1.5 min-w-[260px]">
              <div className="flex justify-between text-[13px]">
                <span className="dim">공급가액</span>
                <span className="mono tabular text-ink">{fmt(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="dim">세액 (10%)</span>
                <span className="mono tabular text-ink">{fmt(order.vat)}</span>
              </div>
              <div className="flex justify-between text-[14px] border-t hair pt-2 mt-2">
                <span className="font-semibold text-ink">총액</span>
                <span className="mono tabular text-edred font-semibold">
                  {fmt(order.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: 액션 버튼 ── */}
      <section className="border hair bg-paper p-6">
        <div className="mono text-[10px] dim tracking-[0.15em] uppercase mb-4">
          — 액션
        </div>
        <div className="flex gap-3 flex-wrap">
          {canConfirm && (
            <button
              onClick={doConfirm}
              disabled={actionLoading}
              className="mono text-[11px] tracking-[0.1em] uppercase bg-edred text-paper px-5 py-2.5 hover:bg-edred2 disabled:opacity-40 transition-colors"
            >
              확정
            </button>
          )}

          {canCancel && (
            <button
              onClick={doCancel}
              disabled={actionLoading}
              className="mono text-[11px] tracking-[0.1em] uppercase border border-line text-dim px-5 py-2.5 hover:border-ink hover:text-ink disabled:opacity-40 transition-colors"
            >
              취소
            </button>
          )}

          {canDeliveryPdf && (
            <>
              <button
                onClick={() => {
                  window.open(`/api/admin/orders/${order.id}/delivery-pdf`, "_blank");
                  success("거래명세표가 다운로드됩니다");
                }}
                disabled={actionLoading}
                className="mono text-[11px] tracking-[0.1em] uppercase border border-ink text-ink px-5 py-2.5 hover:bg-ink hover:text-paper disabled:opacity-40 transition-colors"
              >
                거래명세표 다운로드
                {order.deliveryNoteCount > 0 && (
                  <span className="ml-1.5 opacity-60">({order.deliveryNoteCount}x)</span>
                )}
              </button>
              <button
                onClick={() =>
                  window.open(
                    `/api/admin/orders/${order.id}/delivery-pdf?preview=1`,
                    "_blank"
                  )
                }
                disabled={actionLoading}
                className="mono text-[11px] tracking-[0.1em] uppercase border border-line text-dim px-5 py-2.5 hover:border-ink hover:text-ink disabled:opacity-40 transition-colors"
              >
                거래명세표 미리보기
              </button>
            </>
          )}

          {order.quote.taxInvoiceRequested && (
            <button
              onClick={doTaxInvoiceDone}
              disabled={actionLoading}
              className="mono text-[11px] tracking-[0.1em] uppercase border border-ink text-ink px-5 py-2.5 hover:bg-ink hover:text-paper disabled:opacity-40 transition-colors"
            >
              세금계산서 처리완료
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
