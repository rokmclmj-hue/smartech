"use client";
import { useState } from "react";
import productData from "@/lib/productCatalog.json";

type Series = keyof typeof productData;
type Tab = "repurchase" | "new" | "selection";

const SERIES_LIST: Series[] = ["RV", "nXDS", "XDS", "nXL", "GXS", "EXS", "EDS", "nEXT", "EM"];

const SERIES_DESC: Record<string, string> = {
  RV:   "오일 로터리 베인 펌프",
  nXDS: "드라이 스크롤 펌프",
  XDS:  "드라이 스크롤 펌프 (대형)",
  nXL:  "드라이 스크류 펌프",
  GXS:  "반도체 드라이 펌프",
  EXS:  "반도체 드라이 펌프 (고성능)",
  EDS:  "반도체 드라이 펌프 (EDS)",
  nEXT: "터보분자 펌프",
  EM:   "오일 미스트 필터",
};

const PROCESS_OPTIONS = ["반도체/디스플레이", "화학/제약", "연구개발/분석", "식품/포장", "우주/항공", "기타"];
const PUMP_TYPE_OPTIONS = ["오일 로터리 베인", "드라이 스크롤", "드라이 스크류", "터보분자", "부스터"];
const PIPE_SPEC_OPTIONS = ["KF16", "KF25", "KF40", "KF50", "ISO63", "ISO100", "ISO160"];

export default function PumpSelector() {
  const [tab, setTab] = useState<Tab>("repurchase");
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [search, setSearch] = useState("");

  // Pump selection form state
  const [form, setForm] = useState({
    process: "", pumpType: "", chamberVol: "", pipeSpec: "", pipeLen: "", bends: "",
  });

  const items = selectedSeries
    ? (productData[selectedSeries] as { partNo: string; desc: string; price: number }[]).filter(
        (item) =>
          !search ||
          item.desc.toLowerCase().includes(search.toLowerCase()) ||
          item.partNo.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const tabCls = (t: Tab) =>
    `flex-1 py-3 text-[13px] font-medium tracking-wide transition-colors border-b-2 ${
      tab === t
        ? "border-ink text-ink"
        : "border-transparent text-[#6A6660] hover:text-ink"
    }`;

  return (
    <div className="mt-8">
      {/* Tabs */}
      <div className="flex border-b border-[#E3DFD6]">
        <button className={tabCls("repurchase")} onClick={() => { setTab("repurchase"); setSelectedSeries(null); setSearch(""); }}>
          재구매
        </button>
        <button className={tabCls("new")} onClick={() => { setTab("new"); setSelectedSeries(null); setSearch(""); }}>
          신규구매
        </button>
        <button className={tabCls("selection")} onClick={() => { setTab("selection"); setSelectedSeries(null); }}>
          펌프선정
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {/* 재구매 / 신규구매 */}
        {(tab === "repurchase" || tab === "new") && (
          <div>
            {!selectedSeries ? (
              <>
                <p className="text-[12px] text-[#6A6660] mb-4">
                  {tab === "repurchase"
                    ? "기존 사용 중인 시리즈를 선택하세요."
                    : "신규 도입할 펌프 시리즈를 선택하세요."}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {SERIES_LIST.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSeries(s)}
                      className="border border-[#E3DFD6] p-3 text-left hover:border-ink hover:bg-ink hover:text-paper transition-all group"
                    >
                      <div className="text-[15px] font-semibold tracking-tight">{s}</div>
                      <div className="text-[10px] text-[#6A6660] mt-0.5 group-hover:text-paper/70 leading-snug">
                        {SERIES_DESC[s]}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] text-[#6A6660] mono">SERIES /</span>
                    <span className="ml-1.5 text-[15px] font-semibold">{selectedSeries}</span>
                    <span className="ml-2 text-[11px] text-[#6A6660]">{SERIES_DESC[selectedSeries]}</span>
                  </div>
                  <button
                    onClick={() => { setSelectedSeries(null); setSearch(""); }}
                    className="text-[11px] text-[#6A6660] hover:text-ink underline"
                  >
                    ← 시리즈 변경
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="모델명 또는 파트번호 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-[#E3DFD6] px-3 py-2 text-[13px] mb-3 focus:outline-none focus:border-ink bg-transparent"
                />
                <div className="max-h-[280px] overflow-y-auto border border-[#E3DFD6] divide-y divide-[#E3DFD6]">
                  {items.length === 0 ? (
                    <div className="p-4 text-[12px] text-[#6A6660]">검색 결과가 없습니다.</div>
                  ) : (
                    items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2.5 hover:bg-[#f0ede8] transition-colors">
                        <div>
                          <div className="text-[12px] font-medium leading-snug">{item.desc}</div>
                          <div className="text-[10px] text-[#6A6660] mono mt-0.5">{item.partNo}</div>
                        </div>
                        <div className="shrink-0 ml-4 text-right">
                          <div className="text-[12px] font-semibold text-[#c00020]">
                            {item.price.toLocaleString()}원
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-2 text-[10px] text-[#6A6660]">
                  총 {items.length}개 항목 · 가격은 부가세 미포함 기준입니다.
                </div>
                <button
                  onClick={() => window.location.href = "#contact"}
                  className="mt-4 w-full bg-ink text-paper py-3 text-[13px] hover:bg-[#c00020] transition-colors"
                >
                  선택 모델로 견적 문의 →
                </button>
              </>
            )}
          </div>
        )}

        {/* 펌프선정 */}
        {tab === "selection" && (
          <div>
            <p className="text-[12px] text-[#6A6660] mb-4">
              공정 조건을 입력하시면 스마텍이 최적 모델을 검토 후 제안드립니다.
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">사용공정</label>
                  <select
                    value={form.process}
                    onChange={(e) => setForm({ ...form, process: e.target.value })}
                    className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                  >
                    <option value="">선택</option>
                    {PROCESS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">펌프종류</label>
                  <select
                    value={form.pumpType}
                    onChange={(e) => setForm({ ...form, pumpType: e.target.value })}
                    className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                  >
                    <option value="">선택</option>
                    {PUMP_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">챔버볼륨 (L)</label>
                <input
                  type="text"
                  placeholder="예: 100"
                  value={form.chamberVol}
                  onChange={(e) => setForm({ ...form, chamberVol: e.target.value })}
                  className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">배관규격</label>
                  <select
                    value={form.pipeSpec}
                    onChange={(e) => setForm({ ...form, pipeSpec: e.target.value })}
                    className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                  >
                    <option value="">선택</option>
                    {PIPE_SPEC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">배관길이 (m)</label>
                  <input
                    type="text"
                    placeholder="예: 3"
                    value={form.pipeLen}
                    onChange={(e) => setForm({ ...form, pipeLen: e.target.value })}
                    className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">꺾임 (회)</label>
                  <input
                    type="text"
                    placeholder="예: 2"
                    value={form.bends}
                    onChange={(e) => setForm({ ...form, bends: e.target.value })}
                    className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                  />
                </div>
              </div>
              <button
                onClick={() => window.location.href = "#contact"}
                className="w-full bg-ink text-paper py-3 text-[13px] hover:bg-[#c00020] transition-colors mt-2"
              >
                조건 전송 — 스마텍 전문가 검토 요청 →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
