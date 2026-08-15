"use client";
import { useEffect, useState } from "react";

type Company = { id: number; companyName: string };
type ReportItem = {
  id: number; section: string; sortOrder: number; label: string;
  isChecked: boolean; specValue: string | null; measured: string | null;
  judgment: string | null; quantity: string | null; partNo: string | null; remark: string | null;
};
type Photo = { id: number; section: string; fileUrl: string; fileName: string; isSelected: boolean };
type Report = {
  id: number; reportNo: string; status: string;
  company: Company | null;
  pumpModel: string; pumpSerial: string | null; pumpLocation: string | null; pumpAssetNo: string | null;
  symptomText: string | null; reasonText: string | null;
  subName: string | null; subEmail: string | null; adminNote: string | null;
  receivedDate: string; repairedDate: string | null;
  items: ReportItem[]; photos: Photo[];
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "작성중",
  SENT_TO_SUB: "외주발송",
  SUBMITTED: "외주제출완료",
  REVIEWED: "검토완료",
  SENT_TO_CUSTOMER: "고객발송",
  VIEWED: "고객열람완료",
};
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT_TO_SUB: "bg-yellow-50 text-yellow-700",
  SUBMITTED: "bg-purple-50 text-purple-700",
  REVIEWED: "bg-sky-50 text-sky-700",
  SENT_TO_CUSTOMER: "bg-teal-50 text-teal-700",
  VIEWED: "bg-green-50 text-green-700",
};

