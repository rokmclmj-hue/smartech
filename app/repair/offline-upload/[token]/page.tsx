"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

type InspectionItem = {
  id: number;
  sortOrder: number;
  itemLabel: string;
  unit: string | null;
  spec: string | null;
  value: string | null;
  isNA: boolean;
  remark: string | null;
};

type JobInfo = {
  jobNo: string;
  pumpMaker: string;
  pumpModel: string;
  serialNo: string | null;
  status: string;
  tokenExpiresAt: string;
  inspectionItems: InspectionItem[];
  files: { id: number; fileName: string; fileType: string }[];
};

export default function OfflineUploadPage() {
  const { token } = useParams<{ token: string }>();
  const [job, setJob] = useState<JobInfo | null>(null);
  const [error, setError] = useState("");
  const [items, setItems] = useState<InspectionItem[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const excelRef = useRef<HTMLInputElement>(null);
  const [excelParsing, setExcelParsing] = useState(false);
  const [excelResult, setExcelResult] = useState<string>("");

  useEffect(() => {
    fetch(`/api/repair/offline-upload?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setJob(data);
        setItems(data.inspectionItems);
      })
      .catch(() => setError("불러오기 실패. 다시 시도해주세요."));
  }, [token]);

  function updateItem(id: number, field: keyof InspectionItem, value: string | boolean) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: value } : it));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      form.append("items", JSON.stringify(
        items.map((it) => ({ id: it.id, value: it.value, isNA: it.isNA, remark: it.remark }))
      ));
      const res = await fetch(`/api/repair/offline-upload?token=${token}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "제출 오류"); return; }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="text-center">
        <div className="text-[40px] mb-4">✗</div>
        <p className="text-[15px] text-ink font-semibold mb-2">{error}</p>
        <p className="text-[13px] dim">스마텍 담당자에게 문의해주세요.</p>
      </div>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="mono text-[12px] dim animate-pulse">— Loading</div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="text-center">
        <div className="text-[48px] mb-4 text-green-600">✓</div>
        <p className="text-[18px] font-bold text-ink mb-2">제출 완료</p>
        <p className="text-[14px] dim">검사성적서와 파일이 스마텍으로 전송됐습니다.</p>
        <p className="text-[13px] dim mt-1">감사합니다.</p>
      </div>
    </div>
  );

  if (job.status === "UPLOADED") return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="text-center">
        <div className="text-[40px] mb-4">✓</div>
        <p className="text-[15px] font-semibold text-ink">이미 제출된 검사성적서입니다.</p>
        <p className="text-[13px] dim mt-1">추가 업로드가 필요하면 스마텍 담당자에게 문의해주세요.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper pb-16">
      {/* 헤더 */}
      <div className="bg-ink text-paper px-5 py-4">
        <div className="mono text-[10px] dim tracking-[0.15em] mb-1">SMARTECH — 협력사 검사성적서</div>
        <div className="text-[18px] font-bold">{job.pumpMaker} {job.pumpModel}</div>
        <div className="mono text-[12px] text-paper/60 mt-0.5">
          {job.jobNo}{job.serialNo ? ` · S/N ${job.serialNo}` : ""}
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">

        {/* 01 분해사진 업로드 */}
        <div className="border hair bg-white">
          <div className="px-4 py-3 border-b hair">
            <span className="mono text-[10px] dim tracking-[0.12em]">01 / 분해사진 업로드</span>
          </div>
          <div className="px-4 py-4 space-y-3">
            <p className="text-[13px] dim">사진 파일(JPG·PNG) 또는 ZIP 압축파일을 업로드해주세요.</p>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.zip,.7z"
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="border hair px-4 py-2 text-[13px] hover:bg-ink/5 transition-colors w-full text-left"
            >
              📎 파일 선택 {files.length > 0 && <span className="text-smblue font-semibold">({files.length}개 선택됨)</span>}
            </button>
            {files.length > 0 && (
              <div className="space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="mono text-[11px] dim flex justify-between">
                    <span>{f.name}</span>
                    <span>{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 02 엑셀 성적서 자동 입력 */}
        <div className="border hair bg-white">
          <div className="px-4 py-3 border-b hair flex items-center justify-between">
            <span className="mono text-[10px] dim tracking-[0.12em]">02 / 엑셀 성적서 자동 입력 <span className="text-edred">(권장)</span></span>
          </div>
          <div className="px-4 py-4 space-y-3">
            <p className="text-[13px] dim">기존에 사용하시던 엑셀 성적서 파일을 업로드하면 아래 검사항목이 자동으로 채워집니다.</p>
            <input
              ref={excelRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setExcelParsing(true);
                setExcelResult("");
                try {
                  const form = new FormData();
                  form.append("file", file);
                  const res = await fetch(`/api/repair/offline-upload/parse-excel?token=${token}`, {
                    method: "POST",
                    body: form,
                  });
                  const data = await res.json();
                  if (!res.ok) { setExcelResult(`오류: ${data.error}`); return; }
                  // 파싱 후 서버에서 최신 항목 다시 불러오기
                  const refreshed = await fetch(`/api/repair/offline-upload?token=${token}`).then(r => r.json()).catch(() => null);
                  if (Array.isArray(refreshed?.inspectionItems)) setItems(refreshed.inspectionItems);
                  setExcelResult(`✓ ${data.matched}개 항목 자동 입력 완료. 아래에서 확인 후 수정하세요.`);
                } catch { setExcelResult("파싱 실패. 직접 입력해주세요."); }
                finally { setExcelParsing(false); if (excelRef.current) excelRef.current.value = ""; }
              }}
            />
            <button
              onClick={() => excelRef.current?.click()}
              disabled={excelParsing}
              className="border hair px-4 py-2 text-[13px] hover:bg-ink/5 transition-colors w-full text-left disabled:opacity-50"
            >
              {excelParsing ? "⏳ 파싱 중..." : "📊 엑셀 성적서 파일 선택 (.xlsx)"}
            </button>
            {excelResult && (
              <p className={`text-[12px] ${excelResult.startsWith("✓") ? "text-green-700" : "text-edred"}`}>{excelResult}</p>
            )}
          </div>
        </div>

        {/* 03 검사성적서 */}
        <div className="border hair bg-white">
          <div className="px-4 py-3 border-b hair">
            <span className="mono text-[10px] dim tracking-[0.12em]">03 / 검사성적서 — 확인 및 수정</span>
          </div>
          <div className="px-4 py-2">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[2fr_1fr_1.5fr_2fr_1fr] gap-1 py-2 border-b hair">
              {["항목", "단위", "기준", "측정값", "N/A"].map((h) => (
                <div key={h} className="mono text-[9px] dim tracking-[0.08em] uppercase">{h}</div>
              ))}
            </div>
            {/* 항목 행 */}
            {items.map((item) => (
              <div key={item.id} className={`grid grid-cols-[2fr_1fr_1.5fr_2fr_1fr] gap-1 py-2 border-b hair last:border-0 items-center ${item.isNA ? "opacity-40" : ""}`}>
                <div className="text-[12px] font-medium leading-tight">{item.itemLabel}</div>
                <div className="mono text-[11px] dim">{item.unit}</div>
                <div className="mono text-[11px] dim">{item.spec}</div>
                <input
                  type="text"
                  value={item.value ?? ""}
                  disabled={item.isNA}
                  onChange={(e) => updateItem(item.id, "value", e.target.value)}
                  placeholder="측정값"
                  className="border hair px-2 py-1 text-[12px] mono focus:outline-none focus:border-ink disabled:bg-ink/5"
                />
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={item.isNA}
                    onChange={(e) => updateItem(item.id, "isNA", e.target.checked)}
                    className="w-4 h-4 accent-ink"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 pb-3">
            <p className="text-[11px] dim">· 해당 없는 항목은 N/A에 체크해주세요.</p>
          </div>
        </div>

        {/* 제출 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-smblue text-paper py-3 text-[14px] font-semibold hover:brightness-110 transition-all disabled:opacity-50"
        >
          {submitting ? "제출 중..." : "검사성적서 + 파일 제출"}
        </button>

        <p className="text-center mono text-[10px] dim">
          링크 유효기간: {new Date(job.tokenExpiresAt).toLocaleDateString("ko-KR")}
        </p>
      </div>
    </div>
  );
}
