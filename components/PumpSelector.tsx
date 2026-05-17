"use client";
import { useState } from "react";
import productData from "@/lib/productCatalog.json";
import { recommendPumps, TURBO_PUMPS, ALL_PUMPS, calcTurboPumpDown } from "@/lib/pumpSpeedData";
import type { PumpDownResult, TurboPumpDownResult, PumpModel } from "@/lib/pumpSpeedData";

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
  { category: "부스터펌프(EH)",             desc: "루츠 부스터 펌프",                   seriesKey: "EH"   },
  { category: "스크롤펌프(소형 nXDS)",      desc: "드라이 스크롤 펌프 (소형)",          seriesKey: "nXDS" },
  { category: "스크롤펌프(중형 XDS)",       desc: "드라이 스크롤 펌프 (중형)",          seriesKey: "XDS"  },
  { category: "산업용드라이펌프(GXS)",      desc: "산업용 드라이 스크류",               seriesKey: "GXS"  },
  { category: "산업용드라이펌프(EXS)",      desc: "부식성 환경 드라이 스크류",          seriesKey: "EXS"  },
  { category: "반도체드라이펌프(iXH)",      desc: "반도체 드라이 펌프 (iXH)",           seriesKey: "iXH"  },
  { category: "반도체드라이펌프(nXRi)",     desc: "멀티루츠드라이펌프(nXRi)",           seriesKey: "nXRi" },
  { category: "반도체드라이펌프(iXL)",      desc: "반도체 드라이 펌프 (iXL)",           seriesKey: "nXL"  },
  { category: "터보펌프(nEXT)",             desc: "터보분자 펌프 (nEXT)",               seriesKey: "nEXT" },
  { category: "터보펌프(nEXT Station)",     desc: "터보 펌핑 스테이션",                 seriesKey: "nEXT" },
  { category: "터보펌프(STP)",              desc: "터보분자 펌프 Maglev (STP)"                           },
  { category: "헬륨리크디텍터(ELD500)",     desc: "헬륨 리크 디텍터",                   seriesKey: "ELD"  },
  { category: "저진공게이지(APG200)",       desc: "저진공 피라니 게이지",               seriesKey: "APG"  },
  { category: "고진공게이지(AIM200)",       desc: "고진공 이온화 게이지",               seriesKey: "AIM"  },
  { category: "복합진공게이지(WRG200)",     desc: "복합 진공 게이지",                   seriesKey: "WRG"  },
  { category: "디스플레이게이지(P4/P5)",    desc: "디스플레이 게이지",                  seriesKey: "P4P5" },
  { category: "컨트롤러(TIC)",              desc: "터보 인터페이스 컨트롤러",           seriesKey: "TIC"  },
  { category: "컨트롤러(ADC)",              desc: "액티브 디지털 컨트롤러",             seriesKey: "ADC"  },
  { category: "미스트필터(EMF)",            desc: "오일 미스트 필터",                   seriesKey: "EM"   },
  { category: "진공펌프오일(Ultra19)",      desc: "진공 펌프 전용 오일",                seriesKey: "OIL"  },
  { category: "피팅/액세서리",              desc: "피팅 & 액세서리",                    seriesKey: "FITTING" },
];

