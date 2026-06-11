"use client";
import { useEffect, useState, useCallback } from "react";

type Company = { id: number; companyName: string };
type InspectionItem = {
  id: number; sortOrder: number; itemLabel: string;
  unit: string | null; spec: string | null;
  value: string | null; isNA: boolean; pass: boolean | null; remark: string | null;
};
type RepairFile = {
  id: number; fileType: string; fileName: string;
  fileUrl: string; fileSize: number | null; isSelected: boolean;
};
type Job = {
  id: number; jobNo: string; status: string;
  pumpMaker: string; pumpModel: string; serialNo: string | null;
  voltage: string | null; repairReason: string | null;
  subName: string | null;
  company: { id: number; companyName: string } | null;
  contactName: string | null; contactEmail: string | null; contactPhone: string | null;
  receivedDate: string; requestedDate: string | null;
  uploadToken: string | null; tokenExpiresAt: string | null; uploadedAt: string | null;
  memo: string | null; createdAt: string;
  inspectionItems: InspectionItem[];
  files: RepairFile[];
};

const STATUS_LABELS: Record<string, string> = {
  RECEIVED:   "접수",
  SENT_TO_SUB:"외주발송",
  WORKING:    "작업중",
  UPLOADED:   "업로드완료",
  QUOTE_SENT: "견적발송",
  CONFIRMED:  "수리확정",
  DELIVERED:  "납품완료",
};
const STATUS_COLORS: Record<string, string> = {
  RECEIVED:   "bg-blue-50 text-blue-700",
  SENT_TO_SUB:"bg-yellow-50 text-yellow-700",
  WORKING:    "bg-orange-50 text-orange-700",
  UPLOADED:   "bg-purple-50 text-purple-700",
  QUOTE_SENT: "bg-teal-50 text-teal-700",
  CONFIRMED:  "bg-green-50 text-green-700",
  DELIVERED:  "bg-ink/10 text-ink/60",
};

