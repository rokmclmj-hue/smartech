"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { REPAIR_EXTRA_MARGIN, getRepairBaseMargin } from "@/lib/repairPricing";


type CompanyContact = { id: number; name: string; title: string | null; tel: string | null; mobile: string | null; email: string | null };
type Company = { id: number; companyName: string; contacts?: CompanyContact[] };
type InspectionItem = {
  id: number; sortOrder: number; itemLabel: string;
  unit: string | null; spec: string | null;
  value: string | null; isNA: boolean; pass: boolean | null; remark: string | null;
};
type RepairFile = {
  id: number; fileType: string; fileName: string;
  fileUrl: string; fileSize: number | null; isSelected: boolean;
};
type QuoteItem = { id?: number; name: string; quantity: number; unitPrice: number };
type Job = {
  id: number; jobNo: string; status: string;
  pumpMaker: string; pumpModel: string; serialNo: string | null;
  voltage: string | null; repairReason: string | null;
  subName: string | null; subEmail: string | null;
  company: { id: number; companyName: string; contacts?: CompanyContact[] } | null;
  contactName: string | null; contactEmail: string | null; contactPhone: string | null;
  receivedDate: string; requestedDate: string | null;
  uploadToken: string | null; tokenExpiresAt: string | null; uploadedAt: string | null;
  memo: string | null; createdAt: string;
  repairCost: number | null; repairPartsText: string | null; inspectorName: string | null; quoteRemarks: string | null;
  inspectionItems: InspectionItem[];
  files: RepairFile[];
  quoteItems: QuoteItem[];
};
type KitExtra = { id: number; name: string; price: number };
type MatchedKit = {
  pumpModel: string; basePrice: number;
  parts: { name: string; quantity: string | null }[];
  extraParts: KitExtra[];
};

const STATUS_LABELS: Record<string, string> = {
  RECEIVED:      "접수",
  ITEM_RECEIVED: "물품수령",
  SENT_TO_SUB:   "외주발송",
  WORKING:       "작업중",
  UPLOADED:      "업로드완료",
  QUOTE_SENT:    "견적발송",
  CONFIRMED:     "수리확정",
  DELIVERED:     "납품완료",
};
const STATUS_COLORS: Record<string, string> = {
  RECEIVED:      "bg-blue-50 text-blue-700",
  ITEM_RECEIVED: "bg-sky-50 text-sky-700",
  SENT_TO_SUB:   "bg-yellow-50 text-yellow-700",
  WORKING:       "bg-orange-50 text-orange-700",
  UPLOADED:      "bg-purple-50 text-purple-700",
  QUOTE_SENT:    "bg-teal-50 text-teal-700",
  CONFIRMED:     "bg-green-50 text-green-700",
  DELIVERED:     "bg-ink/10 text-ink/60",
};

function toDateInput(s: string) { return new Date(s).toISOString().slice(0, 10); }
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

type ItemRow = { pumpMaker: string; pumpModel: string; serialNo: string; voltage: string; repairReason: string };
function defaultItem(): ItemRow {
  return { pumpMaker: "EDWARDS", pumpModel: "", serialNo: "", voltage: "220V 1PH", repairReason: "정기" };
}

