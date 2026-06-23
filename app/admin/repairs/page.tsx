"use client";

import { useEffect, useState, useCallback } from "react";

type RepairFile = { fileType: string };
type FullRepairFile = {
  id: number;
  fileType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
};
type Repair = {
  id: number;
  repairNo: string;
  pumpMaker: string;
  pumpModel: string;
  pumpFamily: string;
  pumpSerial: string | null;
  status: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  company: string | null;
  baseAmount: number;
  extraAmount: number;
  totalAmount: number;
  adminNote: string | null;
  aiConfidence: string | null;
  aiModelRaw: string | null;
  docsSentAt: string | null;
  docsSentCount: number;
  symptoms: string[];
  symptomNote: string | null;
  createdAt: string;
  files: RepairFile[];
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  RECEIVED:    { label: "접수완료", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "수리중",   color: "bg-yellow-100 text-yellow-700" },
  INSPECTION:  { label: "수리중",   color: "bg-yellow-100 text-yellow-700" },
  COMPLETED:   { label: "수리중",   color: "bg-yellow-100 text-yellow-700" },
  DELIVERED:   { label: "납품완료", color: "bg-green-100 text-green-700" },
  CANCELLED:   { label: "취소",     color: "bg-red-100 text-red-700" },
};

const STATUS_FLOW = ["RECEIVED", "IN_PROGRESS", "DELIVERED"];

const SYMPTOM_KO: Record<string, string> = {
  vibration: "진동/소음", vacuum: "진공 불량", overload: "과부하",
  temperature: "온도 이상", oil_leak: "오일 누유", contamination: "공정 오염",
  electrical: "전기/제어 오류", other: "기타",
};

const FILE_TYPE_KO: Record<string, string> = {
  disassembly_photo: "분해 사진",
  inspection_cert: "검사 성적서",
  quote_pdf: "견적서 PDF",
  delivery_note: "거래명세표",
  bank_copy: "통장 사본",
  other: "기타",
};

type Tab = "info" | "work" | "send" | "blog";

