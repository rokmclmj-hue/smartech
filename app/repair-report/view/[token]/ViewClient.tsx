"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import "@/app/quote/[id]/quote-styles.css";

type ReportItem = {
  id: number;
  section: string;
  label: string;
  isChecked: boolean;
  specValue: string | null;
  measured: string | null;
  judgment: string | null;
  quantity: string | null;
  partNo: string | null;
  remark: string | null;
};
type Photo = { id: number; section: string; fileUrl: string; fileName: string };
type ReportDetail = {
  reportNo: string;
  company: { companyName: string } | null;
  pumpModel: string;
  pumpSerial: string | null;
  pumpLocation: string | null;
  pumpAssetNo: string | null;
  symptomText: string | null;
  reasonText: string | null;
  receivedDate: string;
  repairedDate: string | null;
  items: ReportItem[];
  photos: Photo[];
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

export default function ViewClient() {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/repair-report/view/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setReport(data);
        document.title = `수선보고서_${data.reportNo}_${data.pumpModel}`;
      })
      .catch(() => setError("불러오기 실패. 다시 시도해주세요."));
  }, [token]);

  if (error) return (
    <div className="quote-page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <p style={{ color: "#E74C3C", fontWeight: 600 }}>{error}</p>
      <p style={{ color: "#7A8B9D", fontSize: 13 }}>스마텍 담당자에게 문의해주세요.</p>
    </div>
  );

  if (!report) return (
    <div className="quote-page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="qmono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "#7A8B9D", textTransform: "uppercase" }}>
        — Loading ... · 수선보고서 불러오는 중
      </div>
    </div>
  );

  const checklist = report.items.filter((it) => it.section === "CHECKLIST");
  const measurements = report.items.filter((it) => it.section === "MEASUREMENT");
  const parts = report.items.filter((it) => it.section === "PART");
  const disassemblyPhotos = report.photos.filter((p) => p.section === "DISASSEMBLY");
  const maintenancePhotos = report.photos.filter((p) => p.section === "MAINTENANCE");

  return (
    <div className="quote-page rr-page">
      {/* ── 화면용 (다크 테마) ── */}
      <div className="full-version">
        <div className="stage">
          <div className="util">
            <div className="left">
              <span>FILE — repair-report</span><span>·</span>
              <span>{report.reportNo}</span>
            </div>
            <div className="right">
              <span><span className="pulse-dot" />SMARTECH VACUUM — 전문 수리 보고서</span>
              <button type="button" className="btn-export" onClick={() => window.print()}>
                [ EXPORT → PDF ]
              </button>
            </div>
          </div>

          <h1 className="rr-title">{report.pumpModel} 수선보고서</h1>
          <p className="rr-sub qmono">
            {report.company?.companyName ?? "—"}
            {report.pumpSerial ? ` · S/N ${report.pumpSerial}` : ""}
            {report.pumpLocation ? ` · ${report.pumpLocation}` : ""}
          </p>

          <div className="rr-grid">
            <div className="rr-card">
              <h3>이상현상</h3>
              <p>{report.symptomText || "—"}</p>
            </div>
            <div className="rr-card">
              <h3>수리사유</h3>
              <p>{report.reasonText || "—"}</p>
            </div>
          </div>

          <div className="rr-card">
            <h3>예상수리내용</h3>
            <ul className="rr-checklist">
              {checklist.map((it) => (
                <li key={it.id} className={it.isChecked ? "on" : ""}>
                  <span className="mark">{it.isChecked ? "✓" : "—"}</span> {it.label}
                </li>
              ))}
            </ul>
          </div>

          {measurements.length > 0 && (
            <div className="rr-card">
              <h3>측정치표</h3>
              <table className="rr-table">
                <thead><tr><th>항목</th><th>정상치</th><th>측정치</th><th>판정</th></tr></thead>
                <tbody>
                  {measurements.map((it) => (
                    <tr key={it.id}><td>{it.label}</td><td className="qmono">{it.specValue || "—"}</td><td className="qmono">{it.measured || "—"}</td><td>{it.judgment || "—"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {parts.length > 0 && (
            <div className="rr-card">
              <h3>부품교환내역</h3>
              <table className="rr-table">
                <thead><tr><th>부품명</th><th>수량</th><th>품번</th></tr></thead>
                <tbody>
                  {parts.map((it) => (
                    <tr key={it.id}><td>{it.label}</td><td className="qmono">{it.quantity || "—"}</td><td className="qmono">{it.partNo || "—"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {disassemblyPhotos.length > 0 && (
            <div className="rr-card">
              <h3>분해사진</h3>
              <div className="rr-photos">
                {disassemblyPhotos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.fileUrl} alt={p.fileName} />
                ))}
              </div>
            </div>
          )}

          {maintenancePhotos.length > 0 && (
            <div className="rr-card">
              <h3>정비사진</h3>
              <div className="rr-photos">
                {maintenancePhotos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.fileUrl} alt={p.fileName} />
                ))}
              </div>
            </div>
          )}

          <p className="rr-footer-note qmono">
            접수일 {fmtDate(report.receivedDate)} · 수리완료일 {fmtDate(report.repairedDate)}
          </p>
        </div>
      </div>

      {/* ── 인쇄용 (PDF 저장) ── */}
      <div className="pdf-only">
        <div className="p-top">
          <div className="wm">SMARTECH · REPAIR REPORT<small>수선보고서</small></div>
          <div className="meta pmono">
            <span>REPORT NO · {report.reportNo}</span>
            <span>EQUIPMENT · {report.pumpModel}</span>
            {report.pumpSerial && <span>S/N · {report.pumpSerial}</span>}
          </div>
        </div>

        <div className="p-parties">
          <div>
            <h5>수리 대상</h5>
            <div className="row"><div className="k">Company</div><div className="v">{report.company?.companyName ?? "—"}</div></div>
            <div className="row"><div className="k">Model</div><div className="v">{report.pumpModel}</div></div>
            <div className="row"><div className="k">S/N</div><div className="v pmono">{report.pumpSerial ?? "—"}</div></div>
            <div className="row"><div className="k">Location</div><div className="v">{report.pumpLocation ?? "—"}</div></div>
          </div>
          <div>
            <h5>일정</h5>
            <div className="row"><div className="k">접수일</div><div className="v pmono">{fmtDate(report.receivedDate)}</div></div>
            <div className="row"><div className="k">수리완료일</div><div className="v pmono">{fmtDate(report.repairedDate)}</div></div>
          </div>
        </div>

        <table className="p-table">
          <thead><tr><th colSpan={2}>이상현상 / 수리사유</th></tr></thead>
          <tbody>
            <tr><td style={{ width: "20mm" }}>이상현상</td><td>{report.symptomText || "—"}</td></tr>
            <tr><td>수리사유</td><td>{report.reasonText || "—"}</td></tr>
          </tbody>
        </table>

        <table className="p-table">
          <thead><tr><th>예상수리내용</th></tr></thead>
          <tbody>
            {checklist.map((it) => (
              <tr key={it.id}><td>{it.isChecked ? "☑" : "☐"} {it.label}</td></tr>
            ))}
          </tbody>
        </table>

        {measurements.length > 0 && (
          <table className="p-table">
            <thead><tr><th>항목</th><th>정상치</th><th>측정치</th><th>판정</th></tr></thead>
            <tbody>
              {measurements.map((it) => (
                <tr key={it.id}><td>{it.label}</td><td className="pmono">{it.specValue || "—"}</td><td className="pmono">{it.measured || "—"}</td><td>{it.judgment || "—"}</td></tr>
              ))}
            </tbody>
          </table>
        )}

        {parts.length > 0 && (
          <table className="p-table">
            <thead><tr><th>부품명</th><th>수량</th><th>품번</th></tr></thead>
            <tbody>
              {parts.map((it) => (
                <tr key={it.id}><td>{it.label}</td><td className="pmono">{it.quantity || "—"}</td><td className="pmono">{it.partNo || "—"}</td></tr>
              ))}
            </tbody>
          </table>
        )}

        {(disassemblyPhotos.length > 0 || maintenancePhotos.length > 0) && (
          <div className="p-photos">
            {disassemblyPhotos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.fileUrl} alt={p.fileName} />
            ))}
            {maintenancePhotos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.fileUrl} alt={p.fileName} />
            ))}
          </div>
        )}

        <div className="p-footer">
          <span>© {new Date().getFullYear()} SMARTECH CO., LTD. · Edwards Vacuum Korea Authorized Service Partner</span>
          <span>REPORT {report.reportNo}</span>
        </div>
      </div>

      <style>{`
        .rr-page .pdf-only { display: none; }
        .rr-title { font-size: 28px; font-weight: 700; margin: 24px 0 4px; }
        .rr-sub { color: var(--q-muted); font-size: 12px; margin-bottom: 24px; }
        .rr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .rr-card { background: var(--q-surface); border: 1px solid var(--q-line); padding: 16px 18px; margin-bottom: 16px; }
        .rr-card h3 { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--q-accent); margin-bottom: 10px; }
        .rr-card p { font-size: 14px; line-height: 1.6; color: var(--q-text); white-space: pre-wrap; }
        .rr-checklist { list-style: none; display: grid; gap: 6px; }
        .rr-checklist li { font-size: 13px; color: var(--q-text-dim); }
        .rr-checklist li.on { color: var(--q-text); }
        .rr-checklist .mark { display: inline-block; width: 16px; color: var(--q-success); }
        .rr-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .rr-table th, .rr-table td { border-bottom: 1px solid var(--q-line-soft); padding: 8px 10px; text-align: left; }
        .rr-table th { color: var(--q-muted); font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; }
        .rr-photos { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
        .rr-photos img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border: 1px solid var(--q-line); }
        .rr-footer-note { font-size: 11px; color: var(--q-muted); margin-top: 8px; }
        .p-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-bottom: 4mm; }
        .p-photos img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border: 0.5pt solid #BFBFBF; }
        @media print {
          .rr-page .full-version { display: none !important; }
          .rr-page .pdf-only { display: block !important; padding: 15mm !important; min-height: 0 !important; }
        }
      `}</style>
    </div>
  );
}
