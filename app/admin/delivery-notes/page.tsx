"use client";

import { useEffect, useState, useCallback } from "react";

// ── 타입 ──────────────────────────────────────────
type NoteItem = {
  id?: number;
  partNo: string;
  description: string;
  quantity: number;
  unitPrice: number;
  productId?: number | null;
  sortOrder?: number;
};

type DeliveryNote = {
  id: number;
  noteNo: string;
  status: string;
  toCompany: string;
  toName: string | null;
  toEmail: string | null;
  toPhone: string | null;
  toBizNo: string | null;
  memo: string | null;
  includeBankInfo: boolean;
  totalSupply: number;
  totalVat: number;
  totalAmount: number;
  sentAt: string | null;
  sentTo: string | null;
  createdAt: string;
  items: NoteItem[];
};

type SearchResult = {
  id: number;
  source: "user" | "company" | "known";
  company: string;
  name: string;
  phone: string;
  email: string;
  bizNo?: string | null;
  contacts: { name: string; title: string | null; mobile: string | null; email: string | null }[];
};

function formatBizNo(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.startsWith("02")) {
    // 서울 지역번호 02-xxxx-xxxx (최대 10자리)
    const d = digits.slice(0, 10);
    if (d.length <= 2) return d;
    if (d.length <= 6) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  }
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR") + " 원";
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

const BLANK_ITEM: NoteItem = { partNo: "", description: "", quantity: 1, unitPrice: 0 };