function formatPrice(n: number) {
  return n > 0 ? n.toLocaleString("ko-KR") + "원" : "—";
}
function formatDate(s: string) {
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminRepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<Repair | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");

  // 수리작업 탭 상태
  const [saving, setSaving] = useState(false);
  const [editNote, setEditNote] = useState("");
  const [editExtra, setEditExtra] = useState("");

  // 접수정보 탭 — 모델명 수정
  const [editModel, setEditModel] = useState("");
  const [savingModel, setSavingModel] = useState(false);

  // 파일
  const [fullFiles, setFullFiles] = useState<FullRepairFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [adminUploadType, setAdminUploadType] = useState("disassembly_photo");
  const [adminUploading, setAdminUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);

  // 블로그 탭 상태
  const [blogDraftLoading, setBlogDraftLoading] = useState(false);
  const [blogDraft, setBlogDraft] = useState<{ title: string; metaDesc: string; tags: string; content: string } | null>(null);
  const [blogPhotoUrls, setBlogPhotoUrls] = useState<string[]>([]);
  const [blogPublishing, setBlogPublishing] = useState(false);
  const [blogPublishedId, setBlogPublishedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const q = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/repairs${q}`);
    const data = await res.json();
    setRepairs(data.repairs ?? []);
    setTotal(data.total ?? 0);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function loadFiles(repairId: number) {
    setFilesLoading(true);
    try {
      const res = await fetch(`/api/admin/repairs/${repairId}/files`);
      const data = await res.json();
      setFullFiles(data.files ?? []);
    } finally {
      setFilesLoading(false);
    }
  }

  function openDetail(r: Repair) {
    setSelected(r);
    setActiveTab("info");
    setEditNote(r.adminNote ?? "");
    setEditExtra(r.extraAmount > 0 ? String(r.extraAmount) : "");
    setEditModel(r.pumpModel ?? "");
    setBlogDraft(null);
    setBlogPhotoUrls([]);
    setBlogPublishedId(null);
    loadFiles(r.id);
  }

  async function deleteRepair(id: number, repairNo: string) {
    if (!confirm(`${repairNo} 접수를 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`)) return;
    const res = await fetch(`/api/admin/repairs?id=${id}`, { method: "DELETE" });
    if (res.ok) { if (selected?.id === id) setSelected(null); load(); }
    else alert("삭제 실패");
  }

  async function saveModel() {
    if (!selected || !editModel.trim()) return;
    setSavingModel(true);
    try {
      await fetch("/api/admin/repairs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status: selected.status, pumpModel: editModel.trim() }),
      });
      setSelected((p) => p ? { ...p, pumpModel: editModel.trim() } : null);
      load();
    } finally { setSavingModel(false); }
  }

  async function updateStatus(newStatus: string) {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch("/api/admin/repairs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status: newStatus, adminNote: editNote || null, extraAmount: editExtra ? Number(editExtra) : 0 }),
      });
      setSelected((p) => p ? { ...p, status: newStatus } : null);
      load();
    } catch { alert("저장 실패"); }
    finally { setSaving(false); }
  }

  async function saveNote() {
    if (!selected) return;
    setSaving(true);
    try {
      const extra = editExtra ? Number(editExtra) : 0;
      await fetch("/api/admin/repairs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status: selected.status, adminNote: editNote || null, extraAmount: extra }),
      });
      setSelected((p) => p ? { ...p, adminNote: editNote || null, extraAmount: extra } : null);
      load();
    } finally { setSaving(false); }
  }

  async function adminUpload(files: FileList) {
    if (!selected || !files.length) return;
    setAdminUploading(true);
    const formData = new FormData();
    formData.append("fileType", adminUploadType);
    Array.from(files).forEach((f) => formData.append("files", f));
    try {
      const res = await fetch(`/api/admin/repairs/${selected.id}/files`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      await loadFiles(selected.id);
      await load();
    } catch { alert("업로드 실패"); }
    finally { setAdminUploading(false); }
  }

  async function deleteFile(fileId: number) {
    if (!selected || !confirm("이 파일을 삭제하시겠습니까?")) return;
    setDeletingFileId(fileId);
    try {
      const res = await fetch(`/api/admin/repairs/${selected.id}/files?fileId=${fileId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await loadFiles(selected.id);
      await load();
    } catch { alert("삭제 실패"); }
    finally { setDeletingFileId(null); }
  }

  async function generateBlogDraft() {
    if (!selected) return;
    setBlogDraftLoading(true);
    setBlogDraft(null);
    setBlogPublishedId(null);
    try {
      const res = await fetch(`/api/admin/repairs/${selected.id}/blog-draft`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "서버 오류");
      setBlogDraft(data.draft);
      setBlogPhotoUrls(data.photoUrls ?? []);
    } catch (e) { alert(`초안 생성 실패: ${e}`); }
    finally { setBlogDraftLoading(false); }
  }

  async function publishBlogDraft() {
    if (!selected || !blogDraft) return;
    setBlogPublishing(true);
    try {
      const res = await fetch(`/api/admin/repairs/${selected.id}/blog-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...blogDraft, photoUrls: blogPhotoUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "서버 오류");
      setBlogPublishedId(data.blogId);
    } catch (e) { alert(`발행 실패: ${e}`); }
    finally { setBlogPublishing(false); }
  }

  const fileCount = (r: Repair, type: string) => r.files.filter((f) => f.fileType === type).length;

  return (
    <div className="flex overflow-hidden" style={{ height: "calc(100vh - 100px)" }}>

      {/* 왼쪽: 목록 */}
      <div className="flex-1 min-w-0 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight">수리 접수 현황</h1>
            <p className="text-[13px] text-dim mt-0.5">총 {total}건</p>
          </div>
          <div className="flex gap-2">
            <a href="/admin/repair-kits" className="text-[12px] border border-line px-3 py-1.5 hover:border-ink transition mono text-dim">
              수리키트 설정 →
            </a>
            <button onClick={load} className="text-[12px] border border-line px-3 py-1.5 hover:border-ink transition mono">
              새로고침
            </button>
          </div>
        </div>

        {/* 상태 필터 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["ALL", ...STATUS_FLOW, "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[11px] mono px-3 py-1.5 border transition ${
                statusFilter === s ? "bg-ink text-paper border-ink" : "border-line hover:border-ink text-dim"
              }`}
            >
              {s === "ALL" ? "전체" : STATUS_LABELS[s]?.label}
            </button>
          ))}
        </div>

        {/* 테이블 */}
        <div className="border border-line overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper/50">
                <th className="text-left px-4 py-3 font-medium text-dim mono text-[11px]">접수번호</th>
                <th className="text-left px-4 py-3 font-medium text-dim mono text-[11px]">장비</th>
                <th className="text-left px-4 py-3 font-medium text-dim mono text-[11px]">접수자</th>
                <th className="text-left px-4 py-3 font-medium text-dim mono text-[11px]">상태</th>
                <th className="text-right px-4 py-3 font-medium text-dim mono text-[11px]">금액</th>
                <th className="text-left px-4 py-3 font-medium text-dim mono text-[11px]">파일</th>
                <th className="text-left px-4 py-3 font-medium text-dim mono text-[11px]">접수일</th>
              </tr>
            </thead>
            <tbody>
              {repairs.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-dim text-[13px]">접수 내역이 없습니다.</td></tr>
              )}
              {repairs.map((r) => {
                const st = STATUS_LABELS[r.status];
                const photoCount = fileCount(r, "disassembly_photo");
                const certCount = fileCount(r, "inspection_cert");
                return (
                  <tr
                    key={r.id}
                    onClick={() => openDetail(r)}
                    className="border-b border-line hover:bg-paper/80 cursor-pointer transition group"
                  >
                    <td className="px-4 py-3 mono font-semibold text-[12px]">{r.repairNo}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{r.pumpModel || "미확인"}</span>
                        {r.aiConfidence === "low" && (
                          <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">모델확인필요</span>
                        )}
                      </div>
                      <div className="text-[11px] text-dim">{r.pumpMaker}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{r.contactName}</div>
                      {r.company && <div className="text-[11px] text-dim">{r.company}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${st?.color}`}>{st?.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular">
                      {r.totalAmount > 0 ? (
                        <div>
                          <div className="font-semibold">{formatPrice(r.totalAmount)}</div>
                          {r.extraAmount > 0 && <div className="text-[10px] text-dim">+{formatPrice(r.extraAmount)}</div>}
                        </div>
                      ) : <span className="text-dim text-[11px]">상담필요</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {photoCount > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">사진 {photoCount}</span>}
                        {certCount > 0 && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">성적서 {certCount}</span>}
                        {photoCount === 0 && certCount === 0 && <span className="text-[10px] text-dim">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dim text-[11px] mono">
                      <div className="flex items-center gap-2">
                        <span>{formatDate(r.createdAt)}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteRepair(r.id, r.repairNo); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-1.5 py-0.5"
                        >삭제</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 오른쪽: 상세 패널 */}
      {selected && (
        <div className="w-[460px] shrink-0 border-l border-line overflow-y-auto bg-paper flex flex-col">

          {/* 패널 헤더 */}
          <div className="sticky top-0 bg-paper border-b border-line px-5 py-4 z-10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="mono text-[10px] text-dim mb-0.5">{selected.repairNo} · {formatDate(selected.createdAt)}</div>
                <div className="font-bold text-[17px]">{selected.pumpMaker} {selected.pumpModel || "모델 미확인"}</div>
                {selected.company && <div className="text-[12px] text-dim mt-0.5">{selected.company} · {selected.contactName}</div>}
              </div>
              <button onClick={() => setSelected(null)} className="text-dim hover:text-ink text-xl leading-none mt-0.5">×</button>
            </div>

            {/* 탭 */}
            <div className="flex gap-0 border border-line">
              {(["info", "work", "send", "blog"] as Tab[]).map((tab) => {
                const labels: Record<Tab, string> = { info: "접수정보", work: "수리작업", send: "발송", blog: "블로그" };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-[11px] mono font-medium transition border-r last:border-r-0 border-line ${
                      activeTab === tab ? "bg-ink text-paper" : "text-dim hover:text-ink hover:bg-ink/5"
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="flex-1 px-5 py-5 space-y-5">

            {/* ── 접수정보 탭 ── */}
            {activeTab === "info" && (
              <>
                {/* AI 인식 경고 */}
                {selected.aiConfidence === "low" && (
                  <div className="border border-amber-300 bg-amber-50 p-4 text-[13px]">
                    <div className="mono text-[9px] text-amber-700 tracking-widest mb-2">AI 인식 실패 — 모델명 확인 필요</div>
                    <div className="text-[11px] text-dim mb-3">원본: {selected.aiModelRaw ?? "—"}</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editModel}
                        onChange={(e) => setEditModel(e.target.value)}
                        placeholder="예: XDS35iE, nXDS10i"
                        className="flex-1 border border-line px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-white"
                      />
                      <button
                        onClick={saveModel}
                        disabled={savingModel || !editModel.trim()}
                        className="px-4 py-2 bg-ink text-paper text-[12px] font-semibold hover:bg-edred transition disabled:opacity-40"
                      >
                        {savingModel ? "..." : "저장"}
                      </button>
                    </div>
                  </div>
                )}

                {/* 장비 정보 */}
                <Section title="장비">
                  <Row label="모델" value={
                    selected.aiConfidence !== "low" ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={editModel}
                          onChange={(e) => setEditModel(e.target.value)}
                          className="flex-1 border border-line px-2 py-1 text-[13px] focus:outline-none focus:border-ink bg-paper"
                        />
                        {editModel !== selected.pumpModel && (
                          <button onClick={saveModel} disabled={savingModel} className="text-[11px] px-2 py-1 bg-ink text-paper hover:bg-edred transition disabled:opacity-40">
                            {savingModel ? "..." : "저장"}
                          </button>
                        )}
                      </div>
                    ) : selected.pumpModel
                  } />
                  <Row label="제조사" value={selected.pumpMaker} />
                  {selected.pumpSerial && <Row label="시리얼" value={selected.pumpSerial} />}
                  <Row label="종류" value={selected.pumpFamily} />
                </Section>

                {/* 증상 */}
                <Section title="증상">
                  <div className="flex flex-wrap gap-1.5">
                    {selected.symptoms.map((s) => (
                      <span key={s} className="text-[11px] bg-ink/5 border border-line px-2 py-0.5">
                        {SYMPTOM_KO[s] ?? s}
                      </span>
                    ))}
                  </div>
                  {selected.symptomNote && <p className="text-[12px] text-dim mt-2">{selected.symptomNote}</p>}
                </Section>

                {/* 연락처 */}
                <Section title="연락처">
                  <Row label="담당자" value={selected.contactName} />
                  {selected.company && <Row label="회사" value={selected.company} />}
                  <Row label="전화" value={
                    <a href={`tel:${selected.contactPhone}`} className="text-edred hover:underline">{selected.contactPhone}</a>
                  } />
                  {selected.contactEmail && (
                    <Row label="이메일" value={
                      <a href={`mailto:${selected.contactEmail}`} className="text-edred hover:underline">{selected.contactEmail}</a>
                    } />
                  )}
                </Section>
              </>
            )}

            {/* ── 수리작업 탭 ── */}
            {activeTab === "work" && (
              <>
                {/* 상태 변경 */}
                <Section title="진행 상태">
                  <div className="flex gap-2">
                    {STATUS_FLOW.map((s) => (
                      <button
                        key={s}
                        disabled={saving}
                        onClick={() => updateStatus(s)}
                        className={`flex-1 py-2 text-[12px] border transition font-medium ${
                          selected.status === s || (s === "IN_PROGRESS" && ["IN_PROGRESS","INSPECTION","COMPLETED"].includes(selected.status))
                            ? "bg-ink text-paper border-ink"
                            : "border-line hover:border-ink text-dim hover:text-ink"
                        }`}
                      >
                        {STATUS_LABELS[s].label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-dim mt-2">수리중·납품완료 선택 시 고객에게 SMS가 발송됩니다.</p>
                </Section>

                {/* 금액 */}
                <Section title="금액">
                  <Row label="기본 수리비" value={selected.baseAmount > 0 ? formatPrice(selected.baseAmount) : "상담필요"} />
                  <div className="mt-2">
                    <label className="text-[11px] text-dim block mb-1">추가 파트비 (원)</label>
                    <input
                      type="number"
                      value={editExtra}
                      onChange={(e) => setEditExtra(e.target.value)}
                      placeholder="0"
                      className="w-full border border-line px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-paper"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-line font-bold mt-2">
                    <span className="text-[13px]">합계</span>
                    <span className="tabular text-[16px]">
                      {formatPrice(selected.baseAmount + (editExtra ? Number(editExtra) : selected.extraAmount))}
                    </span>
                  </div>
                </Section>

                {/* 파일 업로드 */}
                <Section title="파일 업로드">
                  <div className="mb-3">
                    <select
                      value={adminUploadType}
                      onChange={(e) => setAdminUploadType(e.target.value)}
                      className="w-full border border-line px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-paper"
                    >
                      <option value="disassembly_photo">분해 사진</option>
                      <option value="inspection_cert">검사 성적서</option>
                      <option value="quote_pdf">견적서 PDF</option>
                      <option value="delivery_note">거래명세표</option>
                      <option value="bank_copy">통장 사본</option>
                    </select>
                  </div>
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed cursor-pointer py-5 transition ${
                    adminUploading ? "border-ink/30 bg-ink/5 cursor-wait" : "border-line hover:border-ink hover:bg-ink/5"
                  }`}>
                    <input type="file" className="hidden" multiple disabled={adminUploading}
                      onChange={(e) => e.target.files && adminUpload(e.target.files)} />
                    {adminUploading ? (
                      <div className="flex items-center gap-2 text-[12px] text-dim">
                        <span className="animate-spin w-3 h-3 border-2 border-dim/30 border-t-ink rounded-full inline-block" />
                        업로드 중...
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-[20px] text-dim mb-1">↑</div>
                        <div className="text-[12px] font-medium">클릭하여 파일 선택</div>
                      </div>
                    )}
                  </label>
                </Section>

                {/* 파일 목록 */}
                <Section title="업로드된 파일">
                  {filesLoading ? (
                    <div className="text-[12px] text-dim animate-pulse">로딩 중...</div>
                  ) : fullFiles.length === 0 ? (
                    <div className="text-[12px] text-dim">업로드된 파일이 없습니다.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {fullFiles.map((f) => (
                        <div key={f.id} className="flex items-center gap-2 border border-line px-3 py-2">
                          <span className="text-[10px] text-dim shrink-0 w-16">{FILE_TYPE_KO[f.fileType] ?? f.fileType}</span>
                          <span className="flex-1 text-[12px] truncate">{f.fileName}</span>
                          {f.fileUrl.startsWith("http") && (
                            <a href={f.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-smblue hover:underline shrink-0">보기</a>
                          )}
                          <button
                            onClick={() => deleteFile(f.id)}
                            disabled={deletingFileId === f.id}
                            className="text-[10px] text-red-400 hover:text-red-600 shrink-0 disabled:opacity-40"
                          >
                            {deletingFileId === f.id ? "…" : "삭제"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* 관리자 메모 + 저장 */}
                <Section title="관리자 메모">
                  <textarea
                    rows={3}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="수리 원인, 교체 부품 등 내부 메모 (고객에게 보이지 않음)"
                    className="w-full border border-line px-3 py-2.5 text-[13px] focus:outline-none focus:border-ink bg-paper resize-none"
                  />
                  <button
                    onClick={saveNote}
                    disabled={saving}
                    className="w-full mt-3 py-3 bg-ink text-paper text-[13px] font-semibold hover:bg-edred transition disabled:opacity-40"
                  >
                    {saving ? "저장 중..." : "저장"}
                  </button>
                </Section>
              </>
            )}

            {/* ── 발송 탭 ── */}
            {activeTab === "send" && (
              <>
                <Section title="수리 견적서 발송">
                  <p className="text-[12px] text-dim mb-4">
                    수리 견적서 PDF를 생성해 고객 이메일로 발송합니다.<br />
                    분해 사진·검사 성적서는 포함되지 않습니다.
                  </p>
                  {selected.totalAmount <= 0 && (
                    <p className="text-[12px] text-amber-600 mb-3">수리작업 탭에서 금액을 입력하고 저장한 후 사용하세요.</p>
                  )}
                  <div className="flex gap-2">
                    <a
                      href={`/api/admin/repairs/${selected.id}/send-quote`}
                      target="_blank" rel="noopener noreferrer"
                      className="border border-line px-4 py-2.5 text-[12px] hover:bg-ink/5 transition"
                    >
                      PDF 저장
                    </a>
                    {selected.contactEmail ? (
                      <button
                        onClick={async () => {
                          if (!confirm(`${selected.contactEmail}으로 수리 견적서를 발송하시겠습니까?`)) return;
                          const res = await fetch(`/api/admin/repairs/${selected.id}/send-quote`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ adminNote: editNote }),
                          });
                          const data = await res.json();
                          if (res.ok) { alert(`발송 완료: ${data.sentTo}`); load(); }
                          else alert(`발송 실패: ${data.error}`);
                        }}
                        className="bg-smblue text-paper px-4 py-2.5 text-[12px] hover:brightness-110 transition"
                      >
                        이메일 발송
                      </button>
                    ) : (
                      <span className="text-[11px] text-dim self-center">이메일 없음 — 접수정보 탭에서 확인</span>
                    )}
                  </div>
                  {selected.docsSentAt && (
                    <p className="mono text-[10px] text-dim mt-3">
                      최근 발송: {formatDate(selected.docsSentAt)} ({selected.docsSentCount}회)
                    </p>
                  )}
                </Section>
              </>
            )}

            {/* ── 블로그 탭 ── */}
            {activeTab === "blog" && (
              <Section title="수리 사례 블로그">
                {blogPublishedId ? (
                  <div className="space-y-2">
                    <p className="text-[12px] text-green-700 font-semibold">블로그에 발행되었습니다.</p>
                    <a href={`/blog/${blogPublishedId}`} target="_blank" rel="noopener noreferrer"
                      className="text-[12px] text-edred hover:underline">
                      발행된 글 확인하기 →
                    </a>
                  </div>
                ) : blogDraft ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-dim block mb-1">제목</label>
                      <input type="text" value={blogDraft.title}
                        onChange={(e) => setBlogDraft((d) => d ? { ...d, title: e.target.value } : null)}
                        className="w-full border border-line px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-paper" />
                    </div>
                    <div>
                      <label className="text-[11px] text-dim block mb-1">메타 설명</label>
                      <input type="text" value={blogDraft.metaDesc}
                        onChange={(e) => setBlogDraft((d) => d ? { ...d, metaDesc: e.target.value } : null)}
                        className="w-full border border-line px-3 py-2 text-[12px] focus:outline-none focus:border-ink bg-paper" />
                    </div>
                    <div>
                      <label className="text-[11px] text-dim block mb-1">태그</label>
                      <input type="text" value={blogDraft.tags}
                        onChange={(e) => setBlogDraft((d) => d ? { ...d, tags: e.target.value } : null)}
                        className="w-full border border-line px-3 py-2 text-[12px] focus:outline-none focus:border-ink bg-paper" />
                    </div>
                    <div>
                      <label className="text-[11px] text-dim block mb-1">본문 미리보기</label>
                      <div className="bg-ink/5 border border-line px-3 py-2 text-[11px] max-h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {blogDraft.content.slice(0, 400)}…
                      </div>
                    </div>
                    {blogPhotoUrls.length > 0 && (
                      <p className="text-[11px] text-dim">분해 사진 {blogPhotoUrls.length}장 포함 예정</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button onClick={publishBlogDraft} disabled={blogPublishing}
                        className="flex-1 py-2.5 bg-edred text-paper text-[12px] font-semibold hover:bg-edred3 transition disabled:opacity-40">
                        {blogPublishing ? "발행 중..." : "블로그 발행"}
                      </button>
                      <button onClick={() => setBlogDraft(null)}
                        className="px-4 py-2.5 border border-line text-[12px] text-dim hover:border-ink hover:text-ink transition">
                        다시 생성
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[12px] text-dim mb-4">
                      관리자 메모와 분해 사진을 바탕으로 AI가 수리 사례 블로그 초안을 자동 생성합니다.<br />
                      <span className="text-amber-600">수리작업 탭에서 메모를 먼저 작성하면 더 좋은 글이 나옵니다.</span>
                    </p>
                    <button onClick={generateBlogDraft} disabled={blogDraftLoading}
                      className="w-full py-3 border border-smblue text-smblue text-[12px] font-semibold hover:bg-smblue hover:text-paper transition disabled:opacity-40">
                      {blogDraftLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin w-3 h-3 border-2 border-smblue/30 border-t-smblue rounded-full inline-block" />
                          AI 초안 생성 중 (15~30초)…
                        </span>
                      ) : "블로그 초안 생성 (AI)"}
                    </button>
                  </>
                )}
              </Section>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mono text-[9px] tracking-[0.18em] text-dim uppercase mb-3">{title}</div>
      <div className="border border-line p-4 space-y-2.5 text-[13px]">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-dim text-[12px] w-14 shrink-0 pt-0.5">{label}</span>
      <span className="flex-1 font-medium">{value}</span>
    </div>
  );
}
