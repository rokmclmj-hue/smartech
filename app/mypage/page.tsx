"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── 수리 타입 ──────────────────────────────────────────
type RepairFile = { fileType: string; fileName: string; fileUrl: string };
type StatusLog = { toStatus: string; createdAt: string };
type Repair = {
  id: number;
  repairNo: string;
  pumpMaker: string;
  pumpModel: string;
  pumpSerial: string | null;
  repairTier: number | null;
  aiConfidence: string | null;
  status: string;
  baseAmount: number;
  totalAmount: number;
  symptoms: string[];
  symptomNote: string | null;
  contactName: string;
  createdAt: string;
  files: RepairFile[];
  statusLogs: StatusLog[];
};

// ── 견적 타입 ──────────────────────────────────────────
type QuoteItem = {
  quantity: number;
  unitPrice: number;
  customPartNo: string | null;
  customDescription: string | null;
  product: { partNo: string; description: string } | null;
};
type Quote = {
  id: number;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  taxInvoiceRequested: boolean;
  totalAmount: number | null;
  note: string | null;
  items: QuoteItem[];
};

// ── 발주 타입 ──────────────────────────────────────────
type Order = {
  id: number;
  status: string;
  deliveryIssue: boolean;
  confirmedAt: string | null;
  createdAt: string;
  deliveryNoteIssuedAt: string | null;
  quote: {
    id: number;
    createdAt: string;
    taxInvoiceRequested: boolean;
    totalAmount: number | null;
    items: QuoteItem[];
  };
};

const ORDER_STATUS_STEPS = [
  { key: "PENDING",   label: "접수중" },
  { key: "CONFIRMED", label: "주문확정" },
  { key: "DELIVERED", label: "납품완료" },
];
const ORDER_STATUS_BADGE: Record<string, string> = {
  PENDING:   "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};
const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING:   "접수중",
  CONFIRMED: "주문확정",
  DELIVERED: "납품완료",
  CANCELLED: "취소",
};

// ── 수리 상태 ──────────────────────────────────────────
const STATUS_STEPS = [
  { key: "RECEIVED",    label: "접수완료" },
  { key: "IN_PROGRESS", label: "수리진행" },
  { key: "INSPECTION",  label: "검사중" },
  { key: "COMPLETED",   label: "수리완료" },
  { key: "DELIVERED",   label: "납품완료" },
];
const STATUS_BADGE: Record<string, string> = {
  RECEIVED:    "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700",
  INSPECTION:  "bg-purple-50 text-purple-700",
  COMPLETED:   "bg-green-50 text-green-700",
  DELIVERED:   "bg-ink/10 text-dim",
  CANCELLED:   "bg-red-50 text-red-700",
};
const STATUS_LABEL: Record<string, string> = {
  RECEIVED:    "접수완료",
  IN_PROGRESS: "수리진행 중",
  INSPECTION:  "검사 중",
  COMPLETED:   "수리완료",
  DELIVERED:   "납품완료",
  CANCELLED:   "취소",
};
const FILE_LABELS: Record<string, string> = {
  disassembly_photo: "분해 사진",
  inspection_cert:   "검사 성적서",
  quote_pdf:         "견적서",
  delivery_note:     "거래명세표",
};

// ── 견적 상태 ──────────────────────────────────────────
const QUOTE_STATUS_BADGE: Record<string, string> = {
  DRAFT:  "bg-gray-50 text-gray-500",
  SENT:   "bg-blue-50 text-blue-700",
  ORDERED:"bg-green-50 text-green-700",
};
const QUOTE_STATUS_LABEL: Record<string, string> = {
  DRAFT:   "임시저장",
  SENT:    "접수완료",
  ORDERED: "주문확정",
};

