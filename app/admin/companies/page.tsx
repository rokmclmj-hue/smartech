"use client";

import { useState, useEffect, useRef } from "react";

type KnownContact = {
  id: number;
  name: string;
  title: string | null;
  tel: string | null;
  mobile: string | null;
  email: string | null;
};

type KnownCompany = {
  id: number;
  companyName: string;
  phone: string | null;
  email: string | null;
  tier: string;
  paymentTerm: string | null;
  businessNo: string | null;
  source: string;
  createdAt: string;
  contacts: KnownContact[];
};

type Stats = Record<string, number>;

const TIER_LABEL: Record<string, string> = {
  DEALER: "딜러",
  KEY_DEALER: "키딜러",
  VIP_DEALER: "VIP딜러",
  OEM: "OEM",
  ENDUSER: "일반",
};

const TIER_COLOR: Record<string, string> = {
  DEALER: "bg-blue-50 text-blue-700 border-blue-200",
  KEY_DEALER: "bg-blue-50 text-blue-700 border-blue-200",
  VIP_DEALER: "bg-blue-50 text-blue-700 border-blue-200",
  OEM: "bg-purple-50 text-purple-700 border-purple-200",
  ENDUSER: "bg-gray-50 text-gray-600 border-gray-200",
};

const EMPTY_FORM = { name: "", title: "", tel: "", mobile: "", email: "" };