// ── 수리접수 작성 폼 ──────────────────────────────
function JobForm({ onSaved }: { onSaved: (newJobId: number) => void }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyQ, setCompanyQ] = useState("");
  const [companyResults, setCompanyResults] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [items, setItems] = useState<ItemRow[]>([defaultItem()]);
  const [subName, setSubName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [receivedDate, setReceivedDate] = useState(toDateInput(new Date().toISOString()));
  const [requestedDate, setRequestedDate] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/known-companies").then(r => r.json()).then(data => {
      setCompanies(data.companies ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!companyQ.trim()) { setCompanyResults([]); return; }
    const filtered = companies.filter(c =>
      c.companyName.toLowerCase().includes(companyQ.toLowerCase())
    ).slice(0, 6);
    setCompanyResults(filtered);
  }, [companyQ, companies]);

  function updateItem(idx: number, field: keyof ItemRow, value: string) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }
  function addItem() { setItems(prev => [...prev, defaultItem()]); }
  function removeItem(idx: number) { setItems(prev => prev.filter((_, i) => i !== idx)); }

  async function handleSave() {
    setError("");
    if (items.some(it => !it.pumpModel.trim())) { setError("모든 장비의 모델명을 입력해주세요."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/offline-repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany?.id ?? null,
          items,
          subName, subEmail: subEmail || null, contactName, contactEmail, contactPhone,
          receivedDate, requestedDate: requestedDate || null, memo,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "오류 발생"); return; }
      onSaved(data.id);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink";

  return (
    <div className="space-y-5">
      {/* 거래처 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair">
          <span className="mono text-[10px] dim tracking-[0.12em]">01 / 고객사 (거래처)</span>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="relative max-w-sm">
            <div className="mono text-[10px] dim mb-1">거래처 검색</div>
            <input
              value={selectedCompany ? selectedCompany.companyName : companyQ}
              onChange={(e) => { setCompanyQ(e.target.value); setSelectedCompany(null); }}
              placeholder="회사명 검색..."
              className={inputCls}
            />
            {companyResults.length > 0 && !selectedCompany && (
              <div className="absolute z-10 top-full left-0 right-0 bg-paper border hair shadow-md">
                {companyResults.map(c => (
                  <button key={c.id} onClick={() => { setSelectedCompany(c); setCompanyQ(""); setCompanyResults([]); }}
                    className="w-full text-left px-3 py-2 text-[13px] hover:bg-ink/5 border-b hair last:border-0">
                    {c.companyName}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedCompany && (
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold">{selectedCompany.companyName}</span>
              <button onClick={() => setSelectedCompany(null)} className="text-[11px] dim hover:text-edred">✕ 변경</button>
            </div>
          )}
          {selectedCompany && selectedCompany.contacts && selectedCompany.contacts.length > 0 && (
            <div className="space-y-1">
              <div className="mono text-[10px] dim mb-1">등록된 담당자 (클릭하면 자동 입력)</div>
              <div className="flex flex-wrap gap-2">
                {selectedCompany.contacts.map(ct => (
                  <button
                    key={ct.id}
                    onClick={() => {
                      setContactName(ct.name);
                      setContactEmail(ct.email ?? "");
                      setContactPhone(ct.mobile || ct.tel || "");
                    }}
                    className="border hair px-3 py-1.5 text-[12px] hover:bg-ink/5 text-left"
                  >
                    <span className="font-semibold">{ct.name}</span>
                    {ct.title && <span className="dim ml-1">({ct.title})</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            <div>
              <div className="mono text-[10px] dim mb-1">담당자</div>
              <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="홍길동" className={inputCls} />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">이메일</div>
              <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="contact@company.com"
                className={inputCls + " mono"} />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">전화</div>
              <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="02-0000-0000" className={inputCls} />
            </div>
          </div>
        </div>
      </div>

      {/* 장비 정보 — 다건 입력 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair flex items-center justify-between">
          <span className="mono text-[10px] dim tracking-[0.12em]">02 / 장비 정보 ({items.length}건)</span>
          <button onClick={addItem} className="mono text-[10px] text-smblue hover:underline">+ 항목 추가</button>
        </div>
        <div className="divide-y divide-line">
          {items.map((item, idx) => (
            <div key={idx} className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="mono text-[10px] dim">— 장비 {idx + 1}</span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} className="mono text-[10px] text-edred/60 hover:text-edred">✕ 삭제</button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                <div>
                  <div className="mono text-[10px] dim mb-1">제조사</div>
                  <input value={item.pumpMaker} onChange={e => updateItem(idx, "pumpMaker", e.target.value)}
                    placeholder="EDWARDS" className={inputCls} />
                </div>
                <div>
                  <div className="mono text-[10px] dim mb-1">모델 *</div>
                  <input value={item.pumpModel} onChange={e => updateItem(idx, "pumpModel", e.target.value)}
                    placeholder="XDS35iE" className={inputCls + " mono"} />
                </div>
                <div>
                  <div className="mono text-[10px] dim mb-1">시리얼 번호</div>
                  <input value={item.serialNo} onChange={e => updateItem(idx, "serialNo", e.target.value)}
                    placeholder="230810339" className={inputCls + " mono"} />
                </div>
                <div>
                  <div className="mono text-[10px] dim mb-1">전압</div>
                  <input value={item.voltage} onChange={e => updateItem(idx, "voltage", e.target.value)}
                    placeholder="220V 1PH" className={inputCls} />
                </div>
                <div>
                  <div className="mono text-[10px] dim mb-1">수리사유</div>
                  <select value={item.repairReason} onChange={e => updateItem(idx, "repairReason", e.target.value)}
                    className={inputCls + " bg-paper"}>
                    <option value="정기">정기</option>
                    <option value="고장">고장</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 외주 협력사 + 일정 + 메모 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair">
          <span className="mono text-[10px] dim tracking-[0.12em]">03 / 일정 및 메모</span>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            <div>
              <div className="mono text-[10px] dim mb-1">입고일 *</div>
              <input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)}
                className={inputCls + " mono"} />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">납기 요청일</div>
              <input type="date" value={requestedDate} onChange={e => setRequestedDate(e.target.value)}
                className={inputCls + " mono"} />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">외주 협력사</div>
              <input value={subName} onChange={e => setSubName(e.target.value)} placeholder="협력사명" className={inputCls} />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">협력사 이메일 <span className="text-dim">(빈칸=기본)</span></div>
              <input type="email" value={subEmail} onChange={e => setSubEmail(e.target.value)}
                placeholder="partner@example.com" className={inputCls + " mono"} />
            </div>
          </div>
          <div className="max-w-xl">
            <div className="mono text-[10px] dim mb-1">내부 메모</div>
            <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={2}
              className="w-full border hair px-3 py-2 text-[13px] focus:outline-none focus:border-ink resize-none" />
          </div>
        </div>
      </div>

      {error && <p className="text-[13px] text-edred px-1">{error}</p>}
      <button onClick={handleSave} disabled={saving}
        className="bg-smblue text-paper px-6 py-2.5 text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50">
        {saving ? "저장 중..." : items.length > 1 ? `수리접수 등록 (${items.length}건)` : "수리접수 등록"}
      </button>
    </div>
  );
}

// ── 수리접수 이력 행 ──────────────────────────────
function JobRow({ job, onRefresh, autoOpen, onAutoOpenDone, isSelected, onToggleSelect }: {
  job: Job; onRefresh: () => void; autoOpen?: boolean; onAutoOpenDone?: () => void;
  isSelected?: boolean; onToggleSelect?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoOpen) return;
    setOpen(true);
    setTimeout(() => rowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    onAutoOpenDone?.();
  }, [autoOpen, onAutoOpenDone]);
  const [genToken, setGenToken] = useState(false);
  const [toast, setToast] = useState("");
  const [editItems, setEditItems] = useState<InspectionItem[]>(job.inspectionItems);
  useEffect(() => { setEditItems(job.inspectionItems); }, [job.inspectionItems]);
  const [savingItems, setSavingItems] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [repairCost, setRepairCost] = useState(job.repairCost != null ? String(job.repairCost) : "");
  const [repairPartsText, setRepairPartsText] = useState(job.repairPartsText ?? "");
  const [inspectorName, setInspectorName] = useState(job.inspectorName ?? "");
  const [quoteRemarks, setQuoteRemarks] = useState(job.quoteRemarks ?? "");
  const [savingQuote, setSavingQuote] = useState(false);
  const [sendEmail, setSendEmail] = useState(job.contactEmail ?? "");
  const [sending, setSending] = useState(false);
  const [kitLoaded, setKitLoaded] = useState(false);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>(job.quoteItems ?? []);
  useEffect(() => { setQuoteItems(job.quoteItems ?? []); }, [job.quoteItems]);
  const [matchedKit, setMatchedKit] = useState<MatchedKit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [preQuoteCost, setPreQuoteCost] = useState("");
  const [preQuoteNote, setPreQuoteNote] = useState("");
  const [preQuoteEmail, setPreQuoteEmail] = useState(job.contactEmail ?? "");
  const [sendingPreQuote, setSendingPreQuote] = useState(false);
  const [editSubEmail, setEditSubEmail] = useState(job.subEmail ?? "");
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [editCompanyQ, setEditCompanyQ] = useState("");
  const [editCompanyResults, setEditCompanyResults] = useState<Company[]>([]);
  const [editSelectedCompany, setEditSelectedCompany] = useState<Company | null>(job.company);
  const [editContactName, setEditContactName] = useState(job.contactName ?? "");
  const [editContactEmail, setEditContactEmail] = useState(job.contactEmail ?? "");
  const [editContactPhone, setEditContactPhone] = useState(job.contactPhone ?? "");
  const [savingCompany, setSavingCompany] = useState(false);
  const [adminUploading, setAdminUploading] = useState(false);
  const [adminUploadMsg, setAdminUploadMsg] = useState("");
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const adminZipRef = useRef<HTMLInputElement>(null);
  const adminExcelRef = useRef<HTMLInputElement>(null);

  const uploadUrl = job.uploadToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/repair/offline-upload/${job.uploadToken}`
    : null;

  // job.company가 실제로 바뀔 때만(id 기준) 동기화 — 매 refresh 시 object ref 변경 무시
  useEffect(() => {
    setEditSelectedCompany(job.company);
  }, [job.company?.id]);

  // 패널 열릴 때 거래처 목록 로드
  useEffect(() => {
    if (!open || allCompanies.length > 0) return;
    fetch("/api/admin/known-companies").then(r => r.json()).then(data => {
      setAllCompanies(data.companies ?? []);
    }).catch(() => {});
  }, [open, allCompanies.length]);

  // 거래처 검색 필터링
  useEffect(() => {
    if (!editCompanyQ.trim()) { setEditCompanyResults([]); return; }
    const filtered = allCompanies.filter(c =>
      c.companyName.toLowerCase().includes(editCompanyQ.toLowerCase())
    ).slice(0, 6);
    setEditCompanyResults(filtered);
  }, [editCompanyQ, allCompanies]);

  async function handleSaveCompany() {
    setSavingCompany(true);
    try {
      const res = await fetch(`/api/admin/offline-repairs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: editSelectedCompany?.id ?? null,
          contactName: editContactName || null,
          contactEmail: editContactEmail || null,
          contactPhone: editContactPhone || null,
        }),
      });
      if (res.ok) { showToast("거래처 저장됨"); onRefresh(); }
      else showToast("저장 실패");
    } finally { setSavingCompany(false); }
  }

  function recalcCost(items: QuoteItem[]) {
    setRepairCost(String(items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)));
  }

  function findMatchedKit(kits: MatchedKit[]) {
    const model = job.pumpModel.toLowerCase();
    return kits.find(k =>
      model.includes(k.pumpModel.toLowerCase()) || k.pumpModel.toLowerCase().includes(model)
    ) ?? null;
  }

  // 패널 열릴 때 수리 키트 매칭 (추가파트 버튼용) + 비어있으면 기본수리 자동 채우기
  useEffect(() => {
    if (!open || kitLoaded) return;
    setKitLoaded(true);
    fetch("/api/repair/kits")
      .then(r => r.json())
      .then(({ kits }: { kits: MatchedKit[] }) => {
        const matched = findMatchedKit(kits);
        setMatchedKit(matched);
        if (!matched) return;
        if (!repairPartsText && matched.parts.length) {
          setRepairPartsText(matched.parts.map(p => `${p.name}${p.quantity ? " × " + p.quantity : ""}`).join("\n"));
        }
        if (quoteItems.length === 0 && matched.basePrice > 0) {
          const base: QuoteItem = {
            name: `기본수리 — ${job.pumpModel}`,
            quantity: 1,
            unitPrice: Math.round(matched.basePrice * getRepairBaseMargin(job.pumpModel)),
          };
          setQuoteItems([base]);
          recalcCost([base]);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kitLoaded]);

  // "기본 파트 불러오기" 버튼 — 교체부품 메모 + 기본수리 품목(마진 반영)을 다시 채움
  function loadKitParts() {
    if (!matchedKit) { showToast("해당 모델 기본 파트 없음"); return; }
    if (matchedKit.parts.length) {
      setRepairPartsText(matchedKit.parts.map(p => `${p.name}${p.quantity ? " × " + p.quantity : ""}`).join("\n"));
    }
    if (matchedKit.basePrice > 0) {
      const base: QuoteItem = {
        name: `기본수리 — ${job.pumpModel}`,
        quantity: 1,
        unitPrice: Math.round(matchedKit.basePrice * getRepairBaseMargin(job.pumpModel)),
      };
      setQuoteItems(prev => {
        const next = prev.length > 0 ? [base, ...prev.slice(1)] : [base];
        recalcCost(next);
        return next;
      });
    }
    showToast("기본 파트 불러왔습니다");
  }

  function addExtraFromKit(extra: KitExtra) {
    setQuoteItems(prev => {
      const next = [...prev, { name: extra.name, quantity: 1, unitPrice: Math.round(extra.price * REPAIR_EXTRA_MARGIN) }];
      recalcCost(next);
      return next;
    });
  }

  function addBlankQuoteItem() {
    setQuoteItems(prev => [...prev, { name: "", quantity: 1, unitPrice: 0 }]);
  }

  function updateQuoteItem(idx: number, field: keyof QuoteItem, value: string | number) {
    setQuoteItems(prev => {
      const next = prev.map((it, i) => i === idx ? { ...it, [field]: value } : it);
      recalcCost(next);
      return next;
    });
  }

  function removeQuoteItem(idx: number) {
    setQuoteItems(prev => {
      const next = prev.filter((_, i) => i !== idx);
      recalcCost(next);
      return next;
    });
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`${job.pumpMaker} ${job.pumpModel} (${job.jobNo}) 수리접수를 삭제하시겠습니까?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/offline-repairs/${job.id}`, { method: "DELETE" });
      if (res.ok) onRefresh();
      else showToast("삭제 실패");
    } finally { setDeleting(false); }
  }

  async function handleGenerateToken() {
    setGenToken(true);
    try {
      const res = await fetch(`/api/admin/offline-repairs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_token" }),
      });
      if (res.ok) {
        const data = await res.json();
        onRefresh();
        showToast(data.emailSent ? "링크 생성 + 이메일 발송 완료" : "링크 생성 완료 (이메일 미발송 — 협력사 이메일 미설정)");
      }
    } finally { setGenToken(false); }
  }

  async function handleCopyLink() {
    if (!uploadUrl) return;
    await navigator.clipboard.writeText(uploadUrl);
    showToast("링크 복사됨");
  }

  async function handleSaveItems() {
    setSavingItems(true);
    try {
      const res = await fetch(`/api/admin/offline-repairs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_inspection", items: editItems }),
      });
      if (res.ok) { showToast("검사항목 저장됨"); onRefresh(); }
    } finally { setSavingItems(false); }
  }

  async function handleSaveQuote() {
    setSavingQuote(true);
    try {
      const res = await fetch(`/api/admin/offline-repairs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repairCost: repairCost !== "" ? Math.round(Number(repairCost)) : null,
          repairPartsText: repairPartsText || null,
          inspectorName: inspectorName || null,
          quoteRemarks: quoteRemarks.trim() || null,
          quoteItems: quoteItems.filter(it => it.name.trim()),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { showToast("견적 정보 저장됨"); onRefresh(); }
      else showToast((data as { error?: string }).error ?? "저장 오류");
    } finally { setSavingQuote(false); }
  }

  async function handleSendQuote() {
    if (!sendEmail) { showToast("이메일 주소를 입력해주세요"); return; }
    setSending(true);
    try {
      const res = await fetch(`/api/admin/offline-repairs/${job.id}/send-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sendEmail }),
      });
      const data = await res.json();
      if (res.ok) { showToast("이메일 발송 완료"); onRefresh(); }
      else showToast(data.error ?? "발송 오류");
    } finally { setSending(false); }
  }

  async function handleAdminUpload(file: File, type: "zip" | "excel") {
    setAdminUploading(true);
    setAdminUploadMsg("");
    try {
      if (type === "zip") {
        const safeName = file.name.replace(/[()[\]{} ]/g, "_");
        const blob = await upload(
          `offline-repairs/${job.id}/admin_${Date.now()}_${safeName}`,
          file,
          { access: "private", handleUploadUrl: `/api/admin/offline-repairs/${job.id}/blob-upload` }
        );
        const saveRes = await fetch(`/api/admin/offline-repairs/${job.id}/blob-upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase: "save", url: blob.url, filename: file.name }),
        });
        if (!saveRes.ok) {
          const d = await saveRes.json().catch(() => ({}));
          throw new Error((d as { error?: string }).error ?? "DB 저장 실패");
        }
        setAdminUploadMsg("✓ 파일 업로드 완료");
        onRefresh();
        return;
      }
      // 엑셀 — 서버 경유 (파싱 필요)
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/admin/offline-repairs/${job.id}/upload`, { method: "POST", body: form });
      let data: { error?: string; warning?: string; matched?: number };
      try { data = await res.json(); } catch { throw new Error("서버 응답 오류. 다시 시도해주세요."); }
      if (!res.ok) { setAdminUploadMsg(`오류: ${data.error ?? "알 수 없는 오류"}`); return; }
      if (data.warning) {
        setAdminUploadMsg(`⚠️ ${data.warning}`);
      } else {
        setAdminUploadMsg(`✓ ${data.matched ?? 0}개 항목 자동 입력 완료 — 아래 검사성적서에서 확인하세요`);
      }
      onRefresh();
    } catch (e) {
      setAdminUploadMsg(`업로드 실패: ${e instanceof Error ? e.message : "다시 시도해주세요."}`);
    } finally {
      setAdminUploading(false);
    }
  }

  async function handleDeleteFile(fileId: number, fileType: string) {
    if (!confirm("파일을 삭제하시겠습니까?")) return;
    // Fix #3: Excel 삭제 시 검사성적서 초기화 여부를 사용자가 선택
    let resetInspection = false;
    if (fileType === "EXCEL") {
      resetInspection = confirm("검사성적서 항목값도 함께 초기화할까요?\n(수동 입력 포함 전체 초기화)\n\n확인 = 초기화 / 취소 = 파일만 삭제");
    }
    setDeletingFileId(fileId);
    try {
      const res = await fetch(`/api/admin/offline-repairs/${job.id}/files/${fileId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetInspection }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(`삭제 실패: ${data.error}`); return; }
      showToast(data.clearedInspection ? "파일 삭제 + 검사성적서 초기화 완료" : "파일 삭제 완료");
      setAdminUploadMsg("");
      onRefresh();
    } catch { showToast("삭제 중 오류가 발생했습니다. 다시 시도해주세요."); } // Fix #6: catch 추가
    finally { setDeletingFileId(null); }
  }

  async function handleSendPreQuote() {
    if (!preQuoteEmail) { showToast("수신 이메일을 입력해주세요."); return; }
    setSendingPreQuote(true);
    try {
      const res = await fetch(`/api/admin/offline-repairs/${job.id}/send-pre-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: preQuoteEmail,
          estimatedCost: preQuoteCost !== "" ? Number(preQuoteCost) : null,
          note: preQuoteNote,
        }),
      });
      const data = await res.json();
      if (res.ok) showToast("사전 견적 발송 완료");
      else showToast(data.error ?? "발송 오류");
    } finally {
      setSendingPreQuote(false);
    }
  }

  async function handleStatusChange(status: string) {
    setStatusChanging(true);
    await fetch(`/api/admin/offline-repairs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setStatusChanging(false);
    onRefresh();
  }

  async function handleToggleFile(fileId: number) {
    await fetch(`/api/admin/offline-repairs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_file", fileId }),
    });
    onRefresh();
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function updateEditItem(id: number, field: keyof InspectionItem, value: string | boolean | null) {
    setEditItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  }

  return (
    <div ref={rowRef} className="border hair bg-paper">
      <div className="p-4 flex items-start gap-3">
        <input
          type="checkbox" checked={isSelected ?? false}
          onChange={() => onToggleSelect?.()}
          onClick={e => e.stopPropagation()}
          className="mt-1 w-4 h-4 accent-smblue cursor-pointer shrink-0"
        />
        <div className="flex-1 flex items-start justify-between gap-4 cursor-pointer min-w-0" onClick={() => setOpen(!open)}>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="mono text-[11px] font-bold text-smblue">{job.jobNo}</span>
              <span className={`mono text-[10px] px-1.5 py-0.5 ${STATUS_COLORS[job.status] ?? "bg-ink/5 text-ink/60"}`}>
                {STATUS_LABELS[job.status] ?? job.status}
              </span>
              {job.uploadedAt && <span className="mono text-[10px] text-purple-600">↑ 업로드됨</span>}
            </div>
            <div className="text-[15px] font-semibold">
              {job.company?.companyName ?? <span className="text-ink/30">(거래처 미지정)</span>}
              {" · "}{job.pumpModel}
            </div>
            <div className="text-[12px] dim">
              {job.serialNo && <span className="mono mr-2">S/N {job.serialNo}</span>}
              <span>{fmtDate(job.receivedDate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="mono text-[10px] text-edred/50 hover:text-edred border border-transparent hover:border-edred/30 px-2 py-1 transition-colors disabled:opacity-40"
            >
              {deleting ? "..." : "삭제"}
            </button>
            <span className="text-[18px] dim">{open ? "▲" : "▼"}</span>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t hair px-4 pb-4 space-y-4 pt-3">
          {/* 상태 변경 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="mono text-[10px] dim">상태 변경:</span>
            {Object.entries(STATUS_LABELS).map(([s, label]) => (
              <button key={s} onClick={() => handleStatusChange(s)} disabled={statusChanging || job.status === s}
                className={`px-2 py-1 text-[11px] border transition-colors ${job.status === s ? "bg-ink text-paper border-ink" : "hair hover:bg-ink/5"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* 거래처 수정 */}
          <div className="space-y-2">
            <div className="mono text-[10px] dim tracking-[0.1em]">— 거래처 수정</div>
            <div className="flex items-center gap-2 flex-wrap">
              {editSelectedCompany ? (
                <>
                  <span className="text-[13px] font-semibold">{editSelectedCompany.companyName}</span>
                  <button onClick={() => { setEditSelectedCompany(null); setEditCompanyQ(""); setEditContactName(""); setEditContactEmail(""); setEditContactPhone(""); }}
                    className="text-[11px] dim hover:text-edred">✕ 변경</button>
                </>
              ) : (
                <div className="relative max-w-xs w-full">
                  <input
                    value={editCompanyQ}
                    onChange={e => setEditCompanyQ(e.target.value)}
                    placeholder="거래처 검색..."
                    className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink"
                  />
                  {editCompanyResults.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 bg-paper border hair shadow-md">
                      {editCompanyResults.map(c => (
                        <button key={c.id}
                          onClick={() => { setEditSelectedCompany(c); setEditCompanyQ(""); setEditCompanyResults([]); setEditContactName(""); setEditContactEmail(""); setEditContactPhone(""); }}
                          className="w-full text-left px-3 py-2 text-[13px] hover:bg-ink/5 border-b hair last:border-0">
                          {c.companyName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {editSelectedCompany && editSelectedCompany.contacts && editSelectedCompany.contacts.length > 0 && (
              <div className="space-y-1">
                <div className="mono text-[10px] dim mb-1">등록된 담당자 (클릭하면 자동 입력)</div>
                <div className="flex flex-wrap gap-2">
                  {editSelectedCompany.contacts.map(ct => (
                    <button
                      key={ct.id}
                      onClick={() => {
                        setEditContactName(ct.name);
                        setEditContactEmail(ct.email ?? "");
                        setEditContactPhone(ct.mobile || ct.tel || "");
                      }}
                      className="border hair px-3 py-1.5 text-[12px] hover:bg-ink/5 text-left"
                    >
                      <span className="font-semibold">{ct.name}</span>
                      {ct.title && <span className="dim ml-1">({ct.title})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              <div>
                <div className="mono text-[10px] dim mb-1">담당자</div>
                <input value={editContactName} onChange={e => setEditContactName(e.target.value)} placeholder="홍길동"
                  className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink" />
              </div>
              <div>
                <div className="mono text-[10px] dim mb-1">이메일</div>
                <input type="email" value={editContactEmail} onChange={e => setEditContactEmail(e.target.value)} placeholder="contact@company.com"
                  className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
              </div>
              <div>
                <div className="mono text-[10px] dim mb-1">전화</div>
                <input value={editContactPhone} onChange={e => setEditContactPhone(e.target.value)} placeholder="02-0000-0000"
                  className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink" />
              </div>
            </div>
            <button onClick={handleSaveCompany} disabled={savingCompany}
              className="border hair px-3 py-1.5 text-[11px] hover:bg-ink/5 shrink-0 disabled:opacity-50">
              {savingCompany ? "저장 중..." : "거래처·담당자 저장"}
            </button>
          </div>

          {/* 사전 견적 발송 — 접수·물품수령 단계에서만 표시 */}
          {(job.status === "RECEIVED" || job.status === "ITEM_RECEIVED") && (
            <div className="space-y-2">
              <div className="mono text-[10px] dim tracking-[0.1em]">— 사전 견적 발송 (성적서 없이 예상 금액만)</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="mono text-[10px] dim mb-1">예상 금액 (원, 공급가)</div>
                  <input
                    type="number" value={preQuoteCost}
                    onChange={e => setPreQuoteCost(e.target.value)}
                    placeholder="예: 850000 (미입력 시 추후 안내)"
                    className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink"
                  />
                </div>
              </div>
              <div>
                <div className="mono text-[10px] dim mb-1">안내 사항 (선택)</div>
                <textarea
                  value={preQuoteNote} onChange={e => setPreQuoteNote(e.target.value)}
                  rows={2} placeholder={"예: 정밀 점검 후 최종 확정 / 부품 수급에 따라 변동 가능"}
                  className="w-full border hair px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-ink resize-none"
                />
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="email" value={preQuoteEmail} onChange={e => setPreQuoteEmail(e.target.value)}
                  placeholder="수신 이메일"
                  className="border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink w-60"
                />
                <button onClick={handleSendPreQuote} disabled={sendingPreQuote}
                  className="bg-ink text-paper px-4 py-1.5 text-[12px] font-semibold hover:bg-ink/80 transition-all disabled:opacity-50">
                  {sendingPreQuote ? "발송 중..." : "사전 견적 이메일 발송"}
                </button>
              </div>
              <p className="text-[11px] dim">· 발송해도 상태는 변경되지 않습니다. 정밀 점검 후 최종 견적서를 별도 발송하세요.</p>
            </div>
          )}

          {/* 협력사 링크 */}
          <div className="space-y-2">
            <div className="mono text-[10px] dim tracking-[0.1em]">— 협력사 업로드 링크</div>
            <div className="flex gap-2 items-center max-w-md">
              <input
                type="email"
                value={editSubEmail}
                onChange={e => setEditSubEmail(e.target.value)}
                placeholder={`협력사 이메일 (빈칸=${process.env.NEXT_PUBLIC_DEFAULT_SUB ?? "기본 설정값"})`}
                className="flex-1 border hair px-3 py-1.5 text-[12px] mono focus:outline-none focus:border-ink"
              />
              <button
                onClick={async () => {
                  const res = await fetch(`/api/admin/offline-repairs/${job.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ subEmail: editSubEmail }),
                  });
                  if (res.ok) { showToast("저장됨"); onRefresh(); }
                  else showToast("저장 실패");
                }}
                className="border hair px-3 py-1.5 text-[11px] hover:bg-ink/5 shrink-0">저장</button>
            </div>
            {uploadUrl ? (
              <div className="flex gap-2 flex-wrap items-center">
                <span className="mono text-[11px] text-smblue break-all">{uploadUrl}</span>
                <button onClick={handleCopyLink}
                  className="border hair px-3 py-1 text-[11px] hover:bg-ink/5 shrink-0">링크 복사</button>
                {job.tokenExpiresAt && (
                  <span className="mono text-[10px] dim">만료: {fmtDate(job.tokenExpiresAt)}</span>
                )}
              </div>
            ) : (
              <button onClick={handleGenerateToken} disabled={genToken}
                className="bg-smblue text-paper px-4 py-1.5 text-[12px] hover:brightness-110 transition-all disabled:opacity-50">
                {genToken ? "생성 중..." : "협력사 링크 생성 + 이메일 발송 (14일)"}
              </button>
            )}
          </div>

          {/* 관리자 직접 업로드 */}
          <div className="space-y-2">
            <div className="mono text-[10px] dim tracking-[0.1em]">— 파일 직접 업로드 (관리자)</div>
            <input ref={adminZipRef} type="file" accept=".zip,.7z" className="hidden"
              onChange={async e => {
                const f = e.target.files?.[0]; if (!f) return;
                await handleAdminUpload(f, "zip");
                if (adminZipRef.current) adminZipRef.current.value = "";
              }} />
            <input ref={adminExcelRef} type="file" accept=".xlsx,.xls" className="hidden"
              onChange={async e => {
                const f = e.target.files?.[0]; if (!f) return;
                await handleAdminUpload(f, "excel");
                if (adminExcelRef.current) adminExcelRef.current.value = "";
              }} />
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => adminZipRef.current?.click()} disabled={adminUploading}
                className="border hair px-4 py-1.5 text-[12px] hover:bg-ink/5 transition-colors disabled:opacity-50">
                {adminUploading ? "업로드 중..." : "📎 분해사진 ZIP 업로드"}
              </button>
              <button onClick={() => adminExcelRef.current?.click()} disabled={adminUploading}
                className="border hair px-4 py-1.5 text-[12px] hover:bg-ink/5 transition-colors disabled:opacity-50">
                {adminUploading ? "업로드 중..." : "📊 엑셀 성적서 업로드 (자동 파싱)"}
              </button>
            </div>
            {adminUploadMsg && (
              <p className={`text-[12px] ${adminUploadMsg.startsWith("✓") ? "text-green-700" : "text-edred"}`}>
                {adminUploadMsg}
              </p>
            )}
          </div>

          {/* 업로드된 파일 */}
          {job.files.length > 0 && (
            <div className="space-y-2">
              <div className="mono text-[10px] dim tracking-[0.1em]">— 업로드된 파일 (PDF 삽입 선택)</div>
              <div className="space-y-1">
                {job.files.map(f => (
                  <div key={f.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={f.isSelected} onChange={() => handleToggleFile(f.id)}
                      className="w-4 h-4 accent-smblue" />
                    <a href={f.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[12px] text-smblue hover:underline">{f.fileName}</a>
                    <span className="mono text-[10px] dim">
                      {f.fileType === "EXCEL" ? "엑셀" : f.fileType === "PHOTO_ZIP" ? "ZIP" : f.fileType}
                    </span>
                    {f.fileSize && <span className="mono text-[10px] dim">{(f.fileSize / 1024 / 1024).toFixed(1)}MB</span>}
                    <button
                      onClick={() => handleDeleteFile(f.id, f.fileType)}
                      disabled={deletingFileId === f.id}
                      className="ml-1 text-[11px] text-edred hover:underline disabled:opacity-40"
                    >
                      {deletingFileId === f.id ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[11px] dim">✓ 체크된 파일이 PDF에 삽입됩니다 (최대 5개 권장)</p>
            </div>
          )}

          {/* 검사성적서 */}
          {editItems.length > 0 && (
            <div className="space-y-2">
              <div className="mono text-[10px] dim tracking-[0.1em]">— 검사성적서 확인·수정</div>
              <div className="border hair overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1.5fr_2fr_1fr_1fr] gap-0 bg-ink/5 px-3 py-2">
                  {["항목","단위","기준","측정값","N/A","판정"].map(h => (
                    <div key={h} className="mono text-[9px] dim uppercase tracking-[0.08em]">{h}</div>
                  ))}
                </div>
                {editItems.map(item => (
                  <div key={item.id} className={`grid grid-cols-[2fr_1fr_1.5fr_2fr_1fr_1fr] gap-0 px-3 py-1.5 border-t hair items-center ${item.isNA ? "opacity-40" : ""}`}>
                    <div className="text-[12px]">{item.itemLabel}</div>
                    <div className="mono text-[11px] dim">{item.unit}</div>
                    <div className="mono text-[11px] dim">{item.spec}</div>
                    <input type="text" value={item.value ?? ""} disabled={item.isNA}
                      onChange={e => updateEditItem(item.id, "value", e.target.value)}
                      className="border hair px-2 py-0.5 text-[12px] mono focus:outline-none focus:border-ink disabled:bg-ink/5 mr-1" />
                    <div className="flex justify-center">
                      <input type="checkbox" checked={item.isNA}
                        onChange={e => updateEditItem(item.id, "isNA", e.target.checked)}
                        className="w-3.5 h-3.5 accent-ink" />
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => updateEditItem(item.id, "pass", true)}
                        className={`px-1.5 py-0.5 text-[10px] border ${item.pass === true ? "bg-green-500 text-white border-green-500" : "hair hover:bg-green-50"}`}>P</button>
                      <button onClick={() => updateEditItem(item.id, "pass", false)}
                        className={`px-1.5 py-0.5 text-[10px] border ${item.pass === false ? "bg-edred text-white border-edred" : "hair hover:bg-red-50"}`}>F</button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleSaveItems} disabled={savingItems}
                className="border hair px-4 py-1.5 text-[12px] hover:bg-ink/5 transition-colors disabled:opacity-50">
                {savingItems ? "저장 중..." : "검사항목 저장"}
              </button>
            </div>
          )}

          {/* 수리 견적 입력 */}
          <div className="space-y-2">
            <div className="mono text-[10px] dim tracking-[0.1em]">— 수리견적서 작성</div>

            {/* 품목 (기본수리 + 추가파트) — 대행견적서·거래명세표와 동일한 품목 편집 방식 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="mono text-[10px] dim">품목 (기본수리 + 추가파트 — 저장 시 견적서 PDF에 그대로 반영)</div>
                <button onClick={loadKitParts} className="mono text-[9px] text-smblue hover:underline">
                  기본수리 불러오기 ↺
                </button>
              </div>

              {quoteItems.length > 0 && (
                <div className="border hair overflow-hidden mb-2">
                  <div className="grid grid-cols-[3fr_1fr_1.5fr_1.5fr_auto] gap-0 bg-ink/5 px-3 py-1.5">
                    {["품목명", "수량", "단가", "소계", ""].map(h => (
                      <div key={h} className="mono text-[9px] dim uppercase tracking-[0.06em]">{h}</div>
                    ))}
                  </div>
                  {quoteItems.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-[3fr_1fr_1.5fr_1.5fr_auto] gap-1 px-3 py-1.5 border-t hair items-center">
                      <input value={it.name} onChange={e => updateQuoteItem(idx, "name", e.target.value)}
                        placeholder="품목명"
                        className="border hair px-2 py-1 text-[12px] focus:outline-none focus:border-ink" />
                      <input type="number" min={1} value={it.quantity}
                        onChange={e => updateQuoteItem(idx, "quantity", Math.max(1, Number(e.target.value) || 1))}
                        className="border hair px-2 py-1 text-[12px] text-center mono focus:outline-none focus:border-ink" />
                      <input type="number" min={0} value={it.unitPrice}
                        onChange={e => updateQuoteItem(idx, "unitPrice", Number(e.target.value) || 0)}
                        className="border hair px-2 py-1 text-[12px] text-right mono focus:outline-none focus:border-ink" />
                      <div className="mono text-[12px] text-right pr-1">{(it.quantity * it.unitPrice).toLocaleString()}</div>
                      <button onClick={() => removeQuoteItem(idx)} className="text-[14px] text-dim hover:text-edred transition-colors px-1">×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 flex-wrap items-center">
                <button onClick={addBlankQuoteItem}
                  className="border hair px-3 py-1 text-[11px] mono hover:bg-ink/5 transition-colors">
                  + 품목 직접 추가
                </button>
                {matchedKit?.extraParts.map(extra => (
                  <button key={extra.id} onClick={() => addExtraFromKit(extra)}
                    className="border hair px-3 py-1 text-[11px] hover:bg-ink/5 transition-colors">
                    + {extra.name} ({Math.round(extra.price * REPAIR_EXTRA_MARGIN).toLocaleString()}원)
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="mono text-[10px] dim mb-1">견적금액 (원, 공급가 — 품목 합계 자동계산, 직접 수정 가능)</div>
                <input
                  type="number" value={repairCost}
                  onChange={e => setRepairCost(e.target.value)}
                  placeholder="예: 850000"
                  className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink"
                />
              </div>
              <div>
                <div className="mono text-[10px] dim mb-1">검사자 이름</div>
                <input
                  value={inspectorName} onChange={e => setInspectorName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="mono text-[10px] dim">교체 부품 내역 (자유 입력)</div>
                <button
                  onClick={loadKitParts}
                  className="mono text-[9px] text-smblue hover:underline"
                >
                  기본 파트 불러오기 ↺
                </button>
              </div>
              <textarea
                value={repairPartsText} onChange={e => setRepairPartsText(e.target.value)}
                rows={4} placeholder={"Tip Seal Kit × 1\nShaft Seal × 1"}
                className="w-full border hair px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-ink resize-none"
              />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">견적 특이사항 (REMARKS · PDF에 표시)</div>
              <textarea
                value={quoteRemarks} onChange={e => setQuoteRemarks(e.target.value)}
                rows={2}
                placeholder="수리 견적은 분해 검사 결과에 따라 최종 금액이 변동될 수 있습니다."
                className="w-full border hair px-3 py-2 text-[13px] focus:outline-none focus:border-ink resize-none"
              />
            </div>
            <button onClick={handleSaveQuote} disabled={savingQuote}
              className="border hair px-4 py-1.5 text-[12px] hover:bg-ink/5 transition-colors disabled:opacity-50">
              {savingQuote ? "저장 중..." : "견적 정보 저장"}
            </button>
          </div>

          {/* PDF 저장 + 이메일 발송 */}
          <div className="space-y-3">
            {/* 1단계: 미리보기 */}
            <div className="mono text-[10px] dim tracking-[0.1em]">— 1단계 · PDF 미리보기 및 저장</div>
            <div className="flex gap-2 flex-wrap">
              <a
                href={`/api/admin/offline-repairs/${job.id}/inspection-pdf`}
                target="_blank" rel="noopener noreferrer"
                className="border hair px-4 py-1.5 text-[12px] hover:bg-ink/5 transition-colors"
              >
                검사성적서 미리보기 ↗
              </a>
              <a
                href={`/api/admin/offline-repairs/${job.id}/quote-pdf`}
                target="_blank" rel="noopener noreferrer"
                className="border hair px-4 py-1.5 text-[12px] hover:bg-ink/5 transition-colors"
              >
                수리견적서 미리보기 ↗
              </a>
            </div>
            <p className="text-[11px] dim">· 클릭하면 새 탭에서 PDF를 확인할 수 있습니다. 내용 검토 후 아래에서 발송하세요.</p>

            {/* 2단계: 이메일 발송 */}
            <div className="mono text-[10px] dim tracking-[0.1em] pt-1 border-t hair">— 2단계 · 이메일 발송</div>
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="email" value={sendEmail} onChange={e => setSendEmail(e.target.value)}
                placeholder="수신 이메일"
                className="border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink w-60"
              />
              <button onClick={handleSendQuote} disabled={sending}
                className="bg-smblue text-paper px-4 py-1.5 text-[12px] font-semibold hover:brightness-110 transition-all disabled:opacity-50">
                {sending ? "발송 중..." : "검토 완료 · 이메일 발송 →"}
              </button>
            </div>
            <p className="text-[11px] dim">· 수리견적서 + 검사성적서 PDF 2개가 첨부됩니다. 발송 시 상태가 "견적발송"으로 변경됩니다.</p>
          </div>

          {toast && <p className="mono text-[12px] text-green-600">{toast}</p>}
        </div>
      )}
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────
export default function OfflineRepairsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoOpenId, setAutoOpenId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchEmail, setBatchEmail] = useState("");
  const [batchSending, setBatchSending] = useState(false);
  const [batchToast, setBatchToast] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/offline-repairs");
      if (res.ok) setJobs(await res.json());
    } finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleSaved(newJobId: number) {
    setShowForm(false);
    setAutoOpenId(newJobId);
    load(true);
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleBatchSend() {
    if (!batchEmail.trim()) { setBatchToast("수신 이메일을 입력해주세요."); return; }
    setBatchSending(true);
    try {
      const res = await fetch("/api/admin/offline-repairs/batch-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), email: batchEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setBatchToast(`${data.count}건 발송 완료`);
        setSelectedIds(new Set());
        setBatchEmail("");
        load(true);
      } else {
        setBatchToast(data.error ?? "발송 오류");
      }
    } finally {
      setBatchSending(false);
      setTimeout(() => setBatchToast(""), 3000);
    }
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">— 09 · OFFLINE REPAIRS</div>
          <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink">
            수리 <span className="italic text-smblue">접수</span>
          </h1>
          <p className="mt-3 text-[13px] dim">오프라인 수리접수 관리 · 협력사 업로드 링크 · 검사성적서</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-smblue text-paper px-5 py-2.5 text-[13px] font-semibold hover:brightness-110 transition-all shrink-0">
          {showForm ? "✕ 닫기" : "+ 수리접수 등록"}
        </button>
      </div>

      {showForm && (
        <div className="border-2 border-smblue/30 p-5 sm:p-6 bg-paper">
          <div className="mono text-[10px] dim tracking-[0.12em] uppercase mb-5">— 새 수리접수 등록</div>
          <JobForm onSaved={handleSaved} />
        </div>
      )}

      <div>
        <div className="mono text-[11px] dim tracking-[0.12em] uppercase mb-3">
          — 접수 이력 ({jobs.length}건)
        </div>

        {/* 일괄 발송 바 */}
        {selectedIds.size > 0 && (
          <div className="mb-4 border-2 border-smblue/30 p-4 bg-paper space-y-3">
            <div className="mono text-[10px] dim tracking-[0.1em]">— 선택 {selectedIds.size}건 견적서 일괄 발송</div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="email" value={batchEmail} onChange={e => setBatchEmail(e.target.value)}
                placeholder="수신 이메일"
                className="border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink w-64"
              />
              <button onClick={handleBatchSend} disabled={batchSending || !batchEmail.trim()}
                className="bg-smblue text-paper px-4 py-1.5 text-[12px] font-semibold hover:brightness-110 transition-all disabled:opacity-50">
                {batchSending ? "발송 중..." : `${selectedIds.size}건 일괄 발송`}
              </button>
              <button onClick={() => setSelectedIds(new Set())}
                className="text-[12px] dim hover:text-ink border hair px-3 py-1.5">선택 해제</button>
            </div>
            <p className="text-[11px] dim">· 각 건별 견적서 + 검사성적서 PDF가 한 이메일로 발송됩니다. 발송 후 상태가 "견적발송"으로 변경됩니다.</p>
            {batchToast && <p className="mono text-[12px] text-green-600">{batchToast}</p>}
          </div>
        )}

        {loading ? (
          <div className="mono text-[11px] dim text-center py-10">— Loading</div>
        ) : jobs.length === 0 ? (
          <div className="border hair bg-paper/50 px-6 py-10 text-center text-[13px] dim">
            등록된 수리접수가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(j => (
              <JobRow
                key={j.id}
                job={j}
                onRefresh={() => load(true)}
                autoOpen={autoOpenId === j.id}
                onAutoOpenDone={() => setAutoOpenId(null)}
                isSelected={selectedIds.has(j.id)}
                onToggleSelect={() => toggleSelect(j.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