function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// ── 생성 폼 ──────────────────────────────
function ReportForm({ onSaved }: { onSaved: () => void }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyQ, setCompanyQ] = useState("TEMC");
  const [companyResults, setCompanyResults] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [pumpModel, setPumpModel] = useState("");
  const [pumpSerial, setPumpSerial] = useState("");
  const [pumpLocation, setPumpLocation] = useState("");
  const [pumpAssetNo, setPumpAssetNo] = useState("");
  const [subName, setSubName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/known-companies").then(r => r.json()).then(data => {
      setCompanies(data.companies ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!companyQ.trim()) { setCompanyResults([]); return; }
    setCompanyResults(companies.filter(c => c.companyName.toLowerCase().includes(companyQ.toLowerCase())).slice(0, 6));
  }, [companyQ, companies]);

  async function handleSave() {
    setError("");
    if (!pumpModel.trim()) { setError("펌프 모델을 입력해주세요."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/repair-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany?.id ?? null,
          companyName: selectedCompany ? undefined : companyQ.trim(),
          pumpModel, pumpSerial, pumpLocation, pumpAssetNo, subName, subEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "오류 발생"); return; }
      setPumpModel(""); setPumpSerial(""); setPumpLocation(""); setPumpAssetNo("");
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border hair bg-white p-5 space-y-4">
      <h3 className="text-[14px] font-bold text-ink">새 수선보고서 생성</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <label className="text-[11px] dim block mb-1">거래처</label>
          <input value={companyQ} onChange={(e) => { setCompanyQ(e.target.value); setSelectedCompany(null); }}
            className="border hair px-2 py-1.5 text-[13px] w-full" placeholder="거래처명 검색" />
          {companyResults.length > 0 && !selectedCompany && (
            <div className="absolute z-10 bg-white border hair w-full mt-1 shadow-md">
              {companyResults.map(c => (
                <div key={c.id} onClick={() => { setSelectedCompany(c); setCompanyQ(c.companyName); setCompanyResults([]); }}
                  className="px-2 py-1.5 text-[12px] hover:bg-ink/5 cursor-pointer">{c.companyName}</div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="text-[11px] dim block mb-1">펌프 모델 *</label>
          <input value={pumpModel} onChange={(e) => setPumpModel(e.target.value)} className="border hair px-2 py-1.5 text-[13px] w-full" placeholder="iXH200/2700" />
        </div>
        <div>
          <label className="text-[11px] dim block mb-1">S/N</label>
          <input value={pumpSerial} onChange={(e) => setPumpSerial(e.target.value)} className="border hair px-2 py-1.5 text-[13px] w-full" />
        </div>
        <div>
          <label className="text-[11px] dim block mb-1">설치 위치</label>
          <input value={pumpLocation} onChange={(e) => setPumpLocation(e.target.value)} className="border hair px-2 py-1.5 text-[13px] w-full" placeholder="라인/공정명" />
        </div>
        <div>
          <label className="text-[11px] dim block mb-1">자산번호</label>
          <input value={pumpAssetNo} onChange={(e) => setPumpAssetNo(e.target.value)} className="border hair px-2 py-1.5 text-[13px] w-full" />
        </div>
        <div>
          <label className="text-[11px] dim block mb-1">외주업체명</label>
          <input value={subName} onChange={(e) => setSubName(e.target.value)} className="border hair px-2 py-1.5 text-[13px] w-full" />
        </div>
        <div>
          <label className="text-[11px] dim block mb-1">외주업체 이메일</label>
          <input value={subEmail} onChange={(e) => setSubEmail(e.target.value)} className="border hair px-2 py-1.5 text-[13px] w-full" />
        </div>
      </div>
      {error && <p className="text-[12px] text-edred">{error}</p>}
      <button onClick={handleSave} disabled={saving}
        className="bg-ink text-paper px-5 py-2 text-[13px] font-semibold hover:bg-smblue transition-colors disabled:opacity-50">
        {saving ? "저장 중..." : "생성"}
      </button>
    </div>
  );
}

// ── 상세 행 ──────────────────────────────
function ReportRow({ report, onRefresh }: { report: Report; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ReportItem[]>(report.items);
  const [submitUrl, setSubmitUrl] = useState("");
  const [viewUrl, setViewUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setItems(report.items); }, [report.items]);

  function updateItem(id: number, field: keyof ReportItem, value: string | boolean) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  }

  async function saveItems() {
    setBusy(true);
    try {
      await fetch(`/api/admin/repair-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_items", items }),
      });
      onRefresh();
    } finally { setBusy(false); }
  }

  async function genSubmitToken() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/repair-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_submit_token" }),
      });
      const data = await res.json();
      setSubmitUrl(data.url ?? "");
      onRefresh();
    } finally { setBusy(false); }
  }

  async function genViewToken() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/repair-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_view_token" }),
      });
      const data = await res.json();
      setViewUrl(data.url ?? "");
      onRefresh();
    } finally { setBusy(false); }
  }

  async function togglePhoto(photoId: number) {
    await fetch(`/api/admin/repair-reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_photo", photoId }),
    });
    onRefresh();
  }

  const checklist = items.filter(it => it.section === "CHECKLIST");
  const measurements = items.filter(it => it.section === "MEASUREMENT");
  const parts = items.filter(it => it.section === "PART");

  return (
    <div className="border hair bg-white mb-3">
      <div onClick={() => setOpen(!open)} className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-ink/[0.02]">
        <div>
          <span className="mono text-[11px] dim mr-3">{report.reportNo}</span>
          <span className="font-semibold text-[14px]">{report.pumpModel}</span>
          {report.pumpSerial && <span className="mono text-[12px] dim ml-2">S/N {report.pumpSerial}</span>}
          <span className="text-[12px] dim ml-3">{report.company?.companyName ?? "—"}</span>
          <span className="mono text-[11px] dim ml-3">접수 {fmtDate(report.receivedDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] px-2 py-0.5 rounded ${STATUS_COLORS[report.status] ?? ""}`}>{STATUS_LABELS[report.status] ?? report.status}</span>
          <span className="text-[11px] dim">{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && (
        <div className="border-t hair px-4 py-4 space-y-5 bg-[#FAFAF8]">
          {/* 링크 발급 */}
          <div className="flex flex-wrap gap-3 items-center">
            <button onClick={genSubmitToken} disabled={busy} className="border hair px-3 py-1.5 text-[12px] hover:bg-ink/5 disabled:opacity-50">외주 제출 링크 생성</button>
            <button onClick={genViewToken} disabled={busy} className="border hair px-3 py-1.5 text-[12px] hover:bg-ink/5 disabled:opacity-50">고객 열람 링크 생성</button>
          </div>
          {submitUrl && (
            <div className="text-[12px] bg-yellow-50 border border-yellow-200 px-3 py-2">
              외주 제출 링크: <a href={submitUrl} target="_blank" rel="noreferrer" className="text-smblue underline break-all">{submitUrl}</a>
            </div>
          )}
          {viewUrl && (
            <div className="text-[12px] bg-green-50 border border-green-200 px-3 py-2">
              고객 열람 링크: <a href={viewUrl} target="_blank" rel="noreferrer" className="text-smblue underline break-all">{viewUrl}</a>
            </div>
          )}

          {/* 이상현상/수리사유 */}
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-[11px] dim mb-1">이상현상</div><div className="text-[13px]">{report.symptomText || "—"}</div></div>
            <div><div className="text-[11px] dim mb-1">수리사유</div><div className="text-[13px]">{report.reasonText || "—"}</div></div>
          </div>

          {/* 체크리스트 */}
          <div>
            <div className="text-[11px] dim mb-2">예상수리내용 체크리스트</div>
            <div className="space-y-1">
              {checklist.map(it => (
                <label key={it.id} className="flex items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={it.isChecked} onChange={(e) => updateItem(it.id, "isChecked", e.target.checked)} className="w-4 h-4 accent-ink" />
                  {it.label}
                </label>
              ))}
            </div>
          </div>

          {/* 측정치표 */}
          {measurements.length > 0 && (
            <div>
              <div className="text-[11px] dim mb-2">측정치표</div>
              <table className="w-full text-[12px]">
                <thead><tr className="text-left dim"><th className="pb-1">항목</th><th className="pb-1">정상치</th><th className="pb-1">측정치</th><th className="pb-1">판정</th></tr></thead>
                <tbody>
                  {measurements.map(it => (
                    <tr key={it.id} className="border-t hair">
                      <td className="py-1">{it.label}</td><td className="py-1 mono">{it.specValue}</td><td className="py-1 mono">{it.measured}</td><td className="py-1">{it.judgment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 부품교환내역 */}
          {parts.length > 0 && (
            <div>
              <div className="text-[11px] dim mb-2">부품교환내역</div>
              <table className="w-full text-[12px]">
                <thead><tr className="text-left dim"><th className="pb-1">부품명</th><th className="pb-1">수량</th><th className="pb-1">품번</th></tr></thead>
                <tbody>
                  {parts.map(it => (
                    <tr key={it.id} className="border-t hair">
                      <td className="py-1">{it.label}</td><td className="py-1 mono">{it.quantity}</td><td className="py-1 mono">{it.partNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button onClick={saveItems} disabled={busy} className="bg-smblue text-paper px-4 py-1.5 text-[12px] font-semibold hover:brightness-110 disabled:opacity-50">
            체크리스트 저장
          </button>

          {/* 사진 */}
          {report.photos.length > 0 && (
            <div>
              <div className="text-[11px] dim mb-2">사진 ({report.photos.length}장) — 클릭해서 고객 열람 포함 여부 토글</div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {report.photos.map(p => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.fileUrl} alt={p.fileName} onClick={() => togglePhoto(p.id)}
                    className={`aspect-square object-cover cursor-pointer border-2 ${p.isSelected ? "border-smblue" : "border-transparent opacity-30"}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RepairReportsAdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/repair-reports").then(r => r.json()).then(setReports).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const loadDetail = async (id: number) => {
    const res = await fetch(`/api/admin/repair-reports/${id}`);
    const detail = await res.json();
    setReports(prev => prev.map(r => r.id === id ? detail : r));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-[22px] font-bold text-ink mb-1">TEMC 수선보고서</h1>
      <p className="text-[13px] dim mb-6">외주업체 입력 → 스마텍 검토 → 고객(TEMC) 열람 · PDF저장</p>

      <div className="mb-6">
        <ReportForm onSaved={load} />
      </div>

      {loading ? (
        <p className="text-[13px] dim">불러오는 중...</p>
      ) : reports.length === 0 ? (
        <p className="text-[13px] dim">등록된 보고서가 없습니다.</p>
      ) : (
        reports.map(r => (
          <ReportRow key={r.id} report={r} onRefresh={() => loadDetail(r.id)} />
        ))
      )}
    </div>
  );
}
