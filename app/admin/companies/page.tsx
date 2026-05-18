"use client";

import { useState, useEffect, useRef } from "react";

type KnownCompany = {
  id: number;
  companyName: string;
  phone: string | null;
  email: string | null;
  tier: "DEALER" | "OEM" | "ENDUSER";
  source: string;
  createdAt: string;
};

type Stats = { DEALER: number; OEM: number; ENDUSER: number; total: number };

const TIER_LABEL: Record<string, string> = {
  DEALER: "딜러",
  OEM: "OEM",
  ENDUSER: "일반",
};

const TIER_COLOR: Record<string, string> = {
  DEALER: "bg-blue-50 text-blue-700 border-blue-200",
  OEM: "bg-purple-50 text-purple-700 border-purple-200",
  ENDUSER: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<KnownCompany[]>([]);
  const [stats, setStats] = useState<Stats>({ DEALER: 0, OEM: 0, ENDUSER: 0, total: 0 });
  const [filter, setFilter] = useState<"ALL" | "DEALER" | "OEM" | "ENDUSER">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/known-companies");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies);
        setStats(data.stats);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    setImportError(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/known-companies/import", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult(
          `완료 — 총 ${data.total}개 중 신규 ${data.created}개 추가, ${data.updated}개 업데이트`
        );
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

  async function handleDelete(id: number, name: string) {
    if (!confirm(`"${name}" 항목을 삭제하시겠습니까?`)) return;
    await fetch(`/api/admin/known-companies?id=${id}`, { method: "DELETE" });
    await load();
  }

  const filtered = companies.filter((c) => {
    if (filter !== "ALL" && c.tier !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.companyName.toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
          — 08 · 거래처 화이트리스트
        </div>
        <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink">
          거래처 <span className="italic text-edred">자동 분류</span>
        </h1>
        <p className="mt-4 text-[14px] dim leading-[1.6] max-w-2xl">
          등록된 거래처는 가입 시 전화번호·이메일로 자동 인식되어 즉시 해당 등급이 부여됩니다.
          등급명은 고객에게 노출되지 않습니다.
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
              딜러 / OEM / 엔드유저 시트가 포함된 .xlsx 파일을 업로드하세요.
              기존 데이터는 전화번호·이메일 기준으로 업데이트됩니다.
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="bg-ink text-paper px-5 py-2.5 text-[13px] font-medium hover:bg-ink/80 disabled:opacity-50 transition-colors shrink-0"
          >
            {importing ? "임포트 중..." : "📂 엑셀 업로드"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        {importResult && (
          <div className="mt-3 px-4 py-2.5 bg-green-50 border border-green-200 text-[13px] text-green-700">
            ✓ {importResult}
          </div>
        )}
        {importError && (
          <div className="mt-3 px-4 py-2.5 bg-red-50 border border-red-200 text-[13px] text-red-700">
            ✗ {importError}
          </div>
        )}
      </div>

      {/* 필터 + 검색 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["ALL", "DEALER", "OEM", "ENDUSER"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 text-[12px] font-medium border transition-colors ${
                filter === t
                  ? "bg-ink text-paper border-ink"
                  : "border-gray-200 text-dim hover:border-ink hover:text-ink"
              }`}
            >
              {t === "ALL" ? "전체" : TIER_LABEL[t]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="회사명 · 전화번호 · 이메일 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border hair px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink"
        />
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="text-center py-16 mono text-[11px] dim tracking-[0.12em]">LOADING...</div>
      ) : (
        <div className="border hair overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-ink/[0.03] border-b hair">
                <tr>
                  {["회사명", "등급", "전화번호", "이메일", "출처", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left mono text-[10px] dim tracking-[0.1em] uppercase font-normal">
                      {h}
                    </th>
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
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-ink/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-ink">{c.companyName}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block border px-2 py-0.5 text-[11px] font-medium rounded-sm ${TIER_COLOR[c.tier]}`}>
                          {TIER_LABEL[c.tier]}
                        </span>
                      </td>
                      <td className="px-4 py-3 mono text-[12px] dim">{c.phone ?? "—"}</td>
                      <td className="px-4 py-3 dim truncate max-w-[200px]">{c.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="mono text-[10px] dim">{c.source}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(c.id, c.companyName)}
                          className="mono text-[10px] text-red-400 hover:text-red-600 tracking-[0.08em] uppercase transition-colors"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
    </div>
  );
}