// ── 거래명세표 작성 폼 ─────────────────────────────
function NoteForm({ onSaved }: { onSaved: () => void }) {
  // 고객 검색
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDirect, setShowDirect] = useState(false);

  // 수신자 정보
  const [toCompany, setToCompany] = useState("");
  const [toName, setToName] = useState("");
  const [toTitle, setToTitle] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [toPhone, setToPhone] = useState("");
  const [toBizNo, setToBizNo] = useState("");

  // 품목
  const [items, setItems] = useState<NoteItem[]>([{ ...BLANK_ITEM }]);

  // 기타
  const [memo, setMemo] = useState("");
  const [includeBankInfo, setIncludeBankInfo] = useState(true);

  // 상태
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 상품 검색
  const [productQ, setProductQ] = useState("");
  const [productResults, setProductResults] = useState<{ id: number; partNo: string; description: string; costPrice: number }[]>([]);
  const [focusedItemIdx, setFocusedItemIdx] = useState<number | null>(null);

  // 거래처 검색
  useEffect(() => {
    if (searchQ.length < 1) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/customers/unified-search?q=${encodeURIComponent(searchQ)}`);
      if (res.ok) setSearchResults((await res.json()).items ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [searchQ]);

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

  function selectCustomer(r: SearchResult) {
    setToCompany(r.company);
    setToName(r.contacts[0]?.name ?? r.name);
    setToTitle(r.contacts[0]?.title ?? "");
    setToEmail(r.contacts[0]?.email ?? r.email);
    setToPhone(formatPhone(r.contacts[0]?.mobile ?? r.phone));
    setToBizNo(r.bizNo ? formatBizNo(r.bizNo) : "");
    setShowDirect(true);
    setSearchQ("");
    setSearchResults([]);
  }

  function addItem() {
    setItems((prev) => [...prev, { ...BLANK_ITEM }]);
  }

  function addShipping() {
    setItems((prev) => [...prev, { partNo: "SHIPPING", description: "택배비", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof NoteItem, value: string | number) {
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
    if (!toCompany.trim()) { setError("업체명을 입력해주세요."); return; }
    if (items.length === 0 || items.every(i => !i.partNo.trim())) { setError("품목을 1개 이상 입력해주세요."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/delivery-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toCompany, toName, toTitle, toEmail, toPhone, toBizNo,
          memo, includeBankInfo,
          items: items.map((it, idx) => ({ ...it, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice), sortOrder: idx })),
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
      {/* 01 수신자 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair flex items-center gap-2">
          <span className="mono text-[10px] dim tracking-[0.12em]">01 / 수신자</span>
        </div>
        <div className="px-5 py-4 space-y-3">
          {/* 통합 검색 */}
          <div className="relative max-w-lg">
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="회원·거래처 통합 검색 — 상호·담당자·연락처"
              className="w-full border hair px-3 py-2 text-[13px] focus:outline-none focus:border-ink"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 bg-paper border hair shadow-lg max-h-56 overflow-y-auto">
                {searchResults.map((r) => (
                  <button key={`${r.source}-${r.id}`} onClick={() => selectCustomer(r)}
                    className="w-full text-left px-4 py-2.5 hover:bg-ink/5 border-b hair last:border-0">
                    <div className="text-[13px] font-medium">{r.company}</div>
                    <div className="text-[11px] dim">{r.name} · {r.phone}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 직접 입력 토글 */}
          <button onClick={() => setShowDirect(!showDirect)}
            className="text-[12px] text-edred hover:underline">
            ▼ 목록에 없으면 직접 입력
          </button>

          {(showDirect || toCompany) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl pt-1">
              <div>
                <div className="mono text-[10px] dim mb-1">업체명 *</div>
                <input value={toCompany} onChange={(e) => setToCompany(e.target.value)}
                  placeholder="(주)다윈바이오" className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink" />
              </div>
              <div className="grid grid-cols-[2fr_1fr] gap-2">
                <div>
                  <div className="mono text-[10px] dim mb-1">담당자</div>
                  <input value={toName} onChange={(e) => setToName(e.target.value)}
                    placeholder="홍길동" className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink" />
                </div>
                <div>
                  <div className="mono text-[10px] dim mb-1">직함</div>
                  <input value={toTitle} onChange={(e) => setToTitle(e.target.value)}
                    placeholder="대리" className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink" />
                </div>
              </div>
              <div>
                <div className="mono text-[10px] dim mb-1">이메일</div>
                <input type="email" value={toEmail} onChange={(e) => setToEmail(e.target.value)}
                  placeholder="contact@example.com" className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
              </div>
              <div>
                <div className="mono text-[10px] dim mb-1">전화번호</div>
                <input value={toPhone} onChange={(e) => setToPhone(formatPhone(e.target.value))}
                  placeholder="010-0000-0000" className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
              </div>
              <div>
                <div className="mono text-[10px] dim mb-1">사업자번호</div>
                <input value={toBizNo} onChange={(e) => setToBizNo(formatBizNo(e.target.value))}
                  placeholder="000-00-00000" className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 02 품목 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair flex items-center justify-between">
          <span className="mono text-[10px] dim tracking-[0.12em]">02 / 품목</span>
          <div className="flex gap-2">
            <button onClick={addShipping}
              className="border hair px-3 py-1 text-[11px] mono hover:bg-ink/5 transition-colors">
              + 택배비
            </button>
            <button onClick={addItem}
              className="bg-ink text-paper px-3 py-1 text-[11px] mono hover:bg-ink/90 transition-colors">
              + 품목 추가
            </button>
          </div>
        </div>
        <div className="px-5 py-4 space-y-2">
          {/* 상품 검색 드롭다운 */}
          {focusedItemIdx !== null && (
            <div className="relative max-w-md mb-2">
              <input
                autoFocus
                value={productQ}
                onChange={(e) => setProductQ(e.target.value)}
                placeholder="상품 검색 (파트번호·품목명)"
                className="w-full border border-edred px-3 py-1.5 text-[13px] focus:outline-none"
              />
              {productResults.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 bg-paper border hair shadow-lg max-h-48 overflow-y-auto">
                  {productResults.map((p) => (
                    <button key={p.id} onClick={() => selectProduct(focusedItemIdx, p)}
                      className="w-full text-left px-3 py-2 hover:bg-ink/5 border-b hair last:border-0">
                      <span className="mono text-[11px] text-edred mr-2">{p.partNo}</span>
                      <span className="text-[12px]">{p.description}</span>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => { setFocusedItemIdx(null); setProductQ(""); setProductResults([]); }}
                className="mt-1 text-[11px] dim hover:text-ink">닫기</button>
            </div>
          )}

          <div className="grid grid-cols-[2fr_3fr_1fr_2fr_auto] gap-2 text-[10px] mono dim tracking-[0.06em] uppercase px-1">
            <div>파트번호</div><div>품목명</div><div>수량</div>
            <div>단가 (원) <span className="text-edred2 normal-case not-uppercase">← 원가 기본값</span></div>
            <div></div>
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-[2fr_3fr_1fr_2fr_auto] gap-2 items-center">
              <input value={item.partNo} onChange={(e) => updateItem(idx, "partNo", e.target.value)}
                onFocus={() => setFocusedItemIdx(idx)}
                placeholder="파트번호"
                className="border hair px-2 py-1.5 text-[12px] mono focus:outline-none focus:border-edred" />
              <input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)}
                placeholder="품목명"
                className="border hair px-2 py-1.5 text-[12px] focus:outline-none focus:border-ink" />
              <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                className="border hair px-2 py-1.5 text-[12px] text-center focus:outline-none focus:border-ink" />
              <input type="number" min={0} value={item.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                className="border hair px-2 py-1.5 text-[12px] text-right mono focus:outline-none focus:border-ink" />
              <button onClick={() => removeItem(idx)} className="text-[14px] text-dim hover:text-edred transition-colors px-1">×</button>
            </div>
          ))}

          {/* 합계 */}
          <div className="border-t hair mt-3 pt-3 flex justify-end">
            <div className="text-right space-y-1">
              <div className="text-[12px] dim">공급가액: <span className="mono text-ink">{totalSupply.toLocaleString()}</span></div>
              <div className="text-[12px] dim">부가세(10%): <span className="mono text-ink">{totalVat.toLocaleString()}</span></div>
              <div className="text-[14px] font-bold">합계: <span className="mono text-edred">{totalAmount.toLocaleString()} 원</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 03 기타 옵션 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair">
          <span className="mono text-[10px] dim tracking-[0.12em]">03 / 기타</span>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <div className="mono text-[10px] dim mb-1">내부 메모 <span className="normal-case">(PDF 미출력 — 납품처·참고사항)</span></div>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2}
              placeholder="예: 식약처 3월2기 입찰건 납품 / 택배비 착불 포함"
              className="w-full border hair px-3 py-2 text-[13px] focus:outline-none focus:border-ink resize-none max-w-2xl" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input type="checkbox" checked={includeBankInfo} onChange={(e) => setIncludeBankInfo(e.target.checked)}
              className="w-4 h-4 accent-edred cursor-pointer" />
            <span className="text-[13px] text-ink group-hover:text-edred transition-colors">
              통장사본 포함 <span className="text-dim text-[11px]">— PDF 2페이지에 신한은행 계좌 자동 첨부</span>
            </span>
          </label>
        </div>
      </div>

      {error && <div className="text-[13px] text-red-600 px-1">{error}</div>}

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving}
          className="bg-edred text-paper px-6 py-2.5 text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50">
          {saving ? "저장 중..." : "거래명세표 저장"}
        </button>
      </div>
    </div>
  );
}

// ── 이력 행 ───────────────────────────────────────
function NoteRow({ note, onDelete }: { note: DeliveryNote; onDelete: () => void }) {
  const [sendEmail, setSendEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSend, setShowSend] = useState(false);

  useEffect(() => { setSendEmail(note.toEmail ?? ""); }, [note.toEmail]);

  async function handleSend() {
    if (!sendEmail.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/delivery-notes/${note.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: sendEmail }),
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
    if (!confirm(`"${note.toCompany}" 거래명세표(${note.noteNo})를 삭제할까요?`)) return;
    setDeleting(true);
    await fetch(`/api/admin/delivery-notes/${note.id}`, { method: "DELETE" });
    onDelete();
  }

  return (
    <div className="border hair bg-paper p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="mono text-[11px] font-bold text-edred">{note.noteNo}</span>
            <span className={`mono text-[10px] px-1.5 py-0.5 ${note.status === "SENT" ? "bg-green-100 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
              {note.status === "SENT" ? "발송완료" : "초안"}
            </span>
            <span className="mono text-[10px] dim">{fmtDate(note.createdAt)}</span>
          </div>
          <div className="text-[14px] font-semibold">{note.toCompany}</div>
          <div className="text-[12px] dim">
            {note.toName && <span className="mr-2">{note.toName}</span>}
            {note.toEmail && <span className="mono mr-2">{note.toEmail}</span>}
          </div>
          {note.memo && (
            <div className="text-[11px] dim italic border-l-2 border-line pl-2 mt-1">{note.memo}</div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-[14px] font-bold mono">{note.totalAmount.toLocaleString()} 원</div>
          <div className="text-[11px] dim">{note.items.length}개 품목</div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2 flex-wrap">
        <a href={`/api/admin/delivery-notes/${note.id}/pdf?preview=1`} target="_blank" rel="noopener noreferrer"
          className="border hair px-3 py-1.5 text-[12px] mono hover:bg-ink/5 transition-colors">
          PDF 미리보기
        </a>
        <a href={`/api/admin/delivery-notes/${note.id}/pdf`}
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
        <div className="flex gap-2 items-center max-w-lg border-t hair pt-3">
          <input type="email" value={sendEmail} onChange={(e) => setSendEmail(e.target.value)}
            placeholder="수신 이메일"
            className="flex-1 border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
          <button onClick={handleSend} disabled={sending || !sendEmail.trim()}
            className="bg-edred text-paper px-4 py-1.5 text-[12px] hover:brightness-110 transition-all disabled:opacity-40 shrink-0">
            {sending ? "발송 중..." : "발송"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────
export default function DeliveryNotesPage() {
  const [notes, setNotes] = useState<DeliveryNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/delivery-notes");
      if (res.ok) setNotes(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  function handleSaved() {
    setShowForm(false);
    loadNotes();
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1200px] mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">— 07 · DELIVERY NOTES</div>
          <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink">
            거래 <span className="italic text-edred">명세표</span>
          </h1>
          <p className="mt-3 text-[13px] dim">이메일 발주 접수 후 거래명세표를 직접 작성·발송합니다.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-edred text-paper px-5 py-2.5 text-[13px] font-semibold hover:brightness-110 transition-all shrink-0"
        >
          {showForm ? "✕ 닫기" : "+ 새 거래명세표"}
        </button>
      </div>

      {/* 작성 폼 */}
      {showForm && (
        <div className="border-2 border-edred/30 p-5 sm:p-6 bg-paper">
          <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-5">— 새 거래명세표 작성</div>
          <NoteForm onSaved={handleSaved} />
        </div>
      )}

      {/* 이력 목록 */}
      <div>
        <div className="mono text-[11px] dim tracking-[0.12em] uppercase mb-3">
          — 발행 이력 ({notes.length}건)
        </div>
        {loading ? (
          <div className="mono text-[11px] dim text-center py-10">— Loading</div>
        ) : notes.length === 0 ? (
          <div className="border hair bg-paper/50 px-6 py-10 text-center text-[13px] dim">
            발행된 거래명세표가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <NoteRow key={n.id} note={n} onDelete={loadNotes} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