const PAY_OPTIONS = [
  { value: "a", label: "납품 전 현금" },
  { value: "b", label: "계약30%/납품전70%" },
  { value: "d", label: "계약30%/익월말일70%" },
  { value: "e", label: "정기결제(익월말일)" },
  { value: "c", label: "직접 입력" },
];

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<KnownCompany[]>([]);
  const [stats, setStats] = useState<Stats>({ DEALER: 0, OEM: 0, ENDUSER: 0, total: 0 });
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // 선택된 거래처 (담당자 패널)
  const [selected, setSelected] = useState<KnownCompany | null>(null);
  const [addingContact, setAddingContact] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/known-companies");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies);
        setStats(data.stats);
        // 선택된 거래처 데이터 갱신
        if (selected) {
          const updated = (data.companies as KnownCompany[]).find((c) => c.id === selected.id);
          if (updated) setSelected(updated);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setImportError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/known-companies/import", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setImportResult(`완료 — 총 ${data.total}개 중 신규 ${data.created}개 추가, ${data.updated}개 업데이트`);
        await load();
      } else {
        setImportError(data.error ?? "오류가 발생했습니다");
      }
    } catch {
      setImportError("서버 오류가 발생했습니다");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDeleteCompany(id: number, name: string) {
    if (!confirm(`"${name}" 항목을 삭제하시겠습니까?`)) return;
    await fetch(`/api/admin/known-companies?id=${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    await load();
  }

  // ── 담당자 추가
  async function saveNewContact() {
    if (!selected || !form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/known-companies/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: selected.id, ...form }),
      });
      if (res.ok) {
        setForm(EMPTY_FORM);
        setAddingContact(false);
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  // ── 담당자 수정
  async function saveEditContact() {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/known-companies/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      if (res.ok) {
        setEditingId(null);
        setForm(EMPTY_FORM);
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  // ── 담당자 삭제
  async function deleteContact(id: number, name: string) {
    if (!confirm(`"${name}" 담당자를 삭제하시겠습니까?`)) return;
    await fetch(`/api/admin/known-companies/contacts?id=${id}`, { method: "DELETE" });
    await load();
  }

  function startEdit(ct: KnownContact) {
    setEditingId(ct.id);
    setAddingContact(false);
    setForm({ name: ct.name, title: ct.title ?? "", tel: ct.tel ?? "", mobile: ct.mobile ?? "", email: ct.email ?? "" });
  }

  function cancelForm() {
    setEditingId(null);
    setAddingContact(false);
    setForm(EMPTY_FORM);
  }

  async function saveTier(tier: string) {
    if (!selected) return;
    const res = await fetch(`/api/admin/known-companies?id=${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    if (res.ok) {
      setSelected((s) => s ? { ...s, tier } : s);
      setCompanies((cs) => cs.map((c) => c.id === selected.id ? { ...c, tier } : c));
    }
  }

  async function savePaymentTerm(term: string | null) {
    if (!selected) return;
    const res = await fetch(`/api/admin/known-companies?id=${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentTerm: term }),
    });
    if (res.ok) {
      setSelected((s) => s ? { ...s, paymentTerm: term } : s);
      setCompanies((cs) => cs.map((c) => c.id === selected.id ? { ...c, paymentTerm: term } : c));
    }
  }

  const [bizNoInput, setBizNoInput] = useState("");
  const [bizNoSaving, setBizNoSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    setBizNoInput(selected?.businessNo ?? "");
  }, [selected?.id]);

  async function saveBusinessNo() {
    if (!selected) return;
    setBizNoSaving(true);
    const digits = bizNoInput.replace(/[^0-9]/g, "");
    const res = await fetch(`/api/admin/known-companies?id=${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessNo: digits || null }),
    });
    if (res.ok) {
      const saved = digits || null;
      setSelected((s) => s ? { ...s, businessNo: saved } : s);
      setCompanies((cs) => cs.map((c) => c.id === selected.id ? { ...c, businessNo: saved } : c));
    }
    setBizNoSaving(false);
  }

  async function saveCompanyName() {
    if (!selected || !nameInput.trim()) return;
    setNameSaving(true);
    const res = await fetch(`/api/admin/known-companies?id=${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName: nameInput.trim() }),
    });
    if (res.ok) {
      const newName = nameInput.trim();
      setSelected((s) => s ? { ...s, companyName: newName } : s);
      setCompanies((cs) => cs.map((c) => c.id === selected.id ? { ...c, companyName: newName } : c));
      setEditingName(false);
    }
    setNameSaving(false);
  }

  const filtered = companies.filter((c) => {
    if (filter !== "ALL" && c.tier !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.companyName.toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        c.contacts.some((ct) => ct.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">— 08 · 거래처 화이트리스트</div>
        <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink">
          거래처 <span className="italic text-edred">자동 분류</span>
        </h1>
        <p className="mt-4 text-[14px] dim leading-[1.6] max-w-2xl">
          등록된 거래처는 가입 시 전화번호·이메일로 자동 인식되어 즉시 해당 등급이 부여됩니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "전체", value: stats.total, color: "text-ink" },
          { label: "딜러", value: stats.DEALER, color: "text-blue-600" },
          { label: "OEM", value: stats.OEM, color: "text-purple-600" },
          { label: "일반", value: stats.ENDUSER, color: "text-gray-500" },
        ].map((s) => (
          <div key={s.label} className="border hair bg-paper px-5 py-4">
            <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-1">{s.label}</div>
            <div className={`display text-[32px] leading-none ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 엑셀 임포트 */}
      <div className="border hair bg-paper px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[14px] font-semibold text-ink mb-1">엑셀 파일 임포트</div>
            <div className="text-[12px] dim">
              딜러 / OEM / 엔드유저 시트 포함 .xlsx 파일을 업로드하세요.
              담당자·직급·직통·모바일·담당자이메일 컬럼이 있으면 자동으로 등록됩니다.
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="bg-ink text-paper px-5 py-2.5 text-[13px] font-medium hover:bg-ink/80 disabled:opacity-50 transition-colors shrink-0"
          >
            {importing ? "임포트 중..." : "📂 엑셀 업로드"}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
        </div>
        {importResult && (
          <div className="mt-3 px-4 py-2.5 bg-green-50 border border-green-200 text-[13px] text-green-700">✓ {importResult}</div>
        )}
        {importError && (
          <div className="mt-3 px-4 py-2.5 bg-red-50 border border-red-200 text-[13px] text-red-700">✗ {importError}</div>
        )}
      </div>

      {/* 필터 + 검색 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["ALL", "DEALER", "OEM", "ENDUSER"] as const).map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 text-[12px] font-medium border transition-colors ${
                filter === t ? "bg-ink text-paper border-ink" : "border-gray-200 text-dim hover:border-ink hover:text-ink"
              }`}>
              {t === "ALL" ? "전체" : TIER_LABEL[t]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="회사명 · 전화번호 · 이메일 · 담당자 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink"
        />
      </div>

      {/* 목록 + 담당자 패널 2열 */}
      <div className={`${selected ? "grid lg:grid-cols-[1fr_380px] gap-4 items-start" : ""}`}>

        {/* 거래처 목록 */}
        {loading ? (
          <div className="text-center py-16 mono text-[11px] dim tracking-[0.12em]">LOADING...</div>
        ) : (
          <div className="border hair overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-ink/[0.03] border-b hair">
                  <tr>
                    {["회사명", "담당자", "등급", "전화번호", "이메일", ""].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left mono text-[10px] dim tracking-[0.1em] uppercase font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y hair">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center dim text-[13px]">
                        {search ? "검색 결과가 없습니다" : "등록된 거래처가 없습니다"}
                      </td>
                    </tr>
                  ) : filtered.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => { setSelected(c); cancelForm(); setEditingName(false); setNameInput(""); }}
                      className={`cursor-pointer transition-colors ${
                        selected?.id === c.id ? "bg-edred/5 border-l-2 border-l-edred" : "hover:bg-ink/[0.02]"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-ink">{c.companyName}</td>
                      <td className="px-4 py-3 dim text-[12px]">
                        {c.contacts.length > 0
                          ? c.contacts.map((ct) => `${ct.name}${ct.title ? ` (${ct.title})` : ""}`).join(", ")
                          : <span className="text-[11px] text-line">미등록</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block border px-2 py-0.5 text-[11px] font-medium rounded-sm ${TIER_COLOR[c.tier] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {TIER_LABEL[c.tier] ?? c.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 mono text-[12px] dim">{c.phone ?? "—"}</td>
                      <td className="px-4 py-3 dim truncate max-w-[180px]">{c.email ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCompany(c.id, c.companyName); }}
                          className="mono text-[10px] text-red-400 hover:text-red-600 tracking-[0.08em] uppercase transition-colors"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-4 py-2.5 border-t hair bg-ink/[0.02] mono text-[10px] dim">
                {filtered.length}개 표시 / 전체 {stats.total}개
              </div>
            )}
          </div>
        )}

        {/* 담당자 패널 */}
        {selected && (
          <div className="border hair bg-paper lg:sticky lg:top-20">
            {/* 패널 헤더 */}
            <div className="flex items-start justify-between px-5 py-4 border-b hair">
              <div className="min-w-0 flex-1">
                <div className="mono text-[9px] tracking-[0.15em] uppercase dim mb-1">담당자 관리</div>
                {editingName ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveCompanyName(); if (e.key === "Escape") setEditingName(false); }}
                      autoFocus
                      className="flex-1 border hair rounded px-2 py-0.5 text-[14px] font-semibold focus:outline-none focus:border-smblue"
                    />
                    <button onClick={saveCompanyName} disabled={nameSaving || !nameInput.trim()} className="px-2 py-0.5 bg-smblue text-white text-[11px] font-semibold rounded hover:brightness-110 disabled:opacity-50">
                      {nameSaving ? "…" : "저장"}
                    </button>
                    <button onClick={() => setEditingName(false)} className="px-2 py-0.5 text-[11px] dim hover:text-edred">취소</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group">
                    <div className="text-[16px] font-semibold text-ink truncate">{selected.companyName}</div>
                    <button
                      onClick={() => { setNameInput(selected.companyName); setEditingName(true); }}
                      className="text-[11px] dim hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      title="상호명 수정"
                    >✏️</button>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <select
                    value={selected.tier}
                    onChange={(e) => saveTier(e.target.value)}
                    className={`border px-1.5 py-0.5 text-[10px] rounded-sm cursor-pointer focus:outline-none ${TIER_COLOR[selected.tier] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
                  >
                    <option value="ENDUSER">일반</option>
                    <option value="DEALER">딜러</option>
                    <option value="KEY_DEALER">키딜러</option>
                    <option value="VIP_DEALER">VIP딜러</option>
                    <option value="OEM">OEM</option>
                  </select>
                  {selected.phone && <span className="mono text-[11px] dim">{selected.phone}</span>}
                </div>
                <div className="mt-2.5">
                  <div className="mono text-[9px] tracking-[0.12em] uppercase dim mb-1.5">결제조건</div>
                  <div className="flex flex-wrap gap-1">
                    {PAY_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => savePaymentTerm(selected.paymentTerm === o.value ? null : o.value)}
                        className={`mono text-[9px] tracking-[0.04em] border px-2 py-0.5 rounded transition-colors ${
                          selected.paymentTerm === o.value
                            ? "bg-smblue text-white border-smblue"
                            : "hair dim hover:text-ink"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-2.5">
                  <div className="mono text-[9px] tracking-[0.12em] uppercase dim mb-1.5">사업자등록번호</div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={bizNoInput}
                      onChange={(e) => setBizNoInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveBusinessNo()}
                      placeholder="숫자 10자리"
                      maxLength={12}
                      className="flex-1 border hair rounded px-2.5 py-1 text-[12px] mono focus:outline-none focus:border-smblue"
                    />
                    <button
                      onClick={saveBusinessNo}
                      disabled={bizNoSaving}
                      className="px-3 py-1 bg-smblue text-white text-[11px] font-semibold rounded hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                      {bizNoSaving ? "…" : "저장"}
                    </button>
                  </div>
                  {selected.businessNo && (
                    <div className="mt-1 mono text-[10px] text-smblue">✓ {selected.businessNo} 등록됨</div>
                  )}
                </div>
              </div>
              <button onClick={() => { setSelected(null); cancelForm(); setEditingName(false); setNameInput(""); }} className="dim hover:text-edred text-[18px] ml-3 shrink-0">✕</button>
            </div>

            {/* 담당자 목록 */}
            <div className="divide-y hair">
              {selected.contacts.length === 0 && !addingContact && (
                <div className="px-5 py-6 text-center text-[13px] dim">담당자가 없습니다</div>
              )}

              {selected.contacts.map((ct) => (
                <div key={ct.id} className="px-5 py-3">
                  {editingId === ct.id ? (
                    // 수정 폼
                    <ContactForm
                      form={form}
                      setForm={setForm}
                      onSave={saveEditContact}
                      onCancel={cancelForm}
                      saving={saving}
                      label="수정 저장"
                    />
                  ) : (
                    // 담당자 정보 표시
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-ink">{ct.name}</span>
                          {ct.title && <span className="mono text-[10px] dim">{ct.title}</span>}
                        </div>
                        <div className="text-[12px] dim mt-0.5 space-y-0.5">
                          {ct.mobile && <div>📱 {ct.mobile}</div>}
                          {ct.tel && <div>☎ {ct.tel}</div>}
                          {ct.email && <div>✉ {ct.email}</div>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEdit(ct)} className="mono text-[10px] dim hover:text-edred transition-colors">수정</button>
                        <button onClick={() => deleteContact(ct.id, ct.name)} className="mono text-[10px] text-red-400 hover:text-red-600 transition-colors">삭제</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* 추가 폼 */}
              {addingContact && (
                <div className="px-5 py-3">
                  <ContactForm
                    form={form}
                    setForm={setForm}
                    onSave={saveNewContact}
                    onCancel={cancelForm}
                    saving={saving}
                    label="추가"
                  />
                </div>
              )}
            </div>

            {/* 담당자 추가 버튼 */}
            {!addingContact && editingId === null && (
              <button
                onClick={() => { setAddingContact(true); setForm(EMPTY_FORM); }}
                className="w-full px-5 py-3 text-[13px] dim hover:text-edred hover:bg-edred/5 border-t hair text-left transition-colors"
              >
                + 담당자 추가
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 담당자 입력 폼 컴포넌트 ─────────────────────────────────────
function ContactForm({
  form, setForm, onSave, onCancel, saving, label,
}: {
  form: { name: string; title: string; tel: string; mobile: string; email: string };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mono text-[9px] tracking-[0.12em] dim uppercase block mb-1">이름 *</label>
          <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="홍길동"
            className="w-full border hair rounded px-2.5 py-1.5 text-[13px] focus:outline-none focus:border-edred" />
        </div>
        <div>
          <label className="mono text-[9px] tracking-[0.12em] dim uppercase block mb-1">직급</label>
          <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="부장"
            className="w-full border hair rounded px-2.5 py-1.5 text-[13px] focus:outline-none focus:border-edred" />
        </div>
        <div>
          <label className="mono text-[9px] tracking-[0.12em] dim uppercase block mb-1">핸드폰</label>
          <input type="tel" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
            placeholder="010-0000-0000"
            className="w-full border hair rounded px-2.5 py-1.5 text-[13px] focus:outline-none focus:border-edred" />
        </div>
        <div>
          <label className="mono text-[9px] tracking-[0.12em] dim uppercase block mb-1">직통</label>
          <input type="tel" value={form.tel} onChange={(e) => setForm((f) => ({ ...f, tel: e.target.value }))}
            placeholder="031-000-0000"
            className="w-full border hair rounded px-2.5 py-1.5 text-[13px] focus:outline-none focus:border-edred" />
        </div>
      </div>
      <div>
        <label className="mono text-[9px] tracking-[0.12em] dim uppercase block mb-1">이메일</label>
        <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="hong@company.com"
          className="w-full border hair rounded px-2.5 py-1.5 text-[13px] focus:outline-none focus:border-edred" />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onSave} disabled={saving || !form.name.trim()}
          className="flex-1 bg-edred text-white py-2 text-[12px] font-semibold rounded hover:brightness-110 disabled:opacity-40 transition-all">
          {saving ? "저장 중…" : label}
        </button>
        <button onClick={onCancel} className="px-4 py-2 border hair text-[12px] dim rounded hover:text-ink transition-colors">
          취소
        </button>
      </div>
    </div>
  );
}