const PROCESS_OPTIONS = [
  "연구 및 분석", "가스 실린더", "진공 이중배관", "이차전지", "진공로",
  "진공 오븐/건조", "OLED / 디스플레이", "식품·제약 동결건조", "코팅 / 스마트폰",
  "수소 에너지", "항공우주", "태양광 에너지", "핵융합 / 가속기", "초미세 가공",
  "리사이클링", "의료 / 생명공학", "차세대 모빌리티", "특수 용접 / 금속",
  "리튬 1차전지", "ESS 에너지 저장",
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

// KF/ISO 플랜지 → 내경(mm) 매핑
const PIPE_ID_MM: Record<string, number> = {
  KF16: 16, KF25: 25, KF40: 40, KF50: 50,
  ISO63: 63, ISO100: 100, ISO160: 160,
};

// TMP 인렛 플랜지 → 내경(mm) — ISO200F/250F 등 CF 변형 포함
const HV_FLANGE_ID: Record<string, number> = {
  NW40: 40, ISO63: 63, CF63: 63,
  ISO100: 100, CF100: 100, ISO160: 160, CF160: 160,
  ISO200: 200, ISO200F: 200,
  ISO250: 250, ISO250F: 250,
  ISO320: 320, ISO320F: 320,
  ISO400: 400, ISO400F: 400,
};

const TMP_SERIES_ORDER = ["iS", "iXA", "nEXT", "T-Station", "TPS"];
const TMP_SERIES_LABELS: Record<string, string> = {
  "iS":         "iS (대형 TMP)",
  "iXA":        "iXA (초대형 TMP)",
  "nEXT":       "nEXT 시리즈",
  "T-Station":  "T-Station 일체형",
  "TPS":        "Turbo pumping Station 일체형",
};

// 일체형 T-Station / TPS 내장 백킹펌프 모델명 (ALL_PUMPS에서 조회)
const T_STATION_BACKING: Record<string, string> = {
  "T-Station 85W (NW40)":      "E2M1.5",
  "T-Station 85W (ISO63)":     "E2M1.5",
  "T-Station 85D (NW40)":      "XDD1",
  "T-Station 85D (ISO63)":     "XDD1",
  "nEXT Station 85 (ISO63)":   "nXDS6i",
  "nEXT Station 240 (ISO100)": "nXDS15i",
  "nEXT Station 300 (ISO100)": "nXDS15i",
  "nEXT Station 400 (ISO160)": "nXDS20i",
  // TPS — Turbo pumping Station (계산용 드라이 백킹펌프 기본값)
  "TPS85 (NW40)":    "nXDS6i",
  "TPS85 (ISO63)":   "nXDS6i",
  "TPS240 (ISO100)": "nXDS15i",
  "TPS300 (ISO100)": "nXDS15i",
  "TPS400 (ISO160)": "nXDS20i",
};

// XDD1 드라이 다이어프램 펌프 — ALL_PUMPS 미등재, 로컬 프록시
const XDD1_PROXY: PumpModel = {
  model: "XDD1", series: "XDD", type: "dry_scroll",
  speed50Hz: 1.2, speed60Hz: 1.5, ultimate: 3.5, motorKW_50Hz: 0.1,
};

const TMP_TARGET_P_OPTIONS = [
  { label: "1×10⁻³ mbar",  value: "0.001"     },
  { label: "1×10⁻⁴ mbar",  value: "0.0001"    },
  { label: "1×10⁻⁵ mbar",  value: "0.00001"   },
  { label: "1×10⁻⁶ mbar",  value: "0.000001"  },
  { label: "1×10⁻⁷ mbar",  value: "0.0000001" },
  { label: "기타",           value: "기타"      },
];

// 목표 압력 선택지
const TARGET_P_OPTIONS = [
  { label: "100 mbar",      value: "100"     },
  { label: "10 mbar",       value: "10"      },
  { label: "1 mbar",        value: "1"       },
  { label: "0.1 mbar",      value: "0.1"     },
  { label: "0.01 mbar",     value: "0.01"    },
  { label: "1×10⁻³ mbar",  value: "0.001"   },
  { label: "1×10⁻⁴ mbar",  value: "0.0001"  },
  { label: "1×10⁻⁵ mbar",  value: "0.00001"   },
  { label: "1×10⁻⁶ mbar",  value: "0.000001"  },
  { label: "1×10⁻⁷ mbar",  value: "0.0000001" },
  { label: "기타",           value: "기타"      },
];

function fmtTime(sec: number): string {
  if (sec < 1)    return "< 1초";
  if (sec < 60)   return `${sec}초`;
  if (sec < 3600) return `${Math.floor(sec / 60)}분 ${sec % 60}초`;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}시간 ${m}분`;
}

/** L1/L2/L3 펌프 종류 선택 → 허용 시리즈 목록 (null = 전체) */
function resolveSeriesFilter(l1: string, l2: string, l3: string): string[] | undefined {
  if (!l1) return undefined;
  if (l1 === "오일펌프") {
    if (l3 === "오일 단독 + 부스터펌프") {
      if (l2 === "2단펌프") return ["E2M+EH"];
      if (l2 === "1단펌프") return ["nES+EH"];
      return [];
    }
    if (l2 === "1단펌프") return ["RV", "nES"];
    if (l2 === "2단펌프") return ["E2M_small", "E2M_large"];
    return ["RV", "E2M_small", "E2M_large", "nES", "E2M+EH"];
  }
  if (l1 === "부스터펌프") return [];   // 단독 사용 불가 → 빈 배열로 "결과없음" 표시
  if (l1 === "터보펌프")   return [];   // 데이터 미확보
  if (l1 === "드라이펌프") {
    if (l2 === "스크롤펌프") return ["nXDS", "XDS"];
    if (l2 === "산업용 드라이") {
      if (l3 === "드라이 단독")          return ["GXS", "EXS", "EDS", "EDC"];
      if (l3 === "드라이 + 부스터 조합") return ["GXS+GXB"];
      return ["GXS", "EXS", "EDS", "EDC", "GXS+GXB"];
    }
    if (l2 === "반도체 드라이") {
      if (l3 === "드라이 단독")          return ["iXH", "nXRi"];
      if (l3 === "드라이 + 부스터 조합") return ["iXH", "nXRi"];
      return ["iXH", "nXRi"];
    }
    return ["nXDS", "XDS", "GXS", "EXS", "EDS", "EDC", "GXS+GXB", "iXH", "nXRi"];
  }
  return undefined;
}

function fmtP(mbar: number): string {
  if (mbar >= 0.1)   return `${mbar} mbar`;
  const exp = Math.floor(Math.log10(mbar));
  const coef = mbar / Math.pow(10, exp);
  if (Math.abs(coef - 1) < 0.05) return `10⁻${Math.abs(exp)} mbar`;
  return `${coef.toFixed(1)}×10⁻${Math.abs(exp)} mbar`;
}

export default function PumpSelector() {
  const [tab, setTab] = useState<Tab>("repurchase");
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
  const [targetP, setTargetP] = useState("");
  const [targetPCustom, setTargetPCustom] = useState("");

  const [results, setResults] = useState<PumpDownResult[] | null>(null);
  const [calcError, setCalcError] = useState("");
  const [isCalc, setIsCalc] = useState(false);

  // ── 터보펌프 2단 계산 state ───────────────────────────────
  const [turboSeries, setTurboSeries] = useState("");
  const [turboTMP, setTurboTMP] = useState("");
  const [turboBacking, setTurboBacking] = useState("");
  const [turboHvLen, setTurboHvLen] = useState("1");
  const [turboHvBends, setTurboHvBends] = useState("0");
  const [turboRoughLen, setTurboRoughLen] = useState("1");
  const [turboResult, setTurboResult] = useState<TurboPumpDownResult | null>(null);
  const [turboError, setTurboError] = useState("");
  const [turboIsCalc, setTurboIsCalc] = useState(false);

  // 선택된 TMP 객체 + 호환 백킹펌프 목록
  const selectedTMPObj = TURBO_PUMPS.find(t => t.model === turboTMP) ?? null;
  const compatiblePumps = selectedTMPObj && !selectedTMPObj.integrated
    ? ALL_PUMPS.filter(p =>
        p.type !== "booster" && p.speed60Hz > 0 && p.ultimate > 0 &&
        p.ultimate < selectedTMPObj.maxFVPressure_mbar * 0.5
      )
    : [];

  // ── 계산 로직 ─────────────────────────────────────────────
  function handleCalculate() {
    const rawVol  = form.chamberVol === "기타" ? chamberVolCustom  : form.chamberVol;
    const rawLen  = form.pipeLen    === "기타" ? pipeLenCustom     : form.pipeLen;
    const rawSpec = form.pipeSpec   === "기타" ? pipeSpecCustom    : form.pipeSpec;
    const rawP    = targetP         === "기타" ? targetPCustom     : targetP;
    const rawBends = form.bends     === "기타" ? bendsCustom       : form.bends;

    const chamberVol = parseFloat(rawVol);
    const pipeLen    = parseFloat(rawLen);
    const pipeID     = rawSpec in PIPE_ID_MM
                         ? PIPE_ID_MM[rawSpec]
                         : parseFloat(rawSpec);
    const target     = parseFloat(rawP);
    const bends      = parseFloat(rawBends) || 0;

    if (!chamberVol || !pipeLen || !pipeID || !target) {
      setCalcError("챔버볼륨·배관규격·배관길이·목표압력은 필수입니다.");
      setResults(null);
      return;
    }
    if (target <= 0) {
      setCalcError("목표압력은 0보다 커야 합니다.");
      return;
    }

    setCalcError("");
    setIsCalc(true);

    // setTimeout으로 렌더링 flush 후 계산 실행 (UI 즉시 반응)
    setTimeout(() => {
      try {
        const seriesFilter = resolveSeriesFilter(pumpL1, pumpL2, pumpL3);
        const res = recommendPumps(
          { chamberVol_L: chamberVol, targetPressure_mbar: target,
            pipeID_mm: pipeID, pipeLength_m: pipeLen, pipeBends: bends },
          6,
          seriesFilter
        );
        setResults(res);
      } catch {
        setCalcError("계산 중 오류가 발생했습니다.");
      } finally {
        setIsCalc(false);
      }
    }, 20);
  }

  // ── 터보펌프 2단 계산 ────────────────────────────────────
  function getTurboBackingPump(): PumpModel | null {
    if (!selectedTMPObj) return null;
    if (selectedTMPObj.integrated) {
      const name = T_STATION_BACKING[selectedTMPObj.model];
      if (!name) return null;
      if (name === "XDD1") return XDD1_PROXY;
      return ALL_PUMPS.find(p => p.model === name) ?? null;
    }
    return ALL_PUMPS.find(p => p.model === turboBacking) ?? null;
  }

  function handleTurboCalc() {
    const tmp = selectedTMPObj;
    if (!tmp) { setTurboError("터보펌프 모델을 선택하세요."); return; }
    const backing = getTurboBackingPump();
    if (!backing) {
      setTurboError(tmp.integrated
        ? `내장 백킹펌프(${T_STATION_BACKING[tmp.model] ?? "?"}) 데이터를 찾을 수 없습니다.`
        : "백킹펌프를 선택하세요.");
      return;
    }
    const rawVol = form.chamberVol === "기타" ? chamberVolCustom : form.chamberVol;
    const rawP   = targetP === "기타" ? targetPCustom : targetP;
    const vol = parseFloat(rawVol);
    const tP  = parseFloat(rawP);
    if (!vol || vol <= 0) { setTurboError("챔버 볼륨을 입력하세요."); return; }
    if (!tP  || tP  <= 0) { setTurboError("목표 압력을 입력하세요."); return; }
    if (tP > tmp.maxFVPressure_mbar) {
      setTurboError(`목표 압력(${tP} mbar)이 TMP 시동 압력(${tmp.maxFVPressure_mbar} mbar)보다 높습니다. 목표를 낮춰주세요.`);
      return;
    }

    const hvID    = HV_FLANGE_ID[tmp.inletFlange] ?? 100;
    const hvLen   = parseFloat(turboHvLen) || 1;
    const hvBends = parseInt(turboHvBends) || 0;
    const roughLen = parseFloat(turboRoughLen) || 1;

    setTurboError("");
    setTurboIsCalc(true);
    setTimeout(() => {
      try {
        const r = calcTurboPumpDown(
          {
            chamberVol_L: vol,
            targetPressure_mbar: tP,
            hvPipeID_mm: hvID,
            hvPipeLength_m: hvLen,
            hvPipeBends: hvBends,
            roughPipeID_mm: 40,
            roughPipeLength_m: roughLen,
          },
          tmp,
          backing,
        );
        setTurboResult(r);
      } catch {
        setTurboError("계산 중 오류가 발생했습니다.");
      } finally {
        setTurboIsCalc(false);
      }
    }, 20);
  }

  // ── 카탈로그 검색 ─────────────────────────────────────────
  const productItems = selectedCategory?.seriesKey
    ? (productData[selectedCategory.seriesKey] as { partNo: string; desc: string; price: number }[]).filter(
        (item) =>
          !search ||
          item.desc.toLowerCase().includes(search.toLowerCase()) ||
          item.partNo.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  type FlatItem = { partNo: string; desc: string; price: number; series: string };

  // 재구매·신규 전체검색 공용: SPARE 키(전체 품목)에서 검색
  const spareItems: FlatItem[] = (productData["SPARE"] as { partNo: string; desc: string; price: number }[]).map(
    (item) => ({ ...item, series: "" })
  );

  const repurchaseResults: FlatItem[] =
    search.trim().length >= 1
      ? spareItems.filter(
          (item) =>
            item.desc.toLowerCase().includes(search.toLowerCase()) ||
            item.partNo.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  const newGlobalResults: FlatItem[] =
    !selectedCategory && search.trim().length >= 1
      ? spareItems.filter(
          (item) =>
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
        <button className={tabCls("repurchase")} onClick={() => { setTab("repurchase"); setSelectedCategory(null); setSearch(""); }}>
          재구매
        </button>
        <button className={tabCls("new")} onClick={() => { setTab("new"); setSelectedCategory(null); setSearch(""); }}>
          신규제품구매
        </button>
        <button className={tabCls("selection")} onClick={() => { setTab("selection"); setSelectedCategory(null); }}>
          펌프선정
        </button>
      </div>

      <div className="mt-6">
        {/* 재구매 */}
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
              onClick={() => {
                const top = repurchaseResults[0];
                const sub = encodeURIComponent(
                  top
                    ? `재구매 견적 문의 — ${top.partNo} (${top.desc.slice(0, 30)})`
                    : `재구매 견적 문의 — ${search.trim() || "문의"}`
                );
                const bodyText = top
                  ? `파트번호: ${top.partNo}\n제품명: ${top.desc}\n수량: \n납기 희망일: \n`
                  : `검색어: ${search.trim()}\n수량: \n납기 희망일: \n`;
                window.open(`mailto:rokmclmj@gmail.com?subject=${sub}&body=${encodeURIComponent(bodyText)}`, "_blank");
              }}
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
                <p className="text-[12px] text-[#6A6660] mb-3">신규 도입할 제품을 선택하거나 파트번호·모델명으로 검색하세요.</p>
                <input
                  type="text"
                  placeholder="파트번호 또는 모델명 검색 (예: A65301903, EH250)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-[#E3DFD6] px-3 py-2.5 text-[13px] focus:outline-none focus:border-ink bg-transparent mb-3"
                />
                {newGlobalResults.length > 0 ? (
                  <>
                    <div className="border border-[#E3DFD6] divide-y divide-[#E3DFD6] max-h-[360px] overflow-y-auto">
                      {newGlobalResults.map((item, i) => (
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
                      ))}
                    </div>
                    <div className="mt-1.5 text-[10px] text-[#6A6660]">총 {newGlobalResults.length}개 · 가격은 부가세 미포함 기준입니다.</div>
                  </>
                ) : search.trim().length >= 1 ? (
                  <div className="border border-[#E3DFD6] p-4 text-[12px] text-[#6A6660]">일치하는 항목이 없습니다.</div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {CATALOG_ITEMS.map((item) => (
                      <button
                        key={item.category}
                        onClick={() => { setSelectedCategory(item); setSearch(""); }}
                        className="border border-[#E3DFD6] p-3 text-left hover:border-ink hover:bg-ink hover:text-paper transition-all group"
                      >
                        <div className="text-[12px] font-semibold leading-snug">{item.category}</div>
                        <div className="text-[10px] text-[#6A6660] mt-0.5 group-hover:text-paper/70 leading-snug">
                          {item.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="모델명 또는 파트번호 검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                      />
                      <span className="shrink-0 text-[11px] text-[#6A6660] mono whitespace-nowrap">
                        총 {productItems.length}개
                      </span>
                    </div>
                    <div className="max-h-[420px] overflow-y-auto border border-[#E3DFD6] divide-y divide-[#E3DFD6]">
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
                    <div className="mt-1.5 text-[10px] text-[#6A6660]">가격은 부가세 미포함 기준입니다.</div>
                  </>
                ) : (
                  <div className="border border-[#E3DFD6] p-4 text-[12px] text-[#6A6660] bg-[#F6F4EF]">
                    해당 제품의 상세 모델 및 가격은 스마텍 전문가가 직접 안내드립니다.
                  </div>
                )}

                <button
                  onClick={() => {
                    const cat = selectedCategory?.category ?? "";
                    const sub = encodeURIComponent(
                      `신규제품 견적 문의 — ${cat || search.trim() || "신규 제품"}`
                    );
                    const bodyText = `제품 카테고리: ${cat}\n파트번호/모델: ${search.trim()}\n수량: \n납기 희망일: \n`;
                    window.open(`mailto:rokmclmj@gmail.com?subject=${sub}&body=${encodeURIComponent(bodyText)}`, "_blank");
                  }}
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
              공정 조건을 입력하면 적합한 펌프를 자동 계산합니다.
            </p>
            <div className="space-y-4">

              {/* 사용공정 */}
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

              {/* 펌프종류 계층 */}
              <div className="border border-[#E3DFD6] p-3 space-y-3">
                <div className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">펌프종류 (선택)</div>
                {pumpL1 && (
                  <div className="flex items-center gap-1 text-[11px] text-[#6A6660] flex-wrap">
                    <span className="font-medium text-ink">{pumpL1}</span>
                    {pumpL2 && <><span>›</span><span className="font-medium text-ink">{pumpL2}</span></>}
                    {pumpL3 && <><span>›</span><span className="font-medium text-ink">{pumpL3}</span></>}
                    <button
                      onClick={() => { setPumpL1(""); setPumpL2(""); setPumpL3(""); setTurboSeries(""); setTurboTMP(""); setTurboBacking(""); setTurboResult(null); }}
                      className="ml-1 text-[10px] text-[#6A6660] hover:text-[#c00020] underline"
                    >초기화</button>
                  </div>
                )}
                <div>
                  <div className="text-[10px] text-[#6A6660] mb-1.5">펌프 분류</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PUMP_L1.map((opt) => (
                      <button key={opt}
                        onClick={() => { setPumpL1(opt); setPumpL2(""); setPumpL3(""); setTurboSeries(""); setTurboTMP(""); setTurboBacking(""); setTurboResult(null); }}
                        className={`px-3 py-1.5 text-[12px] border transition-colors ${pumpL1 === opt ? "bg-ink text-paper border-ink" : "border-[#E3DFD6] text-[#3A3630] hover:border-ink"}`}
                      >{opt}</button>
                    ))}
                  </div>
                </div>
                {pumpL1 && PUMP_L2_MAP[pumpL1] && (
                  <div>
                    <div className="text-[10px] text-[#6A6660] mb-1.5">
                      {pumpL1 === "오일펌프" ? "펌프 단수" : "세부 분류"}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PUMP_L2_MAP[pumpL1].map((opt) => (
                        <button key={opt}
                          onClick={() => { setPumpL2(opt); setPumpL3(""); }}
                          className={`px-3 py-1.5 text-[12px] border transition-colors ${pumpL2 === opt ? "bg-ink text-paper border-ink" : "border-[#E3DFD6] text-[#3A3630] hover:border-ink"}`}
                        >{opt}</button>
                      ))}
                    </div>
                  </div>
                )}
                {pumpL2 && PUMP_L3_MAP[pumpL2] && (
                  <div>
                    <div className="text-[10px] text-[#6A6660] mb-1.5">펌프 구성</div>
                    <div className="flex flex-wrap gap-1.5">
                      {PUMP_L3_MAP[pumpL2].map((opt) => (
                        <button key={opt}
                          onClick={() => setPumpL3(opt)}
                          className={`px-3 py-1.5 text-[12px] border transition-colors ${pumpL3 === opt ? "bg-ink text-paper border-ink" : "border-[#E3DFD6] text-[#3A3630] hover:border-ink"}`}
                        >{opt}</button>
                      ))}
                    </div>
                  </div>
                )}
                {/* TMP 시리즈 / 모델 선택 (터보펌프 선택 시) */}
                {pumpL1 === "터보펌프" && (
                  <>
                    <div>
                      <div className="text-[10px] text-[#6A6660] mb-1.5">TMP 시리즈</div>
                      <div className="flex flex-wrap gap-1.5">
                        {TMP_SERIES_ORDER.map(s => (
                          <button key={s}
                            onClick={() => { setTurboSeries(s); setTurboTMP(""); setTurboBacking(""); setTurboResult(null); }}
                            className={`px-3 py-1.5 text-[12px] border transition-colors ${turboSeries === s ? "bg-ink text-paper border-ink" : "border-[#E3DFD6] text-[#3A3630] hover:border-ink"}`}
                          >{TMP_SERIES_LABELS[s]}</button>
                        ))}
                      </div>
                    </div>
                    {turboSeries && (
                      <div>
                        <div className="text-[10px] text-[#6A6660] mb-1.5">TMP 모델</div>
                        <div className="grid grid-cols-2 gap-2">
                          {TURBO_PUMPS.filter(t => t.series === turboSeries).map(t => (
                            <button key={t.model}
                              onClick={() => { setTurboTMP(t.model); setTurboBacking(""); setTurboResult(null); }}
                              className={`p-2.5 text-left border transition-all ${
                                turboTMP === t.model
                                  ? "bg-ink text-paper border-ink"
                                  : "border-[#E3DFD6] hover:border-ink hover:bg-[#f0ede8]"
                              }`}
                            >
                              <div className="text-[12px] font-semibold leading-snug">{t.model}</div>
                              <div className={`text-[10px] mt-0.5 ${turboTMP === t.model ? "text-paper/80" : "text-[#6A6660]"}`}>
                                N₂: {t.speedN2_Ls} L/s · {t.inletFlange}
                              </div>
                              <div className={`text-[10px] ${turboTMP === t.model ? "text-paper/70" : "text-[#6A6660]"}`}>
                                {t.integrated ? `일체형 · ${t.backingPump}` : `최대 FV: ${t.maxFVPressure_mbar} mbar`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 백킹펌프 선택 (터보펌프 standalone) */}
              {pumpL1 === "터보펌프" && selectedTMPObj && !selectedTMPObj.integrated && (
                <div>
                  <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">
                    백킹펌프 선택 <span className="text-[#c00020]">*</span>
                    <span className="ml-1 normal-case text-[9px]">
                      (ultimate &lt; {(selectedTMPObj.maxFVPressure_mbar * 0.5).toFixed(2)} mbar 자동 필터)
                    </span>
                  </label>
                  <select
                    value={turboBacking}
                    onChange={e => { setTurboBacking(e.target.value); setTurboResult(null); }}
                    className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                  >
                    <option value="">선택</option>
                    {compatiblePumps.map(p => (
                      <option key={p.model} value={p.model}>
                        {p.model} ({p.series}) — {p.speed60Hz} m³/h · ult {p.ultimate} mbar
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 챔버볼륨 + 목표압력 (같은 행) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">
                    챔버볼륨 (L) <span className="text-[#c00020]">*</span>
                  </label>
                  <select
                    value={form.chamberVol}
                    onChange={(e) => { setForm({ ...form, chamberVol: e.target.value }); if (e.target.value !== "기타") setChamberVolCustom(""); }}
                    className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                  >
                    <option value="">선택</option>
                    <option value="1">1L</option>
                    {Array.from({ length: 40 }, (_, i) => `${(i + 1) * 5}`).map((v) => (
                      <option key={v} value={v}>{v}L</option>
                    ))}
                    <option value="기타">기타</option>
                  </select>
                  {form.chamberVol === "기타" && (
                    <input type="text" placeholder="직접 입력 (L)"
                      value={chamberVolCustom} onChange={(e) => setChamberVolCustom(e.target.value)}
                      className="mt-1.5 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                    />
                  )}
                </div>
                <div>
                  <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">
                    목표 도달압력 <span className="text-[#c00020]">*</span>
                  </label>
                  <select
                    value={targetP}
                    onChange={(e) => { setTargetP(e.target.value); if (e.target.value !== "기타") setTargetPCustom(""); }}
                    className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                  >
                    <option value="">선택</option>
                    {TARGET_P_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {targetP === "기타" && (
                    <input type="text" placeholder="직접 입력 (mbar)"
                      value={targetPCustom} onChange={(e) => setTargetPCustom(e.target.value)}
                      className="mt-1.5 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                    />
                  )}
                </div>
              </div>

              {/* 배관 — 러핑(기존) / HV(터보) */}
              {pumpL1 !== "터보펌프" ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">
                      배관규격 <span className="text-[#c00020]">*</span>
                    </label>
                    <select
                      value={form.pipeSpec}
                      onChange={(e) => { setForm({ ...form, pipeSpec: e.target.value }); if (e.target.value !== "기타") setPipeSpecCustom(""); }}
                      className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                    >
                      <option value="">선택</option>
                      {PIPE_SPEC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {form.pipeSpec === "기타" && (
                      <input type="text" placeholder="내경 mm"
                        value={pipeSpecCustom} onChange={(e) => setPipeSpecCustom(e.target.value)}
                        className="mt-1.5 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] mono text-[#6A6660] uppercase tracking-wider">
                      배관길이 (m) <span className="text-[#c00020]">*</span>
                    </label>
                    <select
                      value={form.pipeLen}
                      onChange={(e) => { setForm({ ...form, pipeLen: e.target.value }); if (e.target.value !== "기타") setPipeLenCustom(""); }}
                      className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                    >
                      <option value="">선택</option>
                      {["1","2","3","4","5","6","7","8","9","10"].map((v) => (
                        <option key={v} value={v}>{v}m</option>
                      ))}
                      <option value="기타">기타</option>
                    </select>
                    {form.pipeLen === "기타" && (
                      <input type="text" placeholder="직접 입력 (m)"
                        value={pipeLenCustom} onChange={(e) => setPipeLenCustom(e.target.value)}
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
                      <option value="">0회</option>
                      {["1","2","3","4","5"].map((v) => (
                        <option key={v} value={v}>{v}회</option>
                      ))}
                      <option value="기타">기타</option>
                    </select>
                    {form.bends === "기타" && (
                      <input type="text" placeholder="직접 입력"
                        value={bendsCustom} onChange={(e) => setBendsCustom(e.target.value)}
                        className="mt-1.5 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                      />
                    )}
                  </div>
                </div>
              ) : selectedTMPObj && (
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] mono text-[#6A6660] uppercase tracking-wider mb-2">
                      HV 배관 (챔버 ↔ TMP 인렛)
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-[#6A6660]">배관 규격 (자동)</label>
                        <div className="mt-1 border border-[#E3DFD6] px-3 py-2 text-[13px] bg-[#F6F4EF] text-[#6A6660]">
                          {selectedTMPObj.inletFlange}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#6A6660]">배관 길이 (m)</label>
                        <select value={turboHvLen} onChange={e => { setTurboHvLen(e.target.value); setTurboResult(null); }}
                          className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent">
                          {["0.3","0.5","1","1.5","2","3"].map(v => <option key={v} value={v}>{v}m</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#6A6660]">꺾임 (회)</label>
                        <select value={turboHvBends} onChange={e => { setTurboHvBends(e.target.value); setTurboResult(null); }}
                          className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent">
                          {["0","1","2","3"].map(v => <option key={v} value={v}>{v}회</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  {!selectedTMPObj.integrated && (
                    <div>
                      <div className="text-[10px] mono text-[#6A6660] uppercase tracking-wider mb-2">
                        러핑 배관 (백킹펌프 ↔ 챔버, Stage 1)
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] text-[#6A6660]">규격 (기본)</label>
                          <div className="mt-1 border border-[#E3DFD6] px-3 py-2 text-[13px] bg-[#F6F4EF] text-[#6A6660]">NW40</div>
                        </div>
                        <div>
                          <label className="text-[10px] text-[#6A6660]">길이 (m)</label>
                          <select value={turboRoughLen} onChange={e => { setTurboRoughLen(e.target.value); setTurboResult(null); }}
                            className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent">
                            {["0.5","1","1.5","2","3"].map(v => <option key={v} value={v}>{v}m</option>)}
                          </select>
                        </div>
                        <div className="flex items-end pb-0.5">
                          <span className="text-[10px] text-[#6A6660]">꺾임 없음 (기본)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 오류 메시지 */}
              {(pumpL1 === "터보펌프" ? turboError : calcError) && (
                <p className="text-[11px] text-[#c00020]">
                  {pumpL1 === "터보펌프" ? turboError : calcError}
                </p>
              )}

              {/* 계산 버튼 */}
              <button
                onClick={pumpL1 === "터보펌프" ? handleTurboCalc : handleCalculate}
                disabled={pumpL1 === "터보펌프" ? turboIsCalc : isCalc}
                className="w-full bg-ink text-paper py-3 text-[13px] hover:bg-[#c00020] transition-colors disabled:opacity-50"
              >
                {(pumpL1 === "터보펌프" ? turboIsCalc : isCalc)
                  ? "계산 중…"
                  : pumpL1 === "터보펌프" ? "2단 펌프다운 계산 →" : "펌프 자동 선정 계산 →"
                }
              </button>

              {/* ── 계산 결과 (터보) ─────────────────────────── */}
              {pumpL1 === "터보펌프" && turboResult !== null && (
                <div className="border border-[#E3DFD6] mt-2">
                  <div className="px-4 py-2.5 bg-[#F6F4EF] border-b border-[#E3DFD6] flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold mono uppercase tracking-wider">계산 결과</span>
                    <span className="text-[10px] text-[#6A6660]">
                      {turboResult.turboModel} · {turboResult.backingModel}
                    </span>
                  </div>
                  {!turboResult.reachable ? (
                    <div className="px-4 py-4 text-[12px] text-[#6A6660] leading-relaxed">
                      목표 압력에 도달할 수 없습니다.
                      아웃게싱 한계: {fmtP(turboResult.ultimateSystem_mbar)} — 목표 압력을 높이거나 챔버 면적 조건을 확인하세요.
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center px-4 py-3 border-b border-[#E3DFD6] gap-3">
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center text-[9px] font-bold border border-[#E3DFD6] text-[#6A6660]">1</div>
                        <div className="flex-1">
                          <div className="text-[12px] font-medium">Stage 1 — 러핑</div>
                          <div className="text-[10px] text-[#6A6660] mono mt-0.5">
                            대기압 → {turboResult.tmpStartPressure_mbar} mbar (TMP 시동)
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[13px] font-semibold mono">{fmtTime(turboResult.stage1_s)}</div>
                          <div className="text-[10px] text-[#6A6660]">{turboResult.backingModel}</div>
                        </div>
                      </div>
                      <div className="flex items-center px-4 py-3 border-b border-[#E3DFD6] gap-3">
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center text-[9px] font-bold border border-[#E3DFD6] text-[#6A6660]">2</div>
                        <div className="flex-1">
                          <div className="text-[12px] font-medium">Stage 2 — TMP 고진공</div>
                          <div className="text-[10px] text-[#6A6660] mono mt-0.5">
                            유효속도 {turboResult.tmpEffSpeed_Ls} L/s · 한계 {fmtP(turboResult.ultimateSystem_mbar)}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[13px] font-semibold mono">{fmtTime(turboResult.stage2_s)}</div>
                          <div className="text-[10px] text-[#6A6660]">{turboResult.turboModel}</div>
                        </div>
                      </div>
                      <div className="flex items-center px-4 py-3 bg-[#F6F4EF] gap-3">
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center text-[9px] font-bold bg-ink text-paper">∑</div>
                        <div className="flex-1">
                          <div className="text-[12px] font-semibold">총 펌프다운 시간</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[15px] font-bold mono text-ink">{fmtTime(turboResult.totalTime_s)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="px-4 py-2.5 border-t border-[#E3DFD6] bg-[#F6F4EF]">
                    <p className="text-[10px] text-[#6A6660] leading-relaxed">
                      ※ TMP 스핀업 시간(1~3분)은 포함되지 않습니다. SUS+Nitrile, 아웃게싱 1.3×10⁻⁷ mbar·L/s·cm² 기준.
                      최종 선정은 스마텍 전문가 검토를 권장합니다.
                    </p>
                  </div>
                </div>
              )}

              {/* ── 계산 결과 (일반) ─────────────────────────── */}
              {pumpL1 !== "터보펌프" && results !== null && (
                <div className="border border-[#E3DFD6] mt-2">
                  {/* 결과 헤더 */}
                  <div className="px-4 py-2.5 bg-[#F6F4EF] border-b border-[#E3DFD6] flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold mono uppercase tracking-wider">계산 결과</span>
                    <span className="text-[10px] text-[#6A6660]">
                      목표 {fmtP(parseFloat(targetP === "기타" ? targetPCustom : targetP))}
                      {" · "}{form.chamberVol === "기타" ? chamberVolCustom : form.chamberVol}L
                      {" · "}{form.pipeSpec === "기타" ? pipeSpecCustom : form.pipeSpec}
                      {" "}{form.pipeLen === "기타" ? pipeLenCustom : form.pipeLen}m
                    </span>
                  </div>

                  {results.length === 0 ? (
                    <div className="px-4 py-5 text-[12px] text-[#6A6660] leading-relaxed">
                      {(pumpL1 === "부스터펌프") && "부스터펌프는 단독 운전 불가 — 백킹 펌프와 조합이 필요합니다. 펌프 종류를 변경하거나 전문가 검토를 요청해주세요."}
                      {(pumpL1 === "터보펌프") && "터보펌프 데이터는 준비 중입니다. 전문가 검토를 요청해주세요."}
                      {(!pumpL1 || (pumpL1 !== "부스터펌프" && pumpL1 !== "터보펌프")) &&
                        "입력하신 조건에서 목표 압력에 도달 가능한 펌프가 없습니다. 목표 압력을 올리거나 배관을 확대해 보세요."}
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E3DFD6]">
                      {results.map((r, i) => (
                        <div key={r.model}
                          className={`flex items-center px-4 py-3 gap-3 ${i === 0 ? "bg-[#F6F4EF]" : "hover:bg-[#faf9f6]"} transition-colors`}
                        >
                          {/* 순위 */}
                          <span className={`shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold ${
                            i === 0 ? "bg-ink text-paper" : "border border-[#E3DFD6] text-[#6A6660]"
                          }`}>
                            {i + 1}
                          </span>

                          {/* 모델 정보 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-[13px] font-semibold">{r.model}</span>
                              <span className="text-[10px] text-[#6A6660]">{r.series}</span>
                            </div>
                            <div className="text-[10px] text-[#6A6660] mono mt-0.5">
                              정격 {r.pumpSpeed_m3h} m³/h · 유효 {r.effectiveSpeed_m3h} m³/h
                            </div>
                          </div>

                          {/* 시간 */}
                          <div className="shrink-0 text-right">
                            <div className={`text-[13px] font-semibold mono ${i === 0 ? "text-ink" : ""}`}>
                              {fmtTime(r.pumpDownTime_s)}
                            </div>
                            <div className="text-[10px] text-[#6A6660]">pump-down</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 주석 */}
                  <div className="px-4 py-2.5 border-t border-[#E3DFD6] bg-[#F6F4EF]">
                    <p className="text-[10px] text-[#6A6660] leading-relaxed">
                      ※ 상기 결과는 수치 시뮬레이션 참고값입니다 (SUS+Nitrile, outgassing 1.3×10⁻⁷ mbar·L/s·cm², 60Hz 기준).
                      최종 모델 선정은 스마텍 전문가 검토를 권장합니다.
                    </p>
                  </div>
                </div>
              )}

              {/* 전문가 문의 CTA */}
              <button
                onClick={() => {
                  const pumpDesc = [pumpL1, pumpL2, pumpL3].filter(Boolean).join(" > ");
                  const sub = encodeURIComponent(`펌프 선정 전문가 검토 요청 — ${pumpDesc || "조건 상담"}`);
                  const rawVol = form.chamberVol === "기타" ? chamberVolCustom : form.chamberVol;
                  const rawP = targetP === "기타" ? targetPCustom : targetP;
                  const rawSpec = form.pipeSpec === "기타" ? pipeSpecCustom : form.pipeSpec;
                  const rawLen = form.pipeLen === "기타" ? pipeLenCustom : form.pipeLen;
                  const lines = [
                    `펌프 종류: ${pumpDesc || "미선택"}`,
                    rawVol ? `챔버볼륨: ${rawVol}L` : "",
                    rawP ? `목표압력: ${rawP} mbar` : "",
                    rawSpec && rawLen ? `배관: ${rawSpec}, ${rawLen}m` : "",
                    results && results.length > 0 ? `AI 추천 1위: ${results[0].model}` : "",
                  ].filter(Boolean).join("\n");
                  const body = encodeURIComponent(`${lines}\n\n담당자 검토 요청드립니다.`);
                  window.open(`mailto:rokmclmj@gmail.com?subject=${sub}&body=${body}`, "_blank");
                }}
                className="w-full border border-ink text-ink py-3 text-[13px] hover:bg-ink hover:text-paper transition-colors"
              >
                스마텍 전문가 검토 요청 →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