function toDateInput(s: string) { return new Date(s).toISOString().slice(0, 10); }
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// ── 수리접수 작성 폼 ──────────────────────────────
function JobForm({ onSaved }: { onSaved: () => void }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyQ, setCompanyQ] = useState("");
  const [companyResults, setCompanyResults] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [pumpMaker, setPumpMaker] = useState("EDWARDS");
  const [pumpModel, setPumpModel] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [voltage, setVoltage] = useState("220V 1PH");
  const [repairReason, setRepairReason] = useState("정기");
  const [subName, setSubName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [receivedDate, setReceivedDate] = useState(toDateInput(new Date().toISOString()));
  const [requestedDate, setRequestedDate] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/companies?limit=200").then(r => r.json()).then(data => {
      setCompanies(data.items ?? data ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!companyQ.trim()) { setCompanyResults([]); return; }
    const filtered = companies.filter(c =>
      c.companyName.toLowerCase().includes(companyQ.toLowerCase())
    ).slice(0, 6);
    setCompanyResults(filtered);
  }, [companyQ, companies]);

  async function handleSave() {
    setError("");
    if (!pumpModel.trim()) { setError("펌프 모델을 입력해주세요."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/offline-repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany?.id ?? null,
          pumpMaker, pumpModel, serialNo, voltage, repairReason,
          subName, contactName, contactEmail, contactPhone,
          receivedDate, requestedDate: requestedDate || null, memo,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "오류 발생"); return; }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

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
              className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            <div>
              <div className="mono text-[10px] dim mb-1">담당자</div>
              <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="홍길동"
                className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink" />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">이메일</div>
              <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="contact@company.com"
                className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">전화</div>
              <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="02-0000-0000"
                className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink" />
            </div>
          </div>
        </div>
      </div>

      {/* 장비 정보 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair">
          <span className="mono text-[10px] dim tracking-[0.12em]">02 / 장비 정보</span>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            <div>
              <div className="mono text-[10px] dim mb-1">제조사</div>
              <input value={pumpMaker} onChange={e => setPumpMaker(e.target.value)} placeholder="EDWARDS"
                className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink" />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">모델 *</div>
              <input value={pumpModel} onChange={e => setPumpModel(e.target.value)} placeholder="XDS35iE"
                className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">시리얼 번호</div>
              <input value={serialNo} onChange={e => setSerialNo(e.target.value)} placeholder="230810339"
                className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">전압</div>
              <input value={voltage} onChange={e => setVoltage(e.target.value)} placeholder="220V 1PH"
                className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink" />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">수리사유</div>
              <select value={repairReason} onChange={e => setRepairReason(e.target.value)}
                className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink bg-paper">
                <option value="정기">정기</option>
                <option value="고장">고장</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">외주 협력사</div>
              <input value={subName} onChange={e => setSubName(e.target.value)} placeholder="협력사명"
                className="w-full border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink" />
            </div>
          </div>
        </div>
      </div>

      {/* 일정 + 메모 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair">
          <span className="mono text-[10px] dim tracking-[0.12em]">03 / 일정 및 메모</span>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            <div>
              <div className="mono text-[10px] dim mb-1">입고일 *</div>
              <input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)}
                className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
            </div>
            <div>
              <div className="mono text-[10px] dim mb-1">납기 요청일</div>
              <input type="date" value={requestedDate} onChange={e => setRequestedDate(e.target.value)}
                className="w-full border hair px-3 py-1.5 text-[13px] mono focus:outline-none focus:border-ink" />
            </div>
          </div>
          <div className="mt-3 max-w-xl">
            <div className="mono text-[10px] dim mb-1">내부 메모</div>
            <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={2}
              className="w-full border hair px-3 py-2 text-[13px] focus:outline-none focus:border-ink resize-none" />
          </div>
        </div>
      </div>

      {error && <p className="text-[13px] text-edred px-1">{error}</p>}
      <button onClick={handleSave} disabled={saving}
        className="bg-smblue text-paper px-6 py-2.5 text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50">
        {saving ? "저장 중..." : "수리접수 등록"}
      </button>
    </div>
  );
}

// ── 수리접수 이력 행 ──────────────────────────────
function JobRow({ job, onRefresh }: { job: Job; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [genToken, setGenToken] = useState(false);
  const [toast, setToast] = useState("");
  const [editItems, setEditItems] = useState<InspectionItem[]>(job.inspectionItems);
  const [savingItems, setSavingItems] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  const uploadUrl = job.uploadToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/repair/offline-upload/${job.uploadToken}`
    : null;

  async function handleGenerateToken() {
    setGenToken(true);
    try {
      const res = await fetch(`/api/admin/offline-repairs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_token" }),
      });
      if (res.ok) { onRefresh(); showToast("링크 생성 완료"); }
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
    <div className="border hair bg-paper">
      <div className="p-4 flex items-start justify-between gap-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="mono text-[11px] font-bold text-smblue">{job.jobNo}</span>
            <span className={`mono text-[10px] px-1.5 py-0.5 ${STATUS_COLORS[job.status] ?? "bg-ink/5 text-ink/60"}`}>
              {STATUS_LABELS[job.status] ?? job.status}
            </span>
            {job.uploadedAt && <span className="mono text-[10px] text-purple-600">↑ 업로드됨</span>}
          </div>
          <div className="text-[15px] font-semibold">{job.pumpMaker} {job.pumpModel}</div>
          <div className="text-[12px] dim">
            {job.company?.companyName && <span className="mr-2">{job.company.companyName}</span>}
            {job.serialNo && <span className="mono mr-2">S/N {job.serialNo}</span>}
            <span>{fmtDate(job.receivedDate)}</span>
          </div>
        </div>
        <span className="text-[18px] dim shrink-0">{open ? "▲" : "▼"}</span>
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

          {/* 협력사 링크 */}
          <div className="space-y-2">
            <div className="mono text-[10px] dim tracking-[0.1em]">— 협력사 업로드 링크</div>
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
                {genToken ? "생성 중..." : "협력사 링크 생성 (14일)"}
              </button>
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
                    <span className="mono text-[10px] dim">{f.fileType}</span>
                    {f.fileSize && <span className="mono text-[10px] dim">{(f.fileSize / 1024 / 1024).toFixed(1)}MB</span>}
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/offline-repairs");
      if (res.ok) setJobs(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleSaved() { setShowForm(false); load(); }

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
        {loading ? (
          <div className="mono text-[11px] dim text-center py-10">— Loading</div>
        ) : jobs.length === 0 ? (
          <div className="border hair bg-paper/50 px-6 py-10 text-center text-[13px] dim">
            등록된 수리접수가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(j => <JobRow key={j.id} job={j} onRefresh={load} />)}
          </div>
        )}
      </div>
    </div>
  );
}
