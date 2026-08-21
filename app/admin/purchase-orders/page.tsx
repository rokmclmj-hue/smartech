"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { formatSalutation } from "@/lib/salutation";

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

function makeSubject(department: string, items: OrderItem[]): string {
  const dept = department || "IV";
  // Fix #9: 수량 0 항목 제외 (제목에 "x0" 표시 방지)
  const valid = items.filter((i) => (i.description || i.partNo).trim() && i.quantity > 0);
  if (!valid.length) return `[스마텍] 발주서 송부 — 에드워드${dept}`;
  const first = valid[0];
  const name = (first.description || first.partNo).trim();
  const suffix = valid.length > 1 ? " 외" : "";
  return `[스마텍] 발주서 송부 — 에드워드${dept} · ${name} x${first.quantity}${suffix}`;
}

function makeItemSummary(items: OrderItem[]): string {
  const valid = items.filter((i) => (i.description || i.partNo).trim() && i.quantity > 0);
  if (!valid.length) return "";
  const first = valid[0];
  const name = (first.description || first.partNo).trim();
  const suffix = valid.length > 1 ? ` 외 ${valid.length - 1}건` : "";
  return `${name} x${first.quantity}${suffix}`;
}

function appendSignature(msg: string): string {
  if (msg.includes("이명재 배상")) return msg;
  // ensureSignature와 동일한 단일 개행 사용 (초안·발송 본문 일치)
  return msg ? msg.trimEnd() + "\n이명재 배상" : "이명재 배상";
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function toDateInput(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

const BLANK_ITEM: OrderItem = { partNo: "", description: "", quantity: 1, unitPrice: 0 };

const DEPT_COMPANIES: Record<string, string> = {
  IV: "에드워드코리아IV",
  SV: "에드워드코리아SV",
  AK: "에드워드코리아AK",
};

// ── 발주서 작성 폼 ─────────────────────────────────
function OrderForm({ onSaved, initialData }: { onSaved: () => void; initialData?: PurchaseOrder | null }) {
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
  const [savingAndSend, setSavingAndSend] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // 부서 담당자 목록 로드
  useEffect(() => {
    fetch("/api/admin/department-contacts")
      .then((r) => r.ok ? r.json() : [])
      .then(setDeptContacts);
  }, []);

  // 이전 발주서 복사 시 폼 자동 채우기
  useEffect(() => {
    if (!initialData) return;
    setDepartment(initialData.department);
    setToCompany(initialData.toCompany);
    setToName(initialData.toName ?? "");
    setToEmail(initialData.toEmail ?? "");
    setCcEmails(initialData.ccEmails ?? "");
    setMessage(initialData.message ?? "");
    setMemo(initialData.memo ?? "");
    setItems(initialData.items.map((it) => ({ ...it })));
    setOrderDate(toDateInput(new Date()));
    setRequestedDate("");
  }, [initialData]);

  // 부서 선택 시 담당자 정보 자동 채우기
  function handleDeptChange(code: string) {
    setDepartment(code);
    if (!code) return;
    const dc = deptContacts.find((d) => d.code === code);
    if (dc) {
      setToCompany(DEPT_COMPANIES[code] ?? "");
      setToName(dc.contactName ?? "");
      setToEmail(dc.contactEmail ?? "");
      setCcEmails(dc.ccEmails ?? "");
      setMessage(appendSignature(dc.defaultMessage ?? ""));
    }
  }

  // 상품 검색
  useEffect(() => {
    if (productQ.length < 1) { setProductResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(productQ)}&limit=30`);
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

  async function doSave() {
    if (!department) { setError("부서를 선택해주세요."); return null; }
    if (!toCompany.trim()) { setError("수신처명을 입력해주세요."); return null; }
    if (items.length === 0 || items.every(i => !i.partNo.trim() && !i.description.trim())) {
      setError("품목을 1개 이상 입력해주세요."); return null;
    }
    const hasNoPrice = items.some(i => !i.partNo.trim() ? false : Number(i.unitPrice) === 0);
    if (hasNoPrice && !confirm("단가가 0원인 품목이 있습니다. 계속 저장할까요?")) return null;

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
    if (!res.ok) { setError(data.error ?? "오류가 발생했습니다."); return null; }
    return data;
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const data = await doSave();
      if (!data) return;
      window.open(`/api/admin/purchase-orders/${data.id}/pdf`, "_blank");
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  function handleOpenPreview() {
    setError("");
    if (!department) { setError("부서를 선택해주세요."); return; }
    if (!toCompany.trim()) { setError("수신처명을 입력해주세요."); return; }
    if (!toEmail.trim()) { setError("수신 이메일을 입력해주세요."); return; }
    if (items.length === 0 || items.every(i => !i.partNo.trim() && !i.description.trim())) {
      setError("품목을 1개 이상 입력해주세요."); return;
    }
    setPreviewOpen(true);
  }

  async function handleSaveAndSend() {
    setPreviewOpen(false);
    setSavingAndSend(true);
    try {
      const saveData = await doSave();
      if (!saveData) return;

      const sendRes = await fetch(`/api/admin/purchase-orders/${saveData.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail, ccEmails, bodyText: ensureSignature(message, toCompany, "", toName), subject: makeSubject(department, items) }),
      });
      const sendData = await sendRes.json();
      if (!sendRes.ok) { setError(sendData.error ?? "메일 발송 오류가 발생했습니다."); return; }

      onSaved();
    } finally {
      setSavingAndSend(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 01 부서 및 수신처 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair">
          <span className="mono text-[10px] dim tracking-[0.12em]">01 / 발주 부서 및 수신처</span>
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
                  <span className="mono font-bold">{code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 수신처 정보 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            <div>
              <div className="mono text-[10px] dim mb-1">수신처명 *</div>
              <input value={toCompany} onChange={(e) => setToCompany(e.target.value)}
                placeholder="예: 에드워드코리아IV"
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
            <div className="mono text-[10px] dim mb-1">발주 문구 <span className="normal-case">(이메일 본문으로 발송됩니다 · PDF 미출력)</span></div>
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

      <div className="flex gap-3 flex-wrap">
        <button onClick={handleSave} disabled={saving || savingAndSend}
          className="border hair px-6 py-2.5 text-[13px] font-semibold hover:bg-ink/5 transition-all disabled:opacity-50">
          {saving ? "저장 중..." : "PDF 저장"}
        </button>
        <button onClick={handleOpenPreview} disabled={saving || savingAndSend}
          className="bg-smblue text-paper px-6 py-2.5 text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50">
          {savingAndSend ? "발송 중..." : "저장 + 메일 송부"}
        </button>
      </div>

      {/* 이메일 미리보기 모달 */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40">
          <div className="bg-paper border hair shadow-xl w-full max-w-lg mx-4 p-6 space-y-4">
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase">— 이메일 미리보기</div>
            <div className="space-y-2 text-[13px]">
              <div className="flex gap-3 border-b hair pb-2">
                <span className="mono text-[10px] dim w-12 shrink-0 mt-0.5">발신</span>
                <span className="mono">info@smartechvacuum.com</span>
              </div>
              <div className="flex gap-3 border-b hair pb-2">
                <span className="mono text-[10px] dim w-12 shrink-0 mt-0.5">수신</span>
                <span className="mono text-smblue">{toEmail}</span>
              </div>
              {ccEmails.trim() && (
                <div className="flex gap-3 border-b hair pb-2">
                  <span className="mono text-[10px] dim w-12 shrink-0 mt-0.5">참조</span>
                  <span className="mono text-[12px]">{ccEmails}</span>
                </div>
              )}
              <div className="flex gap-3 border-b hair pb-2">
                <span className="mono text-[10px] dim w-12 shrink-0 mt-0.5">제목</span>
                <span className="font-medium">{makeSubject(department, items)}</span>
              </div>
              <div className="flex gap-3 border-b hair pb-2">
                <span className="mono text-[10px] dim w-12 shrink-0 mt-0.5">첨부</span>
                <span className="mono text-[12px] text-dim">발주서 PDF (자동 첨부)</span>
              </div>
              <div className="flex gap-3">
                <span className="mono text-[10px] dim w-12 shrink-0 mt-0.5">본문</span>
                <pre className="text-[12px] whitespace-pre-wrap leading-relaxed flex-1 max-h-32 overflow-y-auto">
                  {ensureSignature(message, toCompany, "", toName) || "(본문 없음)"}
                </pre>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPreviewOpen(false)}
                className="flex-1 border hair px-4 py-2 text-[13px] hover:bg-ink/5 transition-colors">
                취소
              </button>
              <button onClick={handleSaveAndSend} disabled={savingAndSend}
                className="flex-1 bg-smblue text-paper px-4 py-2 text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50">
                {savingAndSend ? "발송 중..." : "확인 · 발송"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_MAIL_BODY = (toCompany: string, orderNo: string, toName?: string | null) =>
  `${toCompany} ${formatSalutation(toName)}, 안녕하세요.\n\n스마텍입니다.\n발주서(${orderNo})를 첨부하여 드립니다.\n납기 확인 후 회신 부탁드립니다.\n\n감사합니다.\n이명재 배상`;

function ensureSignature(msg: string, toCompany: string, orderNo: string, toName?: string | null): string {
  const base = msg || DEFAULT_MAIL_BODY(toCompany, orderNo, toName);
  if (base.includes("이명재 배상")) return base;
  return base + "\n이명재 배상";
}

// ── 이력 행 ───────────────────────────────────────
function OrderRow({ order, onDelete, onCopy }: { order: PurchaseOrder; onDelete: () => void; onCopy: (o: PurchaseOrder) => void }) {
  const [sendEmail, setSendEmail] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [localStatus, setLocalStatus] = useState(order.status);
  useEffect(() => { setLocalStatus(order.status); }, [order.status]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mailBody, setMailBody] = useState(
    ensureSignature(order.message ?? "", order.toCompany, order.orderNo, order.toName)
  );

  useEffect(() => {
    setSendEmail(order.toEmail ?? "");
    setCcInput(order.ccEmails ?? "");
    setMailBody(ensureSignature(order.message ?? "", order.toCompany, order.orderNo, order.toName));
  }, [order.toEmail, order.ccEmails, order.message, order.toCompany, order.orderNo, order.toName]);

  const totalSupply = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const grand = Math.round(totalSupply * 1.1);

  function handleOpenPreview() {
    if (!sendEmail.trim()) { setToast("수신 이메일을 입력해주세요."); setTimeout(() => setToast(null), 3000); return; }
    setPreviewOpen(true);
  }

  async function handleSend() {
    setPreviewOpen(false);
    setSending(true);
    try {
      const res = await fetch(`/api/admin/purchase-orders/${order.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: sendEmail, ccEmails: ccInput, bodyText: mailBody, subject: makeSubject(order.department, order.items) }),
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

  async function handleReceive() {
    const next = localStatus === "RECEIVED" ? "SENT" : "RECEIVED";
    const res = await fetch(`/api/admin/purchase-orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setLocalStatus(next);
      setToast(next === "RECEIVED" ? "입고완료 처리됨" : "입고취소 처리됨");
      setTimeout(() => { setToast(null); onDelete(); }, 1200);
    }
  }

  return (
    <div className="border hair bg-paper p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mono text-[11px] font-bold text-smblue hover:underline text-left"
            >
              {expanded ? "▲" : "▼"} {order.orderNo}
              {!expanded && makeItemSummary(order.items) && (
                <span className="ml-2 text-ink/50 font-normal normal-case tracking-normal">· {makeItemSummary(order.items)}</span>
              )}
            </button>
            <span className={`mono text-[10px] px-1.5 py-0.5 ${
              localStatus === "RECEIVED" ? "bg-gray-100 text-gray-500" :
              localStatus === "SENT" ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-700"
            }`}>
              {localStatus === "RECEIVED" ? "입고완료" : localStatus === "SENT" ? "발송완료" : "초안"}
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

      {/* 아코디언 — 품목 목록 */}
      {expanded && (
        <div className="border-t hair pt-3">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left mono text-[10px] dim border-b hair">
                <th className="pb-1.5 pr-3 font-normal">파트번호</th>
                <th className="pb-1.5 pr-3 font-normal">품명</th>
                <th className="pb-1.5 pr-3 font-normal text-right">수량</th>
                <th className="pb-1.5 font-normal text-right">단가</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-b hair last:border-0">
                  <td className="py-1.5 pr-3 mono text-[11px] dim">{item.partNo || "—"}</td>
                  <td className="py-1.5 pr-3">{item.description || "—"}</td>
                  <td className="py-1.5 pr-3 text-right mono">{item.quantity}</td>
                  <td className="py-1.5 text-right mono">{item.unitPrice.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-2 text-right mono text-[11px] dim">합계 (VAT 포함)</td>
                <td className="pt-2 text-right mono font-bold">
                  {Math.round(order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * 1.1).toLocaleString()}원
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

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
        <button onClick={() => onCopy(order)}
          className="border border-smblue/50 text-smblue px-3 py-1.5 text-[12px] mono hover:bg-smblue/5 transition-colors">
          복사하여 새 발주
        </button>
        <button onClick={handleReceive}
          className={`border px-3 py-1.5 text-[12px] transition-colors ${
            localStatus === "RECEIVED"
              ? "border-gray-300 text-gray-400 hover:bg-gray-50"
              : "border-green-300 text-green-700 hover:bg-green-50"
          }`}>
          {localStatus === "RECEIVED" ? "입고취소" : "입고완료"}
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
          <button onClick={handleOpenPreview} disabled={sending}
            className="bg-smblue text-paper px-5 py-1.5 text-[12px] hover:brightness-110 transition-all disabled:opacity-40">
            미리보기 · 발송
          </button>
        </div>
      )}

      {/* 이메일 미리보기 모달 */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40">
          <div className="bg-paper border hair shadow-xl w-full max-w-lg mx-4 p-6 space-y-4">
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase">— 이메일 미리보기</div>
            <div className="space-y-2 text-[13px]">
              <div className="flex gap-3 border-b hair pb-2">
                <span className="mono text-[10px] dim w-12 shrink-0 mt-0.5">발신</span>
                <span className="mono">info@smartechvacuum.com</span>
              </div>
              <div className="flex gap-3 border-b hair pb-2">
                <span className="mono text-[10px] dim w-12 shrink-0 mt-0.5">수신</span>
                <span className="mono text-smblue">{sendEmail}</span>
              </div>
              {ccInput.trim() && (
                <div className="flex gap-3 border-b hair pb-2">
                  <span className="mono text-[10px] dim w-12 shrink-0 mt-0.5">참조</span>
                  <span className="mono text-[12px]">{ccInput}</span>
                </div>
              )}
              <div className="flex gap-3 border-b hair pb-2">
                <span className="mono text-[10px] dim w-12 shrink-0 mt-0.5">제목</span>
                <span className="font-medium">{makeSubject(order.department, order.items)}</span>
              </div>
              <div className="flex gap-3 border-b hair pb-2">
                <span className="mono text-[10px] dim w-12 shrink-0 mt-0.5">첨부</span>
                <span className="mono text-[12px] text-dim">발주서 PDF (자동 첨부)</span>
              </div>
              <div className="flex gap-3">
                <span className="mono text-[10px] dim w-12 shrink-0 mt-0.5">본문</span>
                <textarea
                  value={mailBody}
                  onChange={(e) => setMailBody(e.target.value)}
                  rows={6}
                  className="flex-1 border hair px-2.5 py-2 text-[12px] leading-relaxed focus:outline-none focus:border-ink resize-y bg-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPreviewOpen(false)}
                className="flex-1 border hair px-4 py-2 text-[13px] hover:bg-ink/5 transition-colors">
                취소
              </button>
              <button onClick={handleSend} disabled={sending}
                className="flex-1 bg-smblue text-paper px-4 py-2 text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50">
                {sending ? "발송 중..." : "확인 · 발송"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 공급업체 그룹 아코디언 ────────────────────────
function SupplierGroup({ dept, orders, onDelete, onCopy }: {
  dept: string;
  orders: PurchaseOrder[];
  onDelete: () => void;
  onCopy: (o: PurchaseOrder) => void;
}) {
  const [open, setOpen] = useState(false);
  const companyName = DEPT_COMPANIES[dept] ?? dept;
  const latestDate = orders.length > 0
    ? orders.reduce((a, b) => new Date(a.orderDate) > new Date(b.orderDate) ? a : b).orderDate
    : null;

  return (
    <div className="border hair">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-paper hover:bg-ink/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-semibold">{open ? "▲" : "▶"} {companyName}</span>
          <span className="mono text-[11px] text-smblue bg-smblue/10 px-2 py-0.5">{orders.length}건</span>
        </div>
        {latestDate && (
          <span className="mono text-[11px] dim">최근: {fmtDate(latestDate)}</span>
        )}
      </button>
      {open && (
        <div className="border-t hair divide-y divide-line bg-ink/[0.01]">
          {orders.length === 0 ? (
            <div className="px-6 py-6 text-center text-[13px] dim">발주서가 없습니다.</div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="p-4">
                <OrderRow order={o} onDelete={onDelete} onCopy={onCopy} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────
export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [copyData, setCopyData] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [yearTab, setYearTab] = useState(String(new Date().getFullYear()));
  const [showReceived, setShowReceived] = useState(false);

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

  // 사용 가능한 연도 목록 (데이터에서 자동 추출)
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    const curYear = String(new Date().getFullYear());
    years.add(curYear);
    orders.forEach((o) => years.add(String(new Date(o.orderDate).getFullYear())));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [orders]);

  // 연도 + 입고완료 필터 적용
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const year = String(new Date(o.orderDate).getFullYear());
      const yearMatch = yearTab === "전체" || year === yearTab;
      const statusMatch = showReceived || o.status !== "RECEIVED";
      return yearMatch && statusMatch;
    });
  }, [orders, yearTab, showReceived]);

  // 부서별 그룹화 (IV → SV → AK 순서 고정)
  const groupedOrders = useMemo(() => {
    const groups: Record<string, PurchaseOrder[]> = { IV: [], SV: [], AK: [] };
    filteredOrders.forEach((o) => {
      if (o.department in groups) groups[o.department].push(o);
    });
    return groups;
  }, [filteredOrders]);

  function handleSaved() {
    setShowForm(false);
    setCopyData(null);
    loadOrders();
  }

  function handleCopy(order: PurchaseOrder) {
    setCopyData(order);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          onClick={() => { setShowForm(!showForm); if (showForm) setCopyData(null); }}
          className="bg-smblue text-paper px-5 py-2.5 text-[13px] font-semibold hover:brightness-110 transition-all shrink-0"
        >
          {showForm ? "✕ 닫기" : "+ 새 발주서"}
        </button>
      </div>

      {/* 작성 폼 */}
      {showForm && (
        <div className="border-2 border-smblue/30 p-5 sm:p-6 bg-paper">
          <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-5">
            {copyData ? `— 복사하여 새 발주서 (원본: ${copyData.orderNo})` : "— 새 발주서 작성"}
          </div>
          <OrderForm onSaved={handleSaved} initialData={copyData} />
        </div>
      )}

      {/* 이력 목록 */}
      <div className="space-y-4">
        {/* 연도 탭 + 완료 건 토글 */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            {availableYears.map((y) => (
              <button
                key={y}
                onClick={() => setYearTab(y)}
                className={`mono text-[12px] px-3 py-1.5 border transition-colors ${
                  yearTab === y ? "bg-ink text-paper border-ink" : "hair hover:bg-ink/5"
                }`}
              >
                {y}
              </button>
            ))}
            <button
              onClick={() => setYearTab("전체")}
              className={`mono text-[12px] px-3 py-1.5 border transition-colors ${
                yearTab === "전체" ? "bg-ink text-paper border-ink" : "hair hover:bg-ink/5"
              }`}
            >
              전체
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="mono text-[11px] dim">{filteredOrders.length}건</span>
            <button
              onClick={() => setShowReceived((v) => !v)}
              className={`mono text-[11px] px-3 py-1.5 border transition-colors ${
                showReceived ? "bg-gray-100 text-gray-600 border-gray-300" : "hair dim hover:bg-ink/5"
              }`}
            >
              {showReceived ? "입고완료 숨기기" : "입고완료 포함"}
            </button>
          </div>
        </div>

        {/* 공급업체별 그룹 */}
        {loading ? (
          <div className="mono text-[11px] dim text-center py-10">— Loading</div>
        ) : filteredOrders.length === 0 ? (
          <div className="border hair bg-paper/50 px-6 py-10 text-center text-[13px] dim">
            {yearTab}년 발행된 발주서가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {(["IV", "SV", "AK"] as const).map((dept) => (
              <SupplierGroup
                key={dept}
                dept={dept}
                orders={groupedOrders[dept]}
                onDelete={loadOrders}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
