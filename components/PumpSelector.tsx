"use client";
import { useState } from "react";
import productData from "@/lib/productCatalog.json";

type SeriesKey = keyof typeof productData;
type Tab = "repurchase" | "new" | "selection";

type CatalogItem = {
  category: string;
  desc: string;
  seriesKey?: SeriesKey;
};

const CATALOG_ITEMS: CatalogItem[] = [
  { category: "오일펌프(소형 RV)",         desc: "오일 로터리 베인 펌프 (소형)",        seriesKey: "RV"   },
  { category: "오일펌프(소형 E2M)",         desc: "오일 로터리 베인 펌프 (E2M 소형)",    seriesKey: "E2M_small" },
  { category: "오일펌프(중대형 E2M)",       desc: "오일 로터리 베인 펌프 (E2M 중대형)", seriesKey: "E2M_large" },
  { category: "오일펌프(중대형 E2S)",       desc: "오일 로터리 베인 펌프 (E2S)"                                    },
  { category: "오일펌프(nES)",              desc: "오일 로터리 베인 펌프 (nES)",         seriesKey: "nES"       },
  { category: "부스터펌프(EH)",             desc: "루츠 부스터 펌프"                                      },
  { category: "스크롤펌프(소형 nXDS)",      desc: "드라이 스크롤 펌프 (소형)",          seriesKey: "nXDS" },
  { category: "스크롤펌프(중형 XDS)",       desc: "드라이 스크롤 펌프 (중형)",          seriesKey: "XDS"  },
  { category: "산업용드라이펌프(GXS)",      desc: "산업용 드라이 스크류",               seriesKey: "GXS"  },
  { category: "산업용드라이펌프(EXS)",      desc: "부식성 환경 드라이 스크류",          seriesKey: "EXS"  },
  { category: "반도체드라이펌프(iXH)",      desc: "반도체 드라이 펌프 (iXH)"                             },
  { category: "반도체드라이펌프(nXRi)",     desc: "반도체 드라이 펌프 (nXRi)"                            },
  { category: "반도체드라이펌프(iXL)",      desc: "반도체 드라이 펌프 (iXL)"                             },
  { category: "터보펌프(nEXT)",             desc: "터보분자 펌프 (nEXT)",               seriesKey: "nEXT" },
  { category: "터보펌프(nEXT Station)",     desc: "터보 펌핑 스테이션",                 seriesKey: "nEXT" },
  { category: "터보펌프(STP)",              desc: "터보분자 펌프 Maglev (STP)"                           },
  { category: "헬륨리크디텍터(ELD500)",     desc: "헬륨 리크 디텍터"                                     },
  { category: "저진공게이지(APG200)",       desc: "저진공 피라니 게이지"                                  },
  { category: "고진공게이지(AIM200)",       desc: "고진공 이온화 게이지"                                  },
  { category: "복합진공게이지(WRG200)",     desc: "복합 진공 게이지"                                      },
  { category: "디스플레이게이지(P4/P5)",    desc: "디스플레이 게이지"                                     },
  { category: "컨트롤러(TIC)",              desc: "터보 인터페이스 컨트롤러"                              },
  { category: "컨트롤러(ADC)",              desc: "액티브 디지털 컨트롤러"                                },
  { category: "미스트필터(EMF)",            desc: "오일 미스트 필터",                   seriesKey: "EM"   },
  { category: "진공펌프오일(Ultra19)",      desc: "진공 펌프 전용 오일"                                   },
  { category: "피팅/액세서리",              desc: "피팅 & 액세서리"                                       },
];

const PROCESS_OPTIONS = [
  "연구 및 분석",
  "가스 실린더",
  "진공 이중배관",
  "이차전지",
  "진공로",
  "진공 오븐/건조",
  "OLED / 디스플레이",
  "식품·제약 동결건조",
  "코팅 / 스마트폰",
  "수소 에너지",
  "항공우주",
  "태양광 에너지",
  "핵융합 / 가속기",
  "초미세 가공",
  "리사이클링",
  "의료 / 생명공학",
  "차세대 모빌리티",
  "특수 용접 / 금속",
  "리튬 1차전지",
  "ESS 에너지 저장",
];

