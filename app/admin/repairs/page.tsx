"use client";

import { useEffect, useState, useCallback } from "react";

type RepairFile = { fileType: string };
type UploadToken = { id: string; expiresAt: string; usedAt: string | null };
type Repair = {
  id: number;
  repairNo: string;
  pumpMaker: string;
  pumpModel: string;
  pumpFamily: string;
  status: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  company: string | null;
  baseAmount: number;
  extraAmount: number;
  totalAmount: number;
  adminNote: string | null;
  symptoms: string[];
  symptomNote: string | null;
  createdAt: string;
  files: RepairFile[];
  uploadTokens: UploadToken[];
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  RECEIVED:    { label: "접수완료",  color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "수리진행",  color: "bg-yellow-100 text-yellow-700" },
  INSPECTION:  { label: "검사중",    color: "bg-purple-100 text-purple-700" },
  COMPLETED:   { label: "수리완료",  color: "bg-green-100 text-green-700" },
  DELIVERED:   { label: "납품완료",  color: "bg-ink/10 text-dim" },
  CANCELLED:   { label: "취소",      color: "bg-red-100 text-red-700" },
};

const STATUS_FLOW = ["RECEIVED", "IN_PROGRESS", "INSPECTION", "COMPLETED", "DELIVERED"];

function formatPrice(n: number) {
  return n > 0 ? n.toLocaleString("ko-KR") + "원" : "—";
}
function formatDate(s: string) {
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

export default function AdminRepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<Repair | null>(null);
  const [saving, setSaving] = useState(false);
  const [editNote, setEditNote] = useState("");
  const [editExtra, setEditExtra] = useState("");

  const load = useCallback(async () => {
    const q = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/repairs${q}`);
    const data = await res.json();
    setRepairs(data.repairs ?? []);
    setTotal(data.total ?? 0);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  function openDetail(r: Repair) {
    setSelected(r);
    setEditNote(r.adminNote ?? "");
    setEditExtra(r.extraAmount > 0 ? String(r.extraAmount) : "");
  }

  async function updateStatus(newStatus: string) {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/repairs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          status: newStatus,
          adminNote: editNote || null,
          extraAmount: editExtra ? Number(editExtra) : 0,
        }),
      });
      if (!res.ok) throw new Error();
      await load();
      setSelected(null);
    } catch {
      alert("저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch("/api/admin/repairs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          status: selected.status,
          adminNote: editNote || null,
          extraAmount: editExtra ? Number(editExtra) : 0,
        }),
      });
      await load();
      setSelected(null);
    } finally {
      setSaving(false);
    }
  }

  const fileCount = (r: Repair, type: string) =>
    r.files.filter((f) => f.fileType === type).length;

  return (
    <div className="p-6 max-w-7xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">수리 접수 현황</h1>
          <p className="text-[13px] text-dim mt-0.5">총 {total}건</p>
        </div>
        <button
          onClick={load}
          className="text-[12px] border border-line px-3 py-1.5 hover:border-ink transition mono"
        >
          새로고침
        </button>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["ALL", ...STATUS_FLOW, "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-[11px] mono px-3 py-1.5 border transition ${
              statusFilter === s
                ? "bg-ink text-paper border-ink"
                : "border-line hover:border-ink text-dim"
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
              <tr>
                <td colSpan={7} className="text-center py-12 text-dim text-[13px]">
                  접수 내역이 없습니다.
                </td>
              </tr>
            )}
            {repairs.map((r) => {
              const st = STATUS_LABELS[r.status];
              const photoCount = fileCount(r, "disassembly_photo");
              const certCount = fileCount(r, "inspection_cert");
              return (
                <tr
                  key={r.id}
                  onClick={() => openDetail(r)}
                  className="border-b border-line hover:bg-paper/80 cursor-pointer transition"
                >
                  <td className="px-4 py-3 mono font-semibold text-[12px]">{r.repairNo}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.pumpModel}</div>
                    <div className="text-[11px] text-dim">{r.pumpMaker}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{r.contactName}</div>
                    {r.company && <div className="text-[11px] text-dim">{r.company}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${st?.color}`}>
                      {st?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular">
                    {r.totalAmount > 0 ? (
                      <div>
                        <div className="font-semibold">{formatPrice(r.totalAmount)}</div>
                        {r.extraAmount > 0 && (
                          <div className="text-[10px] text-dim">+{formatPrice(r.extraAmount)}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-dim text-[11px]">상담필요</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {photoCount > 0 && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                          사진 {photoCount}
                        </span>
                      )}
                      {certCount > 0 && (
                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">
                          성적서 {certCount}
                        </span>
                      )}
                      {photoCount === 0 && certCount === 0 && (
                        <span className="text-[10px] text-dim">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dim text-[11px] mono">{formatDate(r.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 상세 패널 */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          {/* 배경 */}
          <div
            className="flex-1 bg-ink/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          {/* 패널 */}
          <div className="w-full max-w-lg bg-paper overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-paper border-b border-line px-6 py-4 flex items-center justify-between z-10">
              <div>
                <div className="mono text-[11px] text-dim mb-0.5">{selected.repairNo}</div>
                <div className="font-bold text-[16px]">{selected.pumpMaker} {selected.pumpModel}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-dim hover:text-ink text-xl leading-none">×</button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* 현재 상태 */}
              <div>
                <div className="mono text-[10px] text-dim tracking-widest mb-3">현재 상태</div>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_FLOW.map((s) => {
                    const st = STATUS_LABELS[s];
                    const isCurrent = selected.status === s;
                    return (
                      <button
                        key={s}
                        disabled={saving}
                        onClick={() => updateStatus(s)}
                        className={`text-[12px] px-3 py-1.5 border transition font-medium ${
                          isCurrent
                            ? "bg-ink text-paper border-ink"
                            : "border-line hover:border-ink text-dim hover:text-ink"
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-dim mt-2">클릭하면 상태가 변경되고 고객에게 SMS가 발송됩니다.</p>
              </div>

              {/* 장비 / 증상 */}
              <div className="border border-line p-4 space-y-2 text-[13px]">
                <div className="mono text-[10px] text-dim tracking-widest mb-2">접수 정보</div>
                <Row label="장비" value={`${selected.pumpMaker} ${selected.pumpModel}`} />
                <Row label="증상" value={selected.symptoms.join(", ")} />
                {selected.symptomNote && <Row label="메모" value={selected.symptomNote} />}
              </div>

              {/* 연락처 */}
              <div className="border border-line p-4 space-y-2 text-[13px]">
                <div className="mono text-[10px] text-dim tracking-widest mb-2">연락처</div>
                <Row label="담당자" value={selected.contactName} />
                {selected.company && <Row label="회사" value={selected.company} />}
                <Row label="전화"
                  value={
                    <a href={`tel:${selected.contactPhone}`} className="text-edred hover:underline">
                      {selected.contactPhone}
                    </a>
                  }
                />
                {selected.contactEmail && (
                  <Row label="이메일"
                    value={
                      <a href={`mailto:${selected.contactEmail}`} className="text-edred hover:underline">
                        {selected.contactEmail}
                      </a>
                    }
                  />
                )}
              </div>

              {/* 금액 */}
              <div className="border border-line p-4 space-y-3 text-[13px]">
                <div className="mono text-[10px] text-dim tracking-widest mb-2">견적 금액</div>
                <Row label="기본 수리비" value={selected.baseAmount > 0 ? formatPrice(selected.baseAmount) : "상담필요"} />
                <div>
                  <label className="text-[11px] text-dim block mb-1">추가 파트비 (원)</label>
                  <input
                    type="number"
                    value={editExtra}
                    onChange={(e) => setEditExtra(e.target.value)}
                    placeholder="0"
                    className="w-full border border-line px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-paper"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-line font-bold">
                  <span>최종 합계</span>
                  <span className="tabular text-[16px]">
                    {formatPrice(selected.baseAmount + (editExtra ? Number(editExtra) : selected.extraAmount))}
                  </span>
                </div>
              </div>

              {/* 파일 현황 */}
              <div className="border border-line p-4 text-[13px]">
                <div className="mono text-[10px] text-dim tracking-widest mb-3">파일 현황</div>
                <div className="space-y-1.5">
                  <FileRow label="분해 사진" count={fileCount(selected, "disassembly_photo")} />
                  <FileRow label="검사 성적서" count={fileCount(selected, "inspection_cert")} />
                  <FileRow label="견적서 PDF" count={fileCount(selected, "quote_pdf")} />
                  <FileRow label="거래명세표" count={fileCount(selected, "delivery_note")} />
                </div>
              </div>

              {/* 관리자 메모 */}
              <div>
                <label className="text-[12px] font-medium block mb-2">관리자 메모</label>
                <textarea
                  rows={3}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="내부 메모 (고객에게 보이지 않음)"
                  className="w-full border border-line px-3 py-2.5 text-[13px] focus:outline-none focus:border-ink bg-paper resize-none"
                />
              </div>

              {/* 저장 */}
              <button
                onClick={saveNote}
                disabled={saving}
                className="w-full py-3 bg-ink text-paper text-[13px] font-semibold hover:bg-edred transition disabled:opacity-40"
              >
                {saving ? "저장 중..." : "메모 / 금액 저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-dim w-16 shrink-0">{label}</span>
      <span className="flex-1 font-medium">{value}</span>
    </div>
  );
}

function FileRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-dim">{label}</span>
      <span className={count > 0 ? "text-green-600 font-semibold" : "text-dim"}>
        {count > 0 ? `${count}개` : "없음"}
      </span>
    </div>
  );
}
