"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { upload } from "@vercel/blob/client";


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

// ── 수리 행 (아코디언) ────────────────────────────
function RepairRow({ repair, onRefresh }: { repair: Repair; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [curRepair, setCurRepair] = useState<Repair>(repair);

  const [saving, setSaving] = useState(false);
  const [editNote, setEditNote] = useState(repair.adminNote ?? "");
  const [editExtra, setEditExtra] = useState(repair.extraAmount > 0 ? String(repair.extraAmount) : "");
  const [editModel, setEditModel] = useState(repair.pumpModel ?? "");
  const [savingModel, setSavingModel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [fullFiles, setFullFiles] = useState<FullRepairFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [adminUploadType, setAdminUploadType] = useState("disassembly_photo");
  const [adminUploading, setAdminUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);

  const [completionSummary, setCompletionSummary] = useState<{
    hasEmail: boolean; hasAmount: boolean; deliveryNote: boolean;
    inspectionCert: boolean; disassemblyPhotos: number; bankCopy: boolean;
  } | null>(null);
  const [sendingCompletion, setSendingCompletion] = useState(false);

  const [blogDraftLoading, setBlogDraftLoading] = useState(false);
  const [blogDraft, setBlogDraft] = useState<{ title: string; metaDesc: string; tags: string; content: string } | null>(null);
  const [blogPhotoUrls, setBlogPhotoUrls] = useState<string[]>([]);
  const [blogPublishing, setBlogPublishing] = useState(false);
  const [blogPublishedId, setBlogPublishedId] = useState<number | null>(null);

  useEffect(() => { setCurRepair(repair); }, [repair]);

  async function loadFiles() {
    setFilesLoading(true);
    try {
      const res = await fetch(`/api/admin/repairs/${repair.id}/files`);
      const data = await res.json();
      setFullFiles(data.files ?? []);
    } finally { setFilesLoading(false); }
  }

  function handleToggle() {
    if (!open) { setOpen(true); loadFiles(); }
    else { setOpen(false); }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`${repair.repairNo} 접수를 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/repairs?id=${repair.id}`, { method: "DELETE" });
    if (res.ok) onRefresh();
    else { alert("삭제 실패"); setDeleting(false); }
  }

  async function saveModel() {
    if (!editModel.trim()) return;
    setSavingModel(true);
    try {
      await fetch("/api/admin/repairs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: repair.id, status: curRepair.status, pumpModel: editModel.trim() }),
      });
      setCurRepair(p => ({ ...p, pumpModel: editModel.trim() }));
      onRefresh();
    } finally { setSavingModel(false); }
  }

  async function updateStatus(newStatus: string) {
    setSaving(true);
    try {
      await fetch("/api/admin/repairs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: repair.id, status: newStatus, adminNote: editNote || null, extraAmount: editExtra ? Number(editExtra) : 0 }),
      });
      setCurRepair(p => ({ ...p, status: newStatus }));
      onRefresh();
    } catch { alert("저장 실패"); }
    finally { setSaving(false); }
  }

  async function saveNote() {
    setSaving(true);
    try {
      const extra = editExtra ? Number(editExtra) : 0;
      await fetch("/api/admin/repairs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: repair.id, status: curRepair.status, adminNote: editNote || null, extraAmount: extra }),
      });
      setCurRepair(p => ({ ...p, adminNote: editNote || null, extraAmount: extra }));
      onRefresh();
    } finally { setSaving(false); }
  }

  async function adminUpload(files: FileList) {
    if (!files.length) return;
    setAdminUploading(true);
    try {
      for (const file of Array.from(files)) {
        const safeName = file.name.replace(/[()[\]{} ]/g, "_");
        const blob = await upload(
          `repairs/${repair.id}/${adminUploadType}/${Date.now()}-${safeName}`,
          file,
          { access: "private", handleUploadUrl: `/api/admin/repairs/${repair.id}/blob-upload` }
        );
        const saveRes = await fetch(`/api/admin/repairs/${repair.id}/blob-upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase: "save", url: blob.url, filename: file.name, fileType: adminUploadType, fileSize: file.size }),
        });
        if (!saveRes.ok) {
          const d = await saveRes.json().catch(() => ({}));
          throw new Error((d as { error?: string }).error ?? "DB 저장 실패");
        }
      }
      await loadFiles();
      onRefresh();
    } catch (e) {
      alert(`업로드 실패: ${e instanceof Error ? e.message : "다시 시도해주세요."}`);
    } finally { setAdminUploading(false); }
  }

  async function deleteFile(fileId: number) {
    if (!confirm("이 파일을 삭제하시겠습니까?")) return;
    setDeletingFileId(fileId);
    try {
      const res = await fetch(`/api/admin/repairs/${repair.id}/files?fileId=${fileId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await loadFiles();
      onRefresh();
    } catch { alert("삭제 실패"); }
    finally { setDeletingFileId(null); }
  }

  async function generateBlogDraft() {
    setBlogDraftLoading(true); setBlogDraft(null); setBlogPublishedId(null);
    try {
      const res = await fetch(`/api/admin/repairs/${repair.id}/blog-draft`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "서버 오류");
      setBlogDraft(data.draft);
      setBlogPhotoUrls(data.photoUrls ?? []);
    } catch (e) { alert(`초안 생성 실패: ${e}`); }
    finally { setBlogDraftLoading(false); }
  }

  async function publishBlogDraft() {
    if (!blogDraft) return;
    setBlogPublishing(true);
    try {
      const res = await fetch(`/api/admin/repairs/${repair.id}/blog-draft`, {
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

  const st = STATUS_LABELS[curRepair.status];
  const photoCount = curRepair.files.filter(f => f.fileType === "disassembly_photo").length;
  const certCount = curRepair.files.filter(f => f.fileType === "inspection_cert").length;

  return (
    <div className="border hair bg-paper">
      {/* 헤더 행 */}
      <div className="p-4 flex items-start justify-between gap-4 cursor-pointer" onClick={handleToggle}>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="mono text-[11px] font-bold text-smblue">{curRepair.repairNo}</span>
            <span className={`mono text-[10px] px-1.5 py-0.5 ${st?.color ?? "bg-ink/5 text-ink/60"}`}>
              {st?.label ?? curRepair.status}
            </span>
            {curRepair.aiConfidence === "low" && (
              <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 font-semibold">모델확인필요</span>
            )}
            {photoCount > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5">사진 {photoCount}</span>}
            {certCount > 0 && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5">성적서 {certCount}</span>}
          </div>
          <div className="text-[15px] font-semibold">{curRepair.pumpMaker} {curRepair.pumpModel || "모델 미확인"}</div>
          <div className="text-[12px] dim">
            {curRepair.company && <span className="mr-2">{curRepair.company}</span>}
            <span className="mr-2">{curRepair.contactName}</span>
            <span className="mono">{formatDate(curRepair.createdAt)}</span>
            {curRepair.totalAmount > 0 && (
              <span className="ml-2 font-semibold text-ink">{formatPrice(curRepair.totalAmount)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleDelete} disabled={deleting}
            className="mono text-[10px] text-edred/50 hover:text-edred border border-transparent hover:border-edred/30 px-2 py-1 transition-colors disabled:opacity-40">
            {deleting ? "..." : "삭제"}
          </button>
          <span className="text-[18px] dim">{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* 펼쳐진 상세 */}
      {open && (
        <div className="border-t hair">
          {/* 탭 */}
          <div className="flex gap-0 border-b hair">
            {(["info", "work", "send", "blog"] as Tab[]).map((tab) => {
              const labels: Record<Tab, string> = { info: "접수정보", work: "수리작업", send: "발송", blog: "블로그" };
              return (
                <button key={tab}
                  onClick={() => { if (tab === "send") setCompletionSummary(null); setActiveTab(tab); }}
                  className={`flex-1 py-2 text-[11px] mono font-medium transition border-r last:border-r-0 hair ${
                    activeTab === tab ? "bg-ink text-paper" : "text-dim hover:text-ink hover:bg-ink/5"
                  }`}>
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          <div className="px-5 py-5 space-y-5">

            {/* ── 접수정보 ── */}
            {activeTab === "info" && (
              <>
                {curRepair.aiConfidence === "low" && (
                  <div className="border border-amber-300 bg-amber-50 p-4 text-[13px]">
                    <div className="mono text-[9px] text-amber-700 tracking-widest mb-2">AI 인식 실패 — 모델명 확인 필요</div>
                    <div className="text-[11px] text-dim mb-3">원본: {curRepair.aiModelRaw ?? "—"}</div>
                    <div className="flex gap-2">
                      <input type="text" value={editModel} onChange={e => setEditModel(e.target.value)}
                        placeholder="예: XDS35iE, nXDS10i"
                        className="flex-1 border border-line px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-white" />
                      <button onClick={saveModel} disabled={savingModel || !editModel.trim()}
                        className="px-4 py-2 bg-ink text-paper text-[12px] font-semibold hover:bg-edred transition disabled:opacity-40">
                        {savingModel ? "..." : "저장"}
                      </button>
                    </div>
                  </div>
                )}
                <Section title="장비">
                  <Row label="모델" value={
                    curRepair.aiConfidence !== "low" ? (
                      <div className="flex gap-2 items-center">
                        <input type="text" value={editModel} onChange={e => setEditModel(e.target.value)}
                          className="flex-1 border border-line px-2 py-1 text-[13px] focus:outline-none focus:border-ink bg-paper" />
                        {editModel !== curRepair.pumpModel && (
                          <button onClick={saveModel} disabled={savingModel}
                            className="text-[11px] px-2 py-1 bg-ink text-paper hover:bg-edred transition disabled:opacity-40">
                            {savingModel ? "..." : "저장"}
                          </button>
                        )}
                      </div>
                    ) : curRepair.pumpModel
                  } />
                  <Row label="제조사" value={curRepair.pumpMaker} />
                  {curRepair.pumpSerial && <Row label="시리얼" value={curRepair.pumpSerial} />}
                  <Row label="종류" value={curRepair.pumpFamily} />
                </Section>
                <Section title="증상">
                  <div className="flex flex-wrap gap-1.5">
                    {curRepair.symptoms.map(s => (
                      <span key={s} className="text-[11px] bg-ink/5 border border-line px-2 py-0.5">
                        {SYMPTOM_KO[s] ?? s}
                      </span>
                    ))}
                  </div>
                  {curRepair.symptomNote && <p className="text-[12px] text-dim mt-2">{curRepair.symptomNote}</p>}
                </Section>
                <Section title="연락처">
                  <Row label="담당자" value={curRepair.contactName} />
                  {curRepair.company && <Row label="회사" value={curRepair.company} />}
                  <Row label="전화" value={
                    <a href={`tel:${curRepair.contactPhone}`} className="text-edred hover:underline">{curRepair.contactPhone}</a>
                  } />
                  {curRepair.contactEmail && (
                    <Row label="이메일" value={
                      <a href={`mailto:${curRepair.contactEmail}`} className="text-edred hover:underline">{curRepair.contactEmail}</a>
                    } />
                  )}
                </Section>
              </>
            )}

            {/* ── 수리작업 ── */}
            {activeTab === "work" && (
              <>
                <Section title="진행 상태">
                  <div className="flex gap-2">
                    {STATUS_FLOW.map(s => (
                      <button key={s} disabled={saving} onClick={() => updateStatus(s)}
                        className={`flex-1 py-2 text-[12px] border transition font-medium ${
                          curRepair.status === s || (s === "IN_PROGRESS" && ["IN_PROGRESS","INSPECTION","COMPLETED"].includes(curRepair.status))
                            ? "bg-ink text-paper border-ink"
                            : "border-line hover:border-ink text-dim hover:text-ink"
                        }`}>
                        {STATUS_LABELS[s].label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-dim mt-2">수리중·납품완료 선택 시 고객에게 SMS가 발송됩니다.</p>
                </Section>
                <Section title="금액">
                  <Row label="기본 수리비" value={curRepair.baseAmount > 0 ? formatPrice(curRepair.baseAmount) : "상담필요"} />
                  <div className="mt-2">
                    <label className="text-[11px] text-dim block mb-1">추가 파트비 (원)</label>
                    <input type="number" value={editExtra} onChange={e => setEditExtra(e.target.value)}
                      placeholder="0" className="w-full border border-line px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-paper" />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-line font-bold mt-2">
                    <span className="text-[13px]">합계</span>
                    <span className="tabular text-[16px]">
                      {formatPrice(curRepair.baseAmount + (editExtra ? Number(editExtra) : curRepair.extraAmount))}
                    </span>
                  </div>
                </Section>
                <Section title="파일 업로드">
                  <div className="mb-3">
                    <select value={adminUploadType} onChange={e => setAdminUploadType(e.target.value)}
                      className="w-full border border-line px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-paper">
                      <option value="disassembly_photo">분해 사진</option>
                      <option value="inspection_cert">검사 성적서</option>
                      <option value="quote_pdf">견적서 PDF</option>
                      <option value="delivery_note">거래명세표</option>
                      <option value="bank_copy">통장 사본</option>
                    </select>
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" multiple disabled={adminUploading}
                    onChange={e => e.target.files && adminUpload(e.target.files)} />
                  <div
                    onClick={() => !adminUploading && fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); if (!adminUploading) setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault(); setIsDragging(false);
                      if (!adminUploading && e.dataTransfer.files.length) adminUpload(e.dataTransfer.files);
                    }}
                    className={`flex flex-col items-center justify-center border-2 border-dashed py-5 transition select-none ${
                      adminUploading ? "border-ink/30 bg-ink/5 cursor-wait"
                        : isDragging ? "border-smblue bg-smblue/5 cursor-copy"
                        : "border-line hover:border-ink hover:bg-ink/5 cursor-pointer"
                    }`}
                  >
                    {adminUploading ? (
                      <div className="flex items-center gap-2 text-[12px] text-dim">
                        <span className="animate-spin w-3 h-3 border-2 border-dim/30 border-t-ink rounded-full inline-block" />
                        업로드 중...
                      </div>
                    ) : isDragging ? (
                      <div className="text-center">
                        <div className="text-[20px] text-smblue mb-1">↓</div>
                        <div className="text-[12px] font-medium text-smblue">여기에 놓으세요</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-[20px] text-dim mb-1">↑</div>
                        <div className="text-[12px] font-medium">클릭하여 파일 선택</div>
                        <div className="text-[11px] text-dim mt-1">또는 파일을 여기로 드래그</div>
                      </div>
                    )}
                  </div>
                </Section>
                <Section title="업로드된 파일">
                  {filesLoading ? (
                    <div className="text-[12px] text-dim animate-pulse">로딩 중...</div>
                  ) : fullFiles.length === 0 ? (
                    <div className="text-[12px] text-dim">업로드된 파일이 없습니다.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {fullFiles.map(f => (
                        <div key={f.id} className="flex items-center gap-2 border border-line px-3 py-2">
                          <span className="text-[10px] text-dim shrink-0 w-16">{FILE_TYPE_KO[f.fileType] ?? f.fileType}</span>
                          <span className="flex-1 text-[12px] truncate">{f.fileName}</span>
                          {f.fileUrl.startsWith("http") && (
                            <a href={f.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-smblue hover:underline shrink-0">보기</a>
                          )}
                          <button onClick={() => deleteFile(f.id)} disabled={deletingFileId === f.id}
                            className="text-[10px] text-red-400 hover:text-red-600 shrink-0 disabled:opacity-40">
                            {deletingFileId === f.id ? "…" : "삭제"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
                <Section title="관리자 메모">
                  <textarea rows={3} value={editNote} onChange={e => setEditNote(e.target.value)}
                    placeholder="수리 원인, 교체 부품 등 내부 메모 (고객에게 보이지 않음)"
                    className="w-full border border-line px-3 py-2.5 text-[13px] focus:outline-none focus:border-ink bg-paper resize-none" />
                  <button onClick={saveNote} disabled={saving}
                    className="w-full mt-3 py-3 bg-ink text-paper text-[13px] font-semibold hover:bg-edred transition disabled:opacity-40">
                    {saving ? "저장 중..." : "저장"}
                  </button>
                </Section>
              </>
            )}

            {/* ── 발송 ── */}
            {activeTab === "send" && (
              <>
                <Section title="1단계 — 수리 견적서">
                  <p className="text-[12px] text-dim mb-3">수리 견적서 PDF만 발송합니다. 수리 진행 여부 확인 단계에서 사용하세요.</p>
                  {curRepair.totalAmount <= 0 && (
                    <p className="text-[12px] text-amber-600 mb-3">수리작업 탭에서 금액을 먼저 저장하세요.</p>
                  )}
                  <div className="flex gap-2">
                    <a href={`/api/admin/repairs/${repair.id}/send-quote`} target="_blank" rel="noopener noreferrer"
                      className="border border-line px-4 py-2 text-[12px] hover:bg-ink/5 transition">PDF 저장</a>
                    {curRepair.contactEmail ? (
                      <button
                        onClick={async () => {
                          if (!confirm(`${curRepair.contactEmail}으로 수리 견적서를 발송하시겠습니까?`)) return;
                          const res = await fetch(`/api/admin/repairs/${repair.id}/send-quote`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ adminNote: editNote }),
                          });
                          const data = await res.json();
                          if (res.ok) alert(`발송 완료: ${data.sentTo}`);
                          else alert(`발송 실패: ${data.error}`);
                        }}
                        className="bg-smblue text-paper px-4 py-2 text-[12px] hover:brightness-110 transition">
                        견적서 발송
                      </button>
                    ) : <span className="text-[11px] text-dim self-center">이메일 없음</span>}
                  </div>
                </Section>
                <Section title="2단계 — 수리 완료 서류 일괄 발송">
                  <p className="text-[12px] text-dim mb-3">수리 완료 후 4가지 서류를 한 번에 발송합니다.</p>
                  {completionSummary === null ? (
                    <button onClick={async () => {
                      const res = await fetch(`/api/admin/repairs/${repair.id}/send-completion`);
                      const data = await res.json();
                      if (!res.ok) { alert(`오류: ${data.error ?? "현황 조회 실패"}`); return; }
                      setCompletionSummary(data);
                    }} className="w-full py-2 border border-line text-[12px] text-dim hover:border-ink hover:text-ink transition">
                      파일 현황 확인 (클릭 시 최신 정보 조회)
                    </button>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {[
                        { label: "거래명세표", ok: completionSummary.deliveryNote, note: "자동 생성" },
                        { label: "검사 성적서", ok: completionSummary.inspectionCert, note: "업로드 파일" },
                        { label: "분해 사진", ok: completionSummary.disassemblyPhotos > 0, note: completionSummary.disassemblyPhotos > 0 ? `${completionSummary.disassemblyPhotos}장` : "미업로드" },
                        { label: "통장 사본", ok: completionSummary.bankCopy, note: "업로드 파일" },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-3 text-[12px]">
                          <span className={item.ok ? "text-green-600" : "text-red-400"}>{item.ok ? "✓" : "✗"}</span>
                          <span className="w-24 font-medium">{item.label}</span>
                          <span className="text-dim text-[11px]">{item.note}</span>
                          {!item.ok && item.label !== "거래명세표" && (
                            <span className="text-[10px] text-amber-600">수리작업 탭에서 업로드</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {completionSummary && (
                    <>
                      {!completionSummary.hasEmail && <p className="text-[12px] text-red-500 mb-2">이메일 없음 — 접수정보 탭 확인</p>}
                      {!completionSummary.hasAmount && <p className="text-[12px] text-amber-600 mb-2">금액 미입력 — 수리작업 탭에서 저장</p>}
                      <button
                        disabled={sendingCompletion || !completionSummary.hasEmail || !completionSummary.hasAmount}
                        onClick={async () => {
                          if (!confirm(`${curRepair.contactEmail}으로 수리 완료 서류를 발송하시겠습니까?`)) return;
                          setSendingCompletion(true);
                          try {
                            const res = await fetch(`/api/admin/repairs/${repair.id}/send-completion`, { method: "POST" });
                            const data = await res.json();
                            if (res.ok) {
                              const msg = data.warning
                                ? `발송 완료\n수신: ${data.sentTo}\n첨부: ${data.attachedFiles?.join(", ")}\n\n⚠️ ${data.warning}`
                                : `발송 완료\n수신: ${data.sentTo}\n첨부: ${data.attachedFiles?.join(", ")}`;
                              alert(msg); onRefresh();
                            } else { alert(`발송 실패: ${data.error}`); }
                          } finally { setSendingCompletion(false); }
                        }}
                        className="w-full py-3 bg-ink text-paper text-[12px] font-semibold hover:bg-edred transition disabled:opacity-40">
                        {sendingCompletion ? "발송 중..." : "수리 완료 서류 일괄 발송"}
                      </button>
                    </>
                  )}
                  {curRepair.docsSentAt && (
                    <p className="mono text-[10px] text-dim mt-2">
                      최근 발송: {formatDate(curRepair.docsSentAt)} ({curRepair.docsSentCount}회)
                    </p>
                  )}
                </Section>
              </>
            )}

            {/* ── 블로그 ── */}
            {activeTab === "blog" && (
              <Section title="수리 사례 블로그">
                {blogPublishedId ? (
                  <div className="space-y-2">
                    <p className="text-[12px] text-green-700 font-semibold">블로그에 발행되었습니다.</p>
                    <a href={`/blog/${blogPublishedId}`} target="_blank" rel="noopener noreferrer"
                      className="text-[12px] text-edred hover:underline">발행된 글 확인하기 →</a>
                  </div>
                ) : blogDraft ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-dim block mb-1">제목</label>
                      <input type="text" value={blogDraft.title}
                        onChange={e => setBlogDraft(d => d ? { ...d, title: e.target.value } : null)}
                        className="w-full border border-line px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-paper" />
                    </div>
                    <div>
                      <label className="text-[11px] text-dim block mb-1">메타 설명</label>
                      <input type="text" value={blogDraft.metaDesc}
                        onChange={e => setBlogDraft(d => d ? { ...d, metaDesc: e.target.value } : null)}
                        className="w-full border border-line px-3 py-2 text-[12px] focus:outline-none focus:border-ink bg-paper" />
                    </div>
                    <div>
                      <label className="text-[11px] text-dim block mb-1">태그</label>
                      <input type="text" value={blogDraft.tags}
                        onChange={e => setBlogDraft(d => d ? { ...d, tags: e.target.value } : null)}
                        className="w-full border border-line px-3 py-2 text-[12px] focus:outline-none focus:border-ink bg-paper" />
                    </div>
                    <div>
                      <label className="text-[11px] text-dim block mb-1">본문 미리보기</label>
                      <div className="bg-ink/5 border border-line px-3 py-2 text-[11px] max-h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {blogDraft.content.slice(0, 400)}…
                      </div>
                    </div>
                    {blogPhotoUrls.length > 0 && <p className="text-[11px] text-dim">분해 사진 {blogPhotoUrls.length}장 포함 예정</p>}
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

// ── 메인 페이지 ──────────────────────────────────
export default function AdminRepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = useCallback(async () => {
    const q = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/repairs${q}`);
    const data = await res.json();
    setRepairs(data.repairs ?? []);
    setTotal(data.total ?? 0);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">— 온라인 수리접수</div>
          <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink">
            수리 <span className="italic text-smblue">현황</span>
          </h1>
          <p className="mt-3 text-[13px] dim">온라인 수리접수 관리 · 총 {total}건</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/repair-kits"
            className="text-[12px] border hair px-3 py-1.5 hover:border-ink transition mono text-dim">
            수리키트 설정 →
          </a>
          <button onClick={load} className="text-[12px] border hair px-3 py-1.5 hover:border-ink transition mono">
            새로고침
          </button>
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", ...STATUS_FLOW, "CANCELLED"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-[11px] mono px-3 py-1.5 border transition ${
              statusFilter === s ? "bg-ink text-paper border-ink" : "border-line hover:border-ink text-dim"
            }`}>
            {s === "ALL" ? "전체" : STATUS_LABELS[s]?.label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div>
        <div className="mono text-[11px] dim tracking-[0.12em] uppercase mb-3">
          — 접수 이력 ({repairs.length}건)
        </div>
        {repairs.length === 0 ? (
          <div className="border hair bg-paper/50 px-6 py-10 text-center text-[13px] dim">
            접수 내역이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {repairs.map(r => (
              <RepairRow key={r.id} repair={r} onRefresh={load} />
            ))}
          </div>
        )}
      </div>
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
