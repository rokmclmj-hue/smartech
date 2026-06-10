"use client";

import { useEffect, useState, useCallback } from "react";

// ── 타입 ──────────────────────────────────────────
type OrderItem = {
  partNo: string;
  description: string;
  quantity: number;
  unitPrice: number;
  productId?: number | null;
  sortOrder?: number;
};

type PurchaseOrder = {
  id: number;
  orderNo: string;
  status: string;
  department: string;
  toCompany: string;
  toName: string | null;
  toEmail: string | null;
  ccEmails: string | null;
  orderDate: string;
  requestedDate: string | null;
  message: string | null;
  memo: string | null;
  sentAt: string | null;
  createdAt: string;
  items: OrderItem[];
};

type DeptContact = {
  code: string;
  contactName: string;
  contactEmail: string;
  ccEmails: string | null;
  defaultMessage: string | null;
};

function fmt(n: number) {
  return n.toLocaleString("ko-KR") + " 원";
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function toDateInput(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

const BLANK_ITEM: OrderItem = { partNo: "", description: "", quantity: 1, unitPrice: 0 };

const DEPT_LABELS: Record<string, string> = {
  IV: "IV 부서 (이오베큠)",
  SV: "SV 부서 (서보백)",
  AK: "AK 부서 (아코스)",
};

// ── 발주서 작성 폼 ─────────────────────────────────
function OrderForm({ onSaved }: { onSaved: () => void }) {
  const [deptContacts, setDeptContacts] = useState<DeptContact[]>([]);

  // 발주 정보
  const [department, setDepartment] = useState("");
  const [toCompany, setToCompany] = useState("");
  const [toName, setToName] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [ccEmails, setCcEmails] = useState("");
  const [orderDate, setOrderDate] = useState(toDateInput(new Date()));
  const [requestedDate, setRequestedDate] = useState("");
  const [message, setMessage] = useState("");
  const [memo, setMemo] = useState("");

  // 품목
  const [items, setItems] = useState<OrderItem[]>([{ ...BLANK_ITEM }]);

  // 상품 검색
  const [productQ, setProductQ] = useState("");
  const [productResults, setProductResults] = useState<{ id: number; partNo: string; description: string; costPrice: number }[]>([]);
  const [focusedItemIdx, setFocusedItemIdx] = useState<number | null>(null);

  // 상태
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 부서 담당자 목록 로드
  useEffect(() => {
    fetch("/api/admin/department-contacts")
      .then((r) => r.ok ? r.json() : [])
      .then(setDeptContacts);
  }, []);

  // 부서 선택 시 담당자 정보 자동 채우기
  function handleDeptChange(code: string) {
    setDepartment(code);
    if (!code) return;
    const dc = deptContacts.find((d) => d.code === code);
    if (dc) {
      setToEmail(dc.contactEmail ?? "");
      setCcEmails(dc.ccEmails ?? "");
      setMessage(dc.defaultMessage ?? "");
    }
  }

  // 상품 검색
  useEffect(() => {
    if (productQ.length < 1) { setProductResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(productQ)}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        setProductResults(data.items ?? []);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [productQ]);

  function addItem() {
    setItems((prev) => [...prev, { ...BLANK_ITEM }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof OrderItem, value: string | number) {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }

  function selectProduct(idx: number, p: { id: number; partNo: string; description: string; costPrice: number }) {
    setItems((prev) => prev.map((it, i) =>
      i === idx ? { ...it, partNo: p.partNo, description: p.description, unitPrice: p.costPrice, productId: p.id } : it
    ));
    setProductQ("");
    setProductResults([]);
    setFocusedItemIdx(null);
  }

  const totalSupply = items.reduce((s, i) => s + (Number(i.unitPrice) * Number(i.quantity)), 0);
  const totalVat = Math.round(totalSupply * 0.1);
  const totalAmount = totalSupply + totalVat;

  async function handleSave() {
    setError("");
    if (!department) { setError("부서를 선택해주세요."); return; }
    if (!toCompany.trim()) { setError("공급업체명을 입력해주세요."); return; }
    if (items.length === 0 || items.every(i => !i.partNo.trim() && !i.description.trim())) {
      setError("품목을 1개 이상 입력해주세요."); return;
    }
    const hasNoPrice = items.some(i => !i.partNo.trim() ? false : Number(i.unitPrice) === 0);
    if (hasNoPrice && !confirm("단가가 0원인 품목이 있습니다. 계속 저장할까요?")) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department, toCompany, toName, toEmail, ccEmails,
          orderDate, requestedDate: requestedDate || null,
          message, memo,
          items: items
            .filter(i => i.partNo.trim() || i.description.trim())
            .map((it, idx) => ({ ...it, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice), sortOrder: idx })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "오류가 발생했습니다."); return; }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 01 부서 및 공급업체 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair">
          <span className="mono text-[10px] dim tracking-[0.12em]">01 / 발주 부서 및 공급업체</span>
        </div>
        <div className="px-5 py-4 space-y-4">
          {/* 부서 선택 */}
          <div>
            <div className="mono text-[10px] dim mb-2">발주 부서 *</div>
            <div className="flex gap-2 flex-wrap">
              {["IV", "SV", "AK"].map((code) => (
                <button
                  key={code}
                  onClick={() => handleDeptChange(code)}
                  className={`px-4 py-2 text-[13px] border transition-all ${
                    department === code
                      ? "bg-smblue text-paper border-smblue"
                      : "hair hover:bg-ink/5"
                  }`}
                >
                  <span className="mono font-bold mr-1">{code}</span>
                  <span className="text-[11px]">— {DEPT_LABELS[code]?.split(" ")[2] ?? ""}</span>
                </button>
              ))}
            </div>
            {department && (
              <div className="mt-2 text-[12px] dim">
                {DEPT_LABELS[department]}
              </div>
            )}
          </div>

          {/* 공급업체 정보 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            <div>
              <div className="mono text-[10px] dim mb-1">공급업체명 *</div>
              <input value={toCompany} onChange={(e) => setToCompany(e.target.value)}
                placeholder="예: (주)이오베큠코리아"
                className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink" />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">담당자</div>
              <input value={toName} onChange={(e) => setToName(e.target.value)}
                placeholder="홍길동"
                className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink" />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">수신 이메일</div>
              <input type="email" value={toEmail} onChange={(e) => setToEmail(e.target.value)}
                placeholder="contact@supplier.com"
                className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">참조 이메일 <span className="normal-case">(쉼표로 구분)</span></div>
              <input value={ccEmails} onChange={(e) => setCcEmails(e.target.value)}
                placeholder="cc1@example.com, cc2@example.com"
                className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
            </div>
          </div>
        </div>
      </div>

      {/* 02 발주 일정 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair">
          <span className="mono text-[10px] dim tracking-[0.12em]">02 / 발주 일정</span>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <div className="mono text-[10px] dim mb-1">발주일 *</div>
              <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)}
                className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">납기 요청일</div>
              <input type="date" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)}
                className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
            </div>
          </div>
        </div>
      </div>

      {/* 03 품목 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair flex items-center justify-between">
          <span className="mono text-[10px] dim tracking-[0.12em]">03 / 발주 품목 <span className="text-edred">— 단가 필수</span></span>
          <button onClick={addItem}
            className="bg-smblue text-paper px-3 py-1 text-[11px] mono hover:brightness-110 transition-colors">
            + 품목 추가
          </button>
        </div>
        <div className="px-5 py-4 space-y-2">
          {/* 상품 검색 */}
          {focusedItemIdx !== null && (
            <div className="relative max-w-md mb-2">
              <input
                autoFocus
                value={productQ}
                onChange={(e) => setProductQ(e.target.value)}
                placeholder="상품 검색 (파트번호·품목명)"
                className="w-full border border-smblue px-3 py-1.5 text-[13px] focus:outline-none"
              />
              {productResults.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 bg-paper border hair shadow-lg max-h-48 overflow-y-auto">
                  {productResults.map((p) => (
                    <button key={p.id} onClick={() => selectProduct(focusedItemIdx, p)}
                      className="w-full text-left px-3 py-2 hover:bg-ink/5 border-b hair last:border-0">
                      <span className="mono text-[11px] text-smblue mr-2">{p.partNo}</span>
                      <span className="text-[12px]">{p.description}</span>
                      <span className="mono text-[11px] dim ml-2">{p.costPrice.toLocaleString()}원</span>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => { setFocusedItemIdx(null); setProductQ(""); setProductResults([]); }}
                className="mt-1 text-[11px] dim hover:text-ink">닫기</button>
            </div>
          )}

          <div className="grid grid-cols-[2fr_3fr_1fr_2fr_auto] gap-2 text-[10px] mono dim tracking-[0.06em] uppercase px-1">
            <div>파트번호</div><div>품목명</div><div>수량</div><div>단가 * (원)</div><div></div>
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-[2fr_3fr_1fr_2fr_auto] gap-2 items-center">
              <input value={item.partNo} onChange={(e) => updateItem(idx, "partNo", e.target.value)}
                onFocus={() => setFocusedItemIdx(idx)}
                placeholder="파트번호"
                className="border hair px-2 py-1.5 text-[12px] mono focus:outline-none focus:border-smblue" />
              <input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)}
                placeholder="품목명"
                className="border hair px-2 py-1.5 text-[12px] focus:outline-none focus:border-ink" />
              <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                className="border hair px-2 py-1.5 text-[12px] text-center focus:outline-none focus:border-ink" />
              <input type="number" min={0} value={item.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                className={`border px-2 py-1.5 text-[12px] text-right mono focus:outline-none ${Number(item.unitPrice) === 0 ? "border-yellow-300 bg-yellow-50/50" : "hair focus:border-ink"}`} />
              <button onClick={() => removeItem(idx)} className="text-[14px] text-dim hover:text-edred transition-colors px-1">×</button>
            </div>
          ))}

          {/* 합계 */}
          <div className="border-t hair mt-3 pt-3 flex justify-end">
            <div className="text-right space-y-1">
              <div className="text-[12px] dim">공급가액: <span className="mono text-ink">{totalSupply.toLocaleString()}</span></div>
              <div className="text-[12px] dim">부가세(10%): <span className="mono text-ink">{totalVat.toLocaleString()}</span></div>
              <div className="text-[14px] font-bold">합계: <span className="mono text-smblue">{fmt(totalAmount)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 04 발주 문구 및 메모 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair">
          <span className="mono text-[10px] dim tracking-[0.12em]">04 / 발주 문구 및 메모</span>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <div className="mono text-[10px] dim mb-1">발주 문구 <span className="normal-case">(PDF에 출력됩니다)</span></div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
              placeholder="예: 안녕하세요. 스마텍입니다. 아래 품목에 대해 발주 드립니다."
              className="w-full border hair px-3 py-2 text-[13px] focus:outline-none focus:border-ink resize-none max-w-2xl" />
          </div>
          <div>
            <div className="mono text-[10px] dim mb-1">내부 메모 <span className="normal-case">(PDF 미출력)</span></div>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2}
              placeholder="내부용 참고사항"
              className="w-full border hair px-3 py-2 text-[13px] focus:outline-none focus:border-ink resize-none max-w-2xl" />
          </div>
        </div>
      </div>

      {error && <div className="text-[13px] text-red-600 px-1">{error}</div>}

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving}
          className="bg-smblue text-paper px-6 py-2.5 text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50">
          {saving ? "저장 중..." : "발주서 저장"}
        </button>
      </div>
    </div>
  );
}

// ── 이력 행 ───────────────────────────────────────
function OrderRow({ order, onDelete }: { order: PurchaseOrder; onDelete: () => void }) {
  const [sendEmail, setSendEmail] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSend, setShowSend] = useState(false);

  useEffect(() => {
    setSendEmail(order.toEmail ?? "");
    setCcInput(order.ccEmails ?? "");
  }, [order.toEmail, order.ccEmails]);

  const totalSupply = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const grand = Math.round(totalSupply * 1.1);

  async function handleSend() {
    if (!sendEmail.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/purchase-orders/${order.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: sendEmail, ccEmails: ccInput }),
      });
      const data = await res.json();
      if (res.ok) { setToast("발송 완료"); setShowSend(false); onDelete(); }
      else setToast(data.error ?? "발송 실패");
    } finally {
      setSending(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleDelete() {
    if (!confirm(`"${order.toCompany}" 발주서(${order.orderNo})를 삭제할까요?`)) return;
    setDeleting(true);
    await fetch(`/api/admin/purchase-orders/${order.id}`, { method: "DELETE" });
    onDelete();
  }

  return (
    <div className="border hair bg-paper p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="mono text-[11px] font-bold text-smblue">{order.orderNo}</span>
            <span className={`mono text-[10px] px-1.5 py-0.5 ${order.status === "SENT" ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-700"}`}>
              {order.status === "SENT" ? "발송완료" : "초안"}
            </span>
            <span className="mono text-[10px] px-1.5 py-0.5 bg-ink/5 text-ink/70">{order.department}</span>
            <span className="mono text-[10px] dim">{fmtDate(order.orderDate)}</span>
            {order.requestedDate && (
              <span className="mono text-[10px] dim">납기: {fmtDate(order.requestedDate)}</span>
            )}
          </div>
          <div className="text-[14px] font-semibold">{order.toCompany}</div>
          <div className="text-[12px] dim">
            {order.toName && <span className="mr-2">{order.toName}</span>}
            {order.toEmail && <span className="mono mr-2">{order.toEmail}</span>}
          </div>
          {order.memo && (
            <div className="text-[11px] dim italic border-l-2 border-line pl-2 mt-1">{order.memo}</div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-[14px] font-bold mono">{grand.toLocaleString()} 원</div>
          <div className="text-[11px] dim">{order.items.length}개 품목 · VAT 포함</div>
          {order.sentAt && (
            <div className="text-[10px] dim mt-0.5">발송: {fmtDate(order.sentAt)}</div>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2 flex-wrap">
        <a href={`/api/admin/purchase-orders/${order.id}/pdf?preview=1`} target="_blank" rel="noopener noreferrer"
          className="border hair px-3 py-1.5 text-[12px] mono hover:bg-ink/5 transition-colors">
          PDF 미리보기
        </a>
        <a href={`/api/admin/purchase-orders/${order.id}/pdf`}
          className="border hair px-3 py-1.5 text-[12px] mono hover:bg-ink/5 transition-colors">
          PDF 다운로드
        </a>
        <button onClick={() => setShowSend(!showSend)}
          className="bg-smblue text-paper px-3 py-1.5 text-[12px] hover:brightness-110 transition-colors">
          이메일 발송
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="border hair border-red-200 text-red-500 px-3 py-1.5 text-[12px] hover:bg-red-50 transition-colors disabled:opacity-40">
          삭제
        </button>
        {toast && <span className={`text-[12px] mono ${toast.includes("완료") ? "text-green-600" : "text-red-600"}`}>{toast}</span>}
      </div>

      {/* 이메일 발송 패널 */}
      {showSend && (
        <div className="space-y-2 border-t hair pt-3 max-w-lg">
          <div className="flex gap-2 items-center">
            <div className="mono text-[10px] dim w-16 shrink-0">수신</div>
            <input type="email" value={sendEmail} onChange={(e) => setSendEmail(e.target.value)}
              placeholder="수신 이메일"
              className="flex-1 border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
          </div>
          <div className="flex gap-2 items-center">
            <div className="mono text-[10px] dim w-16 shrink-0">참조 CC</div>
            <input value={ccInput} onChange={(e) => setCcInput(e.target.value)}
              placeholder="cc1@example.com, cc2@example.com"
              className="flex-1 border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
          </div>
          <button onClick={handleSend} disabled={sending || !sendEmail.trim()}
            className="bg-smblue text-paper px-5 py-1.5 text-[12px] hover:brightness-110 transition-all disabled:opacity-40">
            {sending ? "발송 중..." : "발송"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────
export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/purchase-orders");
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  function handleSaved() {
    setShowForm(false);
    loadOrders();
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1200px] mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">— 08 · PURCHASE ORDERS</div>
          <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink">
            발 <span className="italic text-smblue">주 서</span>
          </h1>
          <p className="mt-3 text-[13px] dim">부서별 공급업체에 발주서를 직접 작성·발송합니다. 단가는 반드시 기재합니다.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-smblue text-paper px-5 py-2.5 text-[13px] font-semibold hover:brightness-110 transition-all shrink-0"
        >
          {showForm ? "✕ 닫기" : "+ 새 발주서"}
        </button>
      </div>

      {/* 작성 폼 */}
      {showForm && (
        <div className="border-2 border-smblue/30 p-5 sm:p-6 bg-paper">
          <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-5">— 새 발주서 작성</div>
          <OrderForm onSaved={handleSaved} />
        </div>
      )}

      {/* 이력 목록 */}
      <div>
        <div className="mono text-[11px] dim tracking-[0.12em] uppercase mb-3">
          — 발행 이력 ({orders.length}건)
        </div>
        {loading ? (
          <div className="mono text-[11px] dim text-center py-10">— Loading</div>
        ) : orders.length === 0 ? (
          <div className="border hair bg-paper/50 px-6 py-10 text-center text-[13px] dim">
            발행된 발주서가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} onDelete={loadOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