const PUMP_L1 = ["오일펌프", "드라이펌프", "부스터펌프", "터보펌프"];

const PUMP_L2_MAP: Record<string, string[]> = {
  "오일펌프":   ["1단펌프", "2단펌프"],
  "드라이펌프": ["산업용 드라이", "반도체 드라이", "스크롤펌프"],
};

const PUMP_L3_MAP: Record<string, string[]> = {
  "1단펌프":       ["오일 단독", "오일 단독 + 부스터펌프"],
  "2단펌프":       ["오일 단독", "오일 단독 + 부스터펌프"],
  "산업용 드라이": ["드라이 단독", "드라이 + 부스터 조합"],
  "반도체 드라이": ["드라이 단독", "드라이 + 부스터 조합"],
  "스크롤펌프":    ["스크롤 단독", "스크롤 + 부스터 조합"],
};

const PIPE_SPEC_OPTIONS = ["KF16", "KF25", "KF40", "KF50", "ISO63", "ISO100", "ISO160", "기타"];

export default function PumpSelector() {
  const [tab, setTab] = useState<Tab>("new");
  const [selectedCategory, setSelectedCategory] = useState<CatalogItem | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    process: "", chamberVol: "", pipeSpec: "", pipeLen: "", bends: "",
  });
  const [pumpL1, setPumpL1] = useState("");
  const [pumpL2, setPumpL2] = useState("");
  const [pumpL3, setPumpL3] = useState("");
  const [pipeSpecCustom, setPipeSpecCustom] = useState("");
  const [pipeLenCustom, setPipeLenCustom] = useState("");
  const [bendsCustom, setBendsCustom] = useState("");
  const [chamberVolCustom, setChamberVolCustom] = useState("");

  const productItems = selectedCategory?.seriesKey
    ? (productData[selectedCategory.seriesKey] as { partNo: string; desc: string; price: number }[]).filter(
        (item) =>
          !search ||
          item.desc.toLowerCase().includes(search.toLowerCase()) ||
          item.partNo.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // 재구매 전체 통합 검색
  type FlatItem = { partNo: string; desc: string; price: number; series: string };
  const allItems: FlatItem[] = (Object.entries(productData) as [string, { partNo: string; desc: string; price: number }[]][])
    .flatMap(([series, items]) => items.map((item) => ({ ...item, series })));

  const repurchaseResults: FlatItem[] = search.trim().length >= 1
    ? allItems.filter((item) =>
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
        <button className={tabCls("new")} onClick={() => { setTab("new"); setSelectedCategory(null); setSearch(""); }}>
          신규제품구매
        </button>
        <button className={tabCls("repurchase")} onClick={() => { setTab("repurchase"); setSelectedCategory(null); setSearch(""); }}>
          재구매
        </button>
        <button className={tabCls("selection")} onClick={() => { setTab("selection"); setSelectedCategory(null); }}>
          펌프선정
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {/* 재구매 — 파트번호 통합 검색 */}
        {tab === "repurchase" && (
          <div>
            <p className="text-[12px] text-[#6A6660] mb-4">파트번호 또는 모델명을 입력하면 전체 카탈로그에서 조회합니다.</p>
            <input
              type="text"
              placeholder="파트번호 또는 모델명 입력 (예: A37141919, E2M28)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#E3DFD6] px-3 py-2.5 text-[13px] focus:outline-none focus:border-ink bg-transparent"
            />
            {search.trim().length >= 1 && (
              <div className="mt-2 border border-[#E3DFD6] divide-y divide-[#E3DFD6] max-h-[320px] overflow-y-auto">
                {repurchaseResults.length === 0 ? (
                  <div className="p-4 text-[12px] text-[#6A6660]">일치하는 항목이 없습니다.</div>
                ) : (
                  repurchaseResults.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2.5 hover:bg-[#f0ede8] transition-colors">
                      <div>
                        <div className="text-[12px] font-medium leading-snug">{item.desc}</div>
                        <div className="text-[10px] text-[#6A6660] mono mt-0.5">{item.partNo} · {item.series}</div>
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
            )}
            {repurchaseResults.length > 0 && (
              <div className="mt-1.5 text-[10px] text-[#6A6660]">총 {repurchaseResults.length}개 · 가격은 부가세 미포함 기준입니다.</div>
            )}
            <button
              onClick={() => window.location.href = "#contact"}
              className="mt-4 w-full bg-ink text-paper py-3 text-[13px] hover:bg-[#c00020] transition-colors"
            >
              선택 모델로 견적 문의 →
            </button>
          </div>
        )}

        {/* 신규제품구매 */}
        {tab === "new" && (
          <div>
            {!selectedCategory ? (
              <>
                <p className="text-[12px] text-[#6A6660] mb-4">신규 도입할 제품을 선택하세요.</p>
                <div className="grid grid-cols-3 gap-2">
                  {CATALOG_ITEMS.map((item) => (
                    <button
                      key={item.category}
                      onClick={() => setSelectedCategory(item)}
                      className="border border-[#E3DFD6] p-3 text-left hover:border-ink hover:bg-ink hover:text-paper transition-all group"
                    >
                      <div className="text-[12px] font-semibold leading-snug">{item.category}</div>
                      <div className="text-[10px] text-[#6A6660] mt-0.5 group-hover:text-paper/70 leading-snug">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] text-[#6A6660] mono">제품 /</span>
                    <span className="ml-1.5 text-[14px] font-semibold">{selectedCategory.category}</span>
                    <span className="ml-2 text-[11px] text-[#6A6660]">{selectedCategory.desc}</span>
                  </div>
                  <button
                    onClick={() => { setSelectedCategory(null); setSearch(""); }}
                    className="text-[11px] text-[#6A6660] hover:text-ink underline"
                  >
                    ← 제품 변경
                  </button>
                </div>

                {selectedCategory.seriesKey ? (
                  <>
                    <input
                      type="text"
                      placeholder="모델명 또는 파트번호 검색..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full border border-[#E3DFD6] px-3 py-2 text-[13px] mb-3 focus:outline-none focus:border-ink bg-transparent"
                    />
                    <div className="max-h-[280px] overflow-y-auto border border-[#E3DFD6] divide-y divide-[#E3DFD6]">
                      {productItems.length === 0 ? (
                        <div className="p-4 text-[12px] text-[#6A6660]">검색 결과가 없습니다.</div>
                      ) : (
                        productItems.map((item, i) => (
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
                      총 {productItems.length}개 항목 · 가격은 부가세 미포함 기준입니다.
                    </div>
                  </>
                ) : (
                  <div className="border border-[#E3DFD6] p-4 text-[12px] text-[#6A6660] bg-[#F6F4EF]">
                    해당 제품의 상세 모델 및 가격은 스마텍 전문가가 직접 안내드립니다.
                  </div>
                )}

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
            <div className="space-y-4">

              {/* 사용공정 드롭다운 */}
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

              {/* 펌프종류 — 계층 선택 칩 */}
              <div className="border border-[#E3DFD6] p-3 space-y-3">
                <div className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">펌프종류</div>

                {/* 선택 경로 표시 */}
                {pumpL1 && (
                  <div className="flex items-center gap-1 text-[11px] text-[#6A6660] flex-wrap">
                    <span className="font-medium text-ink">{pumpL1}</span>
                    {pumpL2 && <><span>›</span><span className="font-medium text-ink">{pumpL2}</span></>}
                    {pumpL3 && <><span>›</span><span className="font-medium text-ink">{pumpL3}</span></>}
                    <button
                      onClick={() => { setPumpL1(""); setPumpL2(""); setPumpL3(""); }}
                      className="ml-1 text-[10px] text-[#6A6660] hover:text-[#c00020] underline"
                    >
                      초기화
                    </button>
                  </div>
                )}

                {/* L1 — 펌프 대분류 */}
                <div>
                  <div className="text-[10px] text-[#6A6660] mb-1.5">펌프 분류</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PUMP_L1.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setPumpL1(opt); setPumpL2(""); setPumpL3(""); }}
                        className={`px-3 py-1.5 text-[12px] border transition-colors ${
                          pumpL1 === opt
                            ? "bg-ink text-paper border-ink"
                            : "border-[#E3DFD6] text-[#3A3630] hover:border-ink"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* L2 — 오일펌프 또는 드라이펌프의 하위 선택 */}
                {pumpL1 && PUMP_L2_MAP[pumpL1] && (
                  <div>
                    <div className="text-[10px] text-[#6A6660] mb-1.5">
                      {pumpL1 === "오일펌프" ? "펌프 단수" : "세부 분류"}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PUMP_L2_MAP[pumpL1].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setPumpL2(opt); setPumpL3(""); }}
                          className={`px-3 py-1.5 text-[12px] border transition-colors ${
                            pumpL2 === opt
                              ? "bg-ink text-paper border-ink"
                              : "border-[#E3DFD6] text-[#3A3630] hover:border-ink"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* L3 — 드라이 구성 선택 */}
                {pumpL2 && PUMP_L3_MAP[pumpL2] && (
                  <div>
                    <div className="text-[10px] text-[#6A6660] mb-1.5">펌프 구성</div>
                    <div className="flex flex-wrap gap-1.5">
                      {PUMP_L3_MAP[pumpL2].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setPumpL3(opt)}
                          className={`px-3 py-1.5 text-[12px] border transition-colors ${
                            pumpL3 === opt
                              ? "bg-ink text-paper border-ink"
                              : "border-[#E3DFD6] text-[#3A3630] hover:border-ink"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 챔버볼륨 */}
              <div>
                <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">챔버볼륨 (L)</label>
                <select
                  value={form.chamberVol}
                  onChange={(e) => { setForm({ ...form, chamberVol: e.target.value }); if (e.target.value !== "기타") setChamberVolCustom(""); }}
                  className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                >
                  <option value="">선택</option>
                  <option value="1L">1L</option>
                  {Array.from({ length: 40 }, (_, i) => `${(i + 1) * 5}L`).map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                  <option value="기타">기타</option>
                </select>
                {form.chamberVol === "기타" && (
                  <input
                    type="text"
                    placeholder="직접 입력"
                    value={chamberVolCustom}
                    onChange={(e) => setChamberVolCustom(e.target.value)}
                    className="mt-1.5 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                  />
                )}
              </div>

              {/* 배관 */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">배관규격</label>
                  <select
                    value={form.pipeSpec}
                    onChange={(e) => { setForm({ ...form, pipeSpec: e.target.value }); if (e.target.value !== "기타") setPipeSpecCustom(""); }}
                    className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                  >
                    <option value="">선택</option>
                    {PIPE_SPEC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {form.pipeSpec === "기타" && (
                    <input
                      type="text"
                      placeholder="직접 입력"
                      value={pipeSpecCustom}
                      onChange={(e) => setPipeSpecCustom(e.target.value)}
                      className="mt-1.5 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                    />
                  )}
                </div>
                <div>
                  <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">배관길이 (m)</label>
                  <select
                    value={form.pipeLen}
                    onChange={(e) => { setForm({ ...form, pipeLen: e.target.value }); if (e.target.value !== "기타") setPipeLenCustom(""); }}
                    className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                  >
                    <option value="">선택</option>
                    {["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "10m", "기타"].map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  {form.pipeLen === "기타" && (
                    <input
                      type="text"
                      placeholder="직접 입력"
                      value={pipeLenCustom}
                      onChange={(e) => setPipeLenCustom(e.target.value)}
                      className="mt-1.5 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                    />
                  )}
                </div>
                <div>
                  <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">꺾임 (회)</label>
                  <select
                    value={form.bends}
                    onChange={(e) => { setForm({ ...form, bends: e.target.value }); if (e.target.value !== "기타") setBendsCustom(""); }}
                    className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                  >
                    <option value="">선택</option>
                    {["1회", "2회", "3회", "4회", "5회", "기타"].map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  {form.bends === "기타" && (
                    <input
                      type="text"
                      placeholder="직접 입력"
                      value={bendsCustom}
                      onChange={(e) => setBendsCustom(e.target.value)}
                      className="mt-1.5 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                    />
                  )}
                </div>
              </div>

              <button
                onClick={() => window.location.href = "#contact"}
                className="w-full bg-ink text-paper py-3 text-[13px] hover:bg-[#c00020] transition-colors"
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