function formatPrice(n: number) {
  return n > 0 ? n.toLocaleString("ko-KR") + "원" : "상담 후 확정";
}
function formatDate(s: string) {
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
function fmtQuoteNo(id: number, createdAt: string) {
  const d = new Date(createdAt);
  return `SMT-${d.getFullYear()}-Q-${String(id).padStart(6, "0")}`;
}

// ────────────────────────────────────────────────────────
export default function MypagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<"quotes" | "orders" | "repairs">("quotes");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRepairId, setOpenRepairId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.push("/auth/login"); return; }

    Promise.all([
      fetch("/api/quote").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/repair").then((r) => r.json()),
    ]).then(([quoteData, orderData, repairData]) => {
      setQuotes(Array.isArray(quoteData) ? quoteData : []);
      setOrders(orderData.orders ?? []);
      setRepairs(repairData.repairs ?? []);
    }).finally(() => setLoading(false));
  }, [session, status, router]);

  async function deleteQuote(quoteId: number) {
    if (!confirm("이 견적을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.")) return;
    setDeletingId(quoteId);
    try {
      const res = await fetch(`/api/quote/${quoteId}`, { method: "DELETE" });
      if (res.ok) {
        setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "삭제 중 오류가 발생했습니다.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="mono text-[12px] text-dim tracking-widest animate-pulse">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* 페이지 헤더 */}
      <div className="border-b border-line">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="mono text-[10px] text-dim tracking-widest mb-1">MY PAGE</div>
          <h1 className="text-[26px] font-bold tracking-tight">마이페이지</h1>
          {session?.user?.name && (
            <p className="text-[14px] text-dim mt-1">{session.user.name}님</p>
          )}
        </div>

        {/* 탭 */}
        <div className="max-w-3xl mx-auto px-6 flex gap-0">
          {(["quotes", "orders", "repairs"] as const).map((t) => {
            const labels = { quotes: "견적 이력", orders: "발주 이력", repairs: "수리 이력" };
            const counts = { quotes: quotes.length, orders: orders.length, repairs: repairs.length };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-[13px] font-semibold border-b-2 transition-colors ${
                  tab === t ? "border-edred text-edred" : "border-transparent text-dim hover:text-ink"
                }`}
              >
                {labels[t]}
                {counts[t] > 0 && (
                  <span className="ml-1.5 mono text-[11px] opacity-70">({counts[t]})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* ── 견적 이력 탭 ── */}
        {tab === "quotes" && (
          quotes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-[48px] mb-4 text-dim">○</div>
              <p className="text-[15px] font-medium mb-1">견적 요청 내역이 없습니다.</p>
              <p className="text-[13px] text-dim mb-6">제품을 카트에 담고 견적을 요청해 보세요.</p>
              <Link
                href="/#products"
                className="px-6 py-2.5 bg-ink text-paper text-[13px] font-semibold hover:bg-edred transition inline-block"
              >
                제품 보러 가기 →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {quotes.map((q) => {
                const quoteNo = fmtQuoteNo(q.id, q.createdAt);
                const subtotal = q.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
                const grand = subtotal + Math.round(subtotal * 0.1);
                const totalQty = q.items.reduce((s, i) => s + i.quantity, 0);

                return (
                  <div key={q.id} className="border border-line p-5">
                    {/* 헤더 행 */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="mono text-[11px] text-dim mb-0.5">{quoteNo}</div>
                        <div className="font-semibold text-[15px]">
                          {q.items.length > 0
                            ? (q.items[0].product?.description ?? q.items[0].customDescription ?? "기타 품목") + (q.items.length > 1 ? ` 외 ${q.items.length - 1}종` : "")
                            : "품목 없음"}
                        </div>
                        <div className="text-[12px] text-dim mt-0.5">
                          {formatDate(q.createdAt)}
                          {q.expiresAt && ` · 유효기간 ${formatDate(q.expiresAt)}`}
                        </div>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 font-semibold shrink-0 ${QUOTE_STATUS_BADGE[q.status] ?? "bg-gray-50 text-gray-500"}`}>
                        {QUOTE_STATUS_LABEL[q.status] ?? q.status}
                      </span>
                    </div>

                    {/* 금액 + 품목 수 */}
                    <div className="flex items-center gap-4 mb-4 py-3 border-y border-line">
                      <div>
                        <div className="text-[10px] text-dim mb-0.5">총액 (VAT 포함)</div>
                        <div className="font-bold text-[18px]">{grand.toLocaleString("ko-KR")}원</div>
                      </div>
                      <div className="w-px h-8 bg-line" />
                      <div>
                        <div className="text-[10px] text-dim mb-0.5">품목</div>
                        <div className="font-semibold text-[14px]">{q.items.length}종 · {totalQty} EA</div>
                      </div>
                      {q.taxInvoiceRequested && (
                        <>
                          <div className="w-px h-8 bg-line" />
                          <div className="text-[11px] bg-ink text-paper px-2 py-1 font-medium">세금계산서 신청</div>
                        </>
                      )}
                      {q.note?.includes("[발주서 진행 요청]") && (
                        <>
                          <div className="w-px h-8 bg-line" />
                          <div className="text-[11px] bg-edred text-paper px-2 py-1 font-medium">발주서 요청</div>
                        </>
                      )}
                    </div>

                    {/* 품목 목록 (최대 3개) */}
                    <div className="space-y-1.5 mb-4">
                      {q.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[12px]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="mono text-dim shrink-0">{String(idx + 1).padStart(2, "0")}</span>
                            <span className="truncate text-dim font-mono text-[11px]">{item.product?.partNo ?? item.customPartNo ?? "-"}</span>
                            <span className="truncate">{item.product?.description ?? item.customDescription ?? "-"}</span>
                          </div>
                          <span className="shrink-0 ml-2 text-dim">{item.quantity} EA</span>
                        </div>
                      ))}
                      {q.items.length > 3 && (
                        <div className="text-[11px] text-dim">+ {q.items.length - 3}개 더보기</div>
                      )}
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-2">
                      <Link
                        href={`/quote/${q.id}`}
                        className="flex-1 py-2 text-center text-[12px] font-semibold border border-ink hover:bg-ink hover:text-paper transition"
                      >
                        견적서 보기
                      </Link>
                      <a
                        href={`/api/quote/${q.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 text-center text-[12px] font-semibold bg-ink text-paper hover:bg-edred transition"
                      >
                        PDF 다운로드
                      </a>
                      {q.status !== "CONFIRMED" && (
                        <button
                          onClick={() => deleteQuote(q.id)}
                          disabled={deletingId === q.id}
                          className="px-4 py-2 text-[12px] font-semibold border border-line text-dim hover:border-red-400 hover:text-red-500 transition disabled:opacity-40"
                        >
                          {deletingId === q.id ? "..." : "삭제"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── 발주 이력 탭 ── */}
        {tab === "orders" && (
          orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-[48px] mb-4 text-dim">○</div>
              <p className="text-[15px] font-medium mb-1">발주 이력이 없습니다.</p>
              <p className="text-[13px] text-dim mb-6">견적서에서 주문 확정 후 이곳에 표시됩니다.</p>
              <button
                onClick={() => setTab("quotes")}
                className="px-6 py-2.5 bg-ink text-paper text-[13px] font-semibold hover:bg-edred transition"
              >
                견적 이력 보기 →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const quoteNo = fmtQuoteNo(order.quote.id, order.quote.createdAt);
                const orderNo = `SMT-${new Date(order.createdAt).getFullYear()}-O-${String(order.id).padStart(6, "0")}`;
                const subtotal = order.quote.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
                const grand = subtotal + Math.round(subtotal * 0.1);
                const totalQty = order.quote.items.reduce((s, i) => s + i.quantity, 0);
                const currentStepIdx = ORDER_STATUS_STEPS.findIndex((s) => s.key === order.status);

                return (
                  <div key={order.id} className="border border-line p-5">
                    {/* 헤더 */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="mono text-[11px] text-dim mb-0.5">{orderNo}</div>
                        <div className="font-semibold text-[15px]">
                          {order.quote.items.length > 0
                            ? (order.quote.items[0].product?.description ?? order.quote.items[0].customDescription ?? "기타 품목") + (order.quote.items.length > 1 ? ` 외 ${order.quote.items.length - 1}종` : "")
                            : "품목 없음"}
                        </div>
                        <div className="text-[12px] text-dim mt-0.5">
                          발주일 {formatDate(order.createdAt)} · 견적번호 {quoteNo}
                        </div>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 font-semibold shrink-0 ${ORDER_STATUS_BADGE[order.status] ?? "bg-gray-50 text-gray-500"}`}>
                        {ORDER_STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>

                    {/* 진행 단계 */}
                    <div className="flex items-center mb-4">
                      {ORDER_STATUS_STEPS.map((step, i) => {
                        const done = i <= currentStepIdx;
                        const isCurrent = i === currentStepIdx;
                        return (
                          <div key={step.key} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold ${
                                isCurrent ? "border-edred bg-edred text-paper"
                                : done ? "border-ink bg-ink text-paper"
                                : "border-line bg-paper text-dim"
                              }`}>
                                {done && !isCurrent ? "✓" : i + 1}
                              </div>
                              <div className={`text-[10px] mt-1.5 text-center ${
                                isCurrent ? "text-edred font-semibold" : done ? "text-ink" : "text-dim"
                              }`}>
                                {step.label}
                              </div>
                            </div>
                            {i < ORDER_STATUS_STEPS.length - 1 && (
                              <div className={`flex-1 h-0.5 mb-5 mx-1 ${i < currentStepIdx ? "bg-ink" : "bg-line"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* 금액 + 품목 */}
                    <div className="flex items-center gap-4 mb-4 py-3 border-y border-line">
                      <div>
                        <div className="text-[10px] text-dim mb-0.5">총액 (VAT 포함)</div>
                        <div className="font-bold text-[18px]">{grand.toLocaleString("ko-KR")}원</div>
                      </div>
                      <div className="w-px h-8 bg-line" />
                      <div>
                        <div className="text-[10px] text-dim mb-0.5">품목</div>
                        <div className="font-semibold text-[14px]">{order.quote.items.length}종 · {totalQty} EA</div>
                      </div>
                      {order.deliveryIssue && (
                        <>
                          <div className="w-px h-8 bg-line" />
                          <div className="text-[11px] bg-amber-100 text-amber-700 px-2 py-1 font-medium">납기 문의 중</div>
                        </>
                      )}
                      {order.confirmedAt && (
                        <>
                          <div className="w-px h-8 bg-line" />
                          <div className="text-[11px] text-dim">확정일 {formatDate(order.confirmedAt)}</div>
                        </>
                      )}
                    </div>

                    {/* 품목 목록 */}
                    <div className="space-y-1.5 mb-4">
                      {order.quote.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[12px]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="mono text-dim shrink-0">{String(idx + 1).padStart(2, "0")}</span>
                            <span className="mono text-dim text-[11px] shrink-0">{item.product?.partNo ?? item.customPartNo ?? "-"}</span>
                            <span className="truncate">{item.product?.description ?? item.customDescription ?? "-"}</span>
                          </div>
                          <span className="shrink-0 ml-2 text-dim">{item.quantity} EA</span>
                        </div>
                      ))}
                      {order.quote.items.length > 3 && (
                        <div className="text-[11px] text-dim">+ {order.quote.items.length - 3}개 더보기</div>
                      )}
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-2">
                      <Link
                        href={`/quote/${order.quote.id}`}
                        className="flex-1 py-2 text-center text-[12px] font-semibold border border-ink hover:bg-ink hover:text-paper transition"
                      >
                        견적서 보기
                      </Link>
                      <a
                        href={`/api/quote/${order.quote.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 text-center text-[12px] font-semibold bg-ink text-paper hover:bg-edred transition"
                      >
                        PDF 다운로드
                      </a>
                    </div>

                    {order.status === "PENDING" && (
                      <p className="text-[12px] text-dim text-center mt-3">
                        발주 관련 문의:{" "}
                        <a href="tel:031-204-7170" className="text-edred hover:underline">031-204-7170</a>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── 수리 이력 탭 ── */}
        {tab === "repairs" && (
          repairs.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-[48px] mb-4 text-dim">○</div>
              <p className="text-[15px] font-medium mb-1">수리 접수 내역이 없습니다.</p>
              <p className="text-[13px] text-dim mb-6">수리가 필요한 장비가 있으신가요?</p>
              <button
                onClick={() => router.push("/repair")}
                className="px-6 py-2.5 bg-ink text-paper text-[13px] font-semibold hover:bg-edred transition"
              >
                수리 접수 신청 →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {repairs.map((r) => {
                const isOpen = openRepairId === r.id;
                const completedKeys = new Set(r.statusLogs.map((l) => l.toStatus));
                const isCancelled = r.status === "CANCELLED";
                const fileGroups: Record<string, RepairFile[]> = {};
                for (const f of r.files) {
                  if (!fileGroups[f.fileType]) fileGroups[f.fileType] = [];
                  fileGroups[f.fileType].push(f);
                }
                const hasFiles = r.files.length > 0;

                return (
                  <div key={r.id} className="border border-line">
                    <button
                      onClick={() => setOpenRepairId(isOpen ? null : r.id)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-ink/5 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="mono text-[11px] text-dim mb-0.5">{r.repairNo}</div>
                          <div className="font-semibold text-[15px] flex items-center gap-2">
                            {r.pumpMaker} {r.pumpModel || "모델 확인 중"}
                            {r.aiConfidence === "low" && !r.pumpModel && (
                              <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 font-semibold">
                                담당자 확인 중
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-dim mt-0.5">{formatDate(r.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {hasFiles && (
                          <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 font-medium">
                            파일 {r.files.length}개
                          </span>
                        )}
                        <span className={`text-[11px] px-2.5 py-1 font-semibold ${STATUS_BADGE[r.status] ?? ""}`}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </span>
                        <span className="text-dim text-[16px] leading-none">{isOpen ? "∧" : "∨"}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-line px-5 py-5 space-y-6">
                        {!isCancelled && (
                          <div>
                            <div className="mono text-[10px] text-dim tracking-widest mb-4">진행 현황</div>
                            <div className="flex items-center">
                              {STATUS_STEPS.map((step, i) => {
                                const done = completedKeys.has(step.key);
                                const isCurrent = r.status === step.key;
                                return (
                                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center">
                                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition ${
                                        isCurrent ? "border-edred bg-edred text-paper"
                                        : done ? "border-ink bg-ink text-paper"
                                        : "border-line bg-paper text-dim"
                                      }`}>
                                        {done && !isCurrent ? "✓" : i + 1}
                                      </div>
                                      <div className={`text-[10px] mt-1.5 text-center leading-tight ${
                                        isCurrent ? "text-edred font-semibold" : done ? "text-ink" : "text-dim"
                                      }`}>
                                        {step.label}
                                      </div>
                                    </div>
                                    {i < STATUS_STEPS.length - 1 && (
                                      <div className={`flex-1 h-0.5 mb-5 mx-1 ${
                                        completedKeys.has(STATUS_STEPS[i + 1].key) ? "bg-ink" : "bg-line"
                                      }`} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {isCancelled && (
                          <div className="bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
                            이 접수는 취소되었습니다. 문의: 031-204-7170
                          </div>
                        )}

                        <div className="border border-line p-4 space-y-2 text-[13px]">
                          <div className="mono text-[10px] text-dim tracking-widest mb-2">접수 정보</div>
                          <InfoRow label="장비" value={`${r.pumpMaker} ${r.pumpModel || "확인 중"}`} />
                          {r.pumpSerial && <InfoRow label="S/N" value={r.pumpSerial} />}
                          {r.repairTier && (
                            <InfoRow label="수리단계" value={
                              r.repairTier === 1 ? "Tier 1 — 기본수리"
                              : r.repairTier === 2 ? "Tier 2 — 기본수리 + 파트교체"
                              : "Tier 3 — 전체수리"
                            } />
                          )}
                          {r.symptoms.length > 0 && <InfoRow label="증상" value={r.symptoms.join(", ")} />}
                          {r.symptomNote && <InfoRow label="메모" value={r.symptomNote} />}
                          <InfoRow label="견적" value={formatPrice(r.totalAmount)} />
                          {r.aiConfidence === "low" && !r.pumpModel && (
                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 text-[12px] text-amber-800">
                              모델명 확인을 위해 담당자가 연락드릴 예정입니다.
                            </div>
                          )}
                        </div>

                        {hasFiles && (
                          <div className="border border-line p-4 text-[13px]">
                            <div className="mono text-[10px] text-dim tracking-widest mb-3">문서 다운로드</div>
                            <div className="space-y-2">
                              {Object.entries(fileGroups).map(([type, files]) => (
                                <div key={type}>
                                  <div className="text-[11px] text-dim mb-1.5">{FILE_LABELS[type] ?? type}</div>
                                  {files.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 border border-line px-3 py-2 mb-1">
                                      <span className="text-green-600 text-[11px]">✓</span>
                                      <span className="flex-1 truncate text-[12px]">{f.fileName}</span>
                                      {f.fileUrl.startsWith("http") ? (
                                        <a href={f.fileUrl} target="_blank" rel="noopener noreferrer"
                                          className="text-[11px] text-edred font-medium hover:underline shrink-0">
                                          다운로드
                                        </a>
                                      ) : (
                                        <span className="text-[11px] text-dim shrink-0">준비 중</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-[12px] text-dim text-center">
                          수리 관련 문의:{" "}
                          <a href="tel:031-204-7170" className="text-edred hover:underline">031-204-7170</a>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-dim w-12 shrink-0 text-[12px]">{label}</span>
      <span className="flex-1 font-medium">{value}</span>
    </div>
  );
}
