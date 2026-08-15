"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

type ReportItem = {
  id: number;
  section: string; // CHECKLIST | MEASUREMENT | PART
  sortOrder: number;
  label: string;
  isChecked: boolean;
  specValue: string | null;
  measured: string | null;
  judgment: string | null;
  quantity: string | null;
  partNo: string | null;
  remark: string | null;
};

type ReportInfo = {
  id: number;
  reportNo: string;
  pumpModel: string;
  pumpSerial: string | null;
  pumpLocation: string | null;
  status: string;
  symptomText: string | null;
  reasonText: string | null;
  items: ReportItem[];
};

let tmpId = -1;

export default function SubmitClient() {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<ReportInfo | null>(null);
  const [error, setError] = useState("");
  const [items, setItems] = useState<ReportItem[]>([]);
  const [symptomText, setSymptomText] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [disassemblyFiles, setDisassemblyFiles] = useState<File[]>([]);
  const [maintenanceFiles, setMaintenanceFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const disassemblyRef = useRef<HTMLInputElement>(null);
  const maintenanceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/repair-report/submit/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setReport(data);
        setItems(data.items);
        setSymptomText(data.symptomText ?? "");
        setReasonText(data.reasonText ?? "");
      })
      .catch(() => setError("불러오기 실패. 다시 시도해주세요."));
  }, [token]);

  function updateItem(id: number, field: keyof ReportItem, value: string | boolean) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function addRow(section: "MEASUREMENT" | "PART") {
    setItems((prev) => [
      ...prev,
      {
        id: tmpId--,
        section,
        sortOrder: prev.filter((it) => it.section === section).length,
        label: "",
        isChecked: false,
        specValue: null,
        measured: null,
        judgment: null,
        quantity: null,
        partNo: null,
        remark: null,
      },
    ]);
  }

  function removeRow(id: number) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const form = new FormData();
      disassemblyFiles.forEach((f) => form.append("files_DISASSEMBLY", f));
      maintenanceFiles.forEach((f) => form.append("files_MAINTENANCE", f));
      form.append("symptomText", symptomText);
      form.append("reasonText", reasonText);
      form.append(
        "items",
        JSON.stringify(items.map((it) => ({ ...it, id: it.id > 0 ? it.id : undefined })))
      );
      const res = await fetch(`/api/repair-report/submit/${token}`, { method: "POST", body: form });
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

  if (!report) return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="mono text-[12px] dim animate-pulse">— Loading</div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="text-center">
        <div className="text-[48px] mb-4 text-green-600">✓</div>
        <p className="text-[18px] font-bold text-ink mb-2">제출 완료</p>
        <p className="text-[14px] dim">수선보고서가 스마텍으로 전송됐습니다.</p>
        <p className="text-[13px] dim mt-1">감사합니다.</p>
      </div>
    </div>
  );

  if (report.status !== "DRAFT" && report.status !== "SENT_TO_SUB") return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="text-center">
        <div className="text-[40px] mb-4">✓</div>
        <p className="text-[15px] font-semibold text-ink">이미 제출된 보고서입니다.</p>
        <p className="text-[13px] dim mt-1">추가 수정이 필요하면 스마텍 담당자에게 문의해주세요.</p>
      </div>
    </div>
  );

  const checklist = items.filter((it) => it.section === "CHECKLIST");
  const measurements = items.filter((it) => it.section === "MEASUREMENT");
  const parts = items.filter((it) => it.section === "PART");

  return (
    <div className="min-h-screen bg-paper pb-16">
      <div className="bg-ink text-paper px-5 py-4">
        <div className="mono text-[10px] dim tracking-[0.15em] mb-1">SMARTECH — 외주 수선보고서 작성</div>
        <div className="text-[18px] font-bold">{report.pumpModel}</div>
        <div className="mono text-[12px] text-paper/60 mt-0.5">
          {report.reportNo}{report.pumpSerial ? ` · S/N ${report.pumpSerial}` : ""}
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
        {/* 01 이상현상 / 수리사유 */}
        <div className="border hair bg-white">
          <div className="px-4 py-3 border-b hair">
            <span className="mono text-[10px] dim tracking-[0.12em]">01 / 이상현상 · 수리사유</span>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div>
              <label className="text-[12px] font-semibold text-ink block mb-1">이상현상</label>
              <textarea
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                rows={2}
                className="w-full border hair px-3 py-2 text-[13px] focus:outline-none focus:border-ink"
                placeholder="예) DP power high 발생"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-ink block mb-1">수리사유</label>
              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                rows={2}
                className="w-full border hair px-3 py-2 text-[13px] focus:outline-none focus:border-ink"
                placeholder="예) DP LV rotor & plate 갈림"
              />
            </div>
          </div>
        </div>

        {/* 02 예상수리내용 체크리스트 */}
        <div className="border hair bg-white">
          <div className="px-4 py-3 border-b hair">
            <span className="mono text-[10px] dim tracking-[0.12em]">02 / 예상수리내용 체크리스트</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {checklist.map((it) => (
              <label key={it.id} className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={it.isChecked}
                  onChange={(e) => updateItem(it.id, "isChecked", e.target.checked)}
                  className="w-4 h-4 accent-ink"
                />
                {it.label}
              </label>
            ))}
          </div>
        </div>

        {/* 03 측정치표 */}
        <div className="border hair bg-white">
          <div className="px-4 py-3 border-b hair flex items-center justify-between">
            <span className="mono text-[10px] dim tracking-[0.12em]">03 / 측정치표</span>
            <button onClick={() => addRow("MEASUREMENT")} className="text-[11px] text-smblue font-semibold">+ 행 추가</button>
          </div>
          <div className="px-4 py-2">
            <div className="grid grid-cols-[1.5fr_1.3fr_1.3fr_1fr_auto] gap-1 py-2 border-b hair">
              {["항목", "정상치", "측정치", "판정", ""].map((h) => (
                <div key={h} className="mono text-[9px] dim tracking-[0.08em] uppercase">{h}</div>
              ))}
            </div>
            {measurements.map((it) => (
              <div key={it.id} className="grid grid-cols-[1.5fr_1.3fr_1.3fr_1fr_auto] gap-1 py-2 border-b hair last:border-0 items-center">
                <input type="text" value={it.label} onChange={(e) => updateItem(it.id, "label", e.target.value)}
                  placeholder="HV rotor" className="border hair px-2 py-1 text-[12px] focus:outline-none focus:border-ink" />
                <input type="text" value={it.specValue ?? ""} onChange={(e) => updateItem(it.id, "specValue", e.target.value)}
                  placeholder="23.93~23.95mm" className="border hair px-2 py-1 text-[12px] mono focus:outline-none focus:border-ink" />
                <input type="text" value={it.measured ?? ""} onChange={(e) => updateItem(it.id, "measured", e.target.value)}
                  placeholder="23.901mm" className="border hair px-2 py-1 text-[12px] mono focus:outline-none focus:border-ink" />
                <input type="text" value={it.judgment ?? ""} onChange={(e) => updateItem(it.id, "judgment", e.target.value)}
                  placeholder="교체" className="border hair px-2 py-1 text-[12px] focus:outline-none focus:border-ink" />
                <button onClick={() => removeRow(it.id)} className="text-[11px] text-edred px-1">삭제</button>
              </div>
            ))}
            {measurements.length === 0 && <p className="text-[12px] dim py-3">측정 항목이 없습니다. &quot;+ 행 추가&quot;로 입력하세요.</p>}
          </div>
        </div>

        {/* 04 부품교환내역 */}
        <div className="border hair bg-white">
          <div className="px-4 py-3 border-b hair flex items-center justify-between">
            <span className="mono text-[10px] dim tracking-[0.12em]">04 / 부품교환내역</span>
            <button onClick={() => addRow("PART")} className="text-[11px] text-smblue font-semibold">+ 행 추가</button>
          </div>
          <div className="px-4 py-2">
            <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-1 py-2 border-b hair">
              {["부품명", "수량", "품번", ""].map((h) => (
                <div key={h} className="mono text-[9px] dim tracking-[0.08em] uppercase">{h}</div>
              ))}
            </div>
            {parts.map((it) => (
              <div key={it.id} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-1 py-2 border-b hair last:border-0 items-center">
                <input type="text" value={it.label} onChange={(e) => updateItem(it.id, "label", e.target.value)}
                  placeholder="DP LV rotor 3ea" className="border hair px-2 py-1 text-[12px] focus:outline-none focus:border-ink" />
                <input type="text" value={it.quantity ?? ""} onChange={(e) => updateItem(it.id, "quantity", e.target.value)}
                  placeholder="x3" className="border hair px-2 py-1 text-[12px] mono focus:outline-none focus:border-ink" />
                <input type="text" value={it.partNo ?? ""} onChange={(e) => updateItem(it.id, "partNo", e.target.value)}
                  placeholder="품번(선택)" className="border hair px-2 py-1 text-[12px] mono focus:outline-none focus:border-ink" />
                <button onClick={() => removeRow(it.id)} className="text-[11px] text-edred px-1">삭제</button>
              </div>
            ))}
            {parts.length === 0 && <p className="text-[12px] dim py-3">교환 부품이 없습니다. &quot;+ 행 추가&quot;로 입력하세요.</p>}
          </div>
        </div>

        {/* 05 분해사진 */}
        <div className="border hair bg-white">
          <div className="px-4 py-3 border-b hair">
            <span className="mono text-[10px] dim tracking-[0.12em]">05 / 분해사진</span>
          </div>
          <div className="px-4 py-4 space-y-3">
            <input ref={disassemblyRef} type="file" multiple accept="image/*" className="hidden"
              onChange={(e) => setDisassemblyFiles(Array.from(e.target.files ?? []))} />
            <button onClick={() => disassemblyRef.current?.click()}
              className="border hair px-4 py-2 text-[13px] hover:bg-ink/5 transition-colors w-full text-left">
              📎 사진 선택 {disassemblyFiles.length > 0 && <span className="text-smblue font-semibold">({disassemblyFiles.length}장 선택됨)</span>}
            </button>
            {disassemblyFiles.length > 0 && (
              <div className="space-y-1">
                {disassemblyFiles.map((f, i) => (
                  <div key={i} className="mono text-[11px] dim flex justify-between">
                    <span>{f.name}</span><span>{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 06 정비사진 */}
        <div className="border hair bg-white">
          <div className="px-4 py-3 border-b hair">
            <span className="mono text-[10px] dim tracking-[0.12em]">06 / 정비사진</span>
          </div>
          <div className="px-4 py-4 space-y-3">
            <input ref={maintenanceRef} type="file" multiple accept="image/*" className="hidden"
              onChange={(e) => setMaintenanceFiles(Array.from(e.target.files ?? []))} />
            <button onClick={() => maintenanceRef.current?.click()}
              className="border hair px-4 py-2 text-[13px] hover:bg-ink/5 transition-colors w-full text-left">
              📎 사진 선택 {maintenanceFiles.length > 0 && <span className="text-smblue font-semibold">({maintenanceFiles.length}장 선택됨)</span>}
            </button>
            {maintenanceFiles.length > 0 && (
              <div className="space-y-1">
                {maintenanceFiles.map((f, i) => (
                  <div key={i} className="mono text-[11px] dim flex justify-between">
                    <span>{f.name}</span><span>{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-smblue text-paper py-3 text-[14px] font-semibold hover:brightness-110 transition-all disabled:opacity-50"
        >
          {submitting ? "제출 중..." : "수선보고서 제출"}
        </button>
      </div>
    </div>
  );
}
