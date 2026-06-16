"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import productData from "@/lib/productCatalog.json";
import { addToCartByPartNo } from "@/lib/cartUtils";
import { recommendPumps, TURBO_PUMPS, ALL_PUMPS, calcTurboPumpDown, TMP_TURNON_MBAR } from "@/lib/pumpSpeedData";
import type { PumpDownResult, TurboPumpDownResult, PumpModel } from "@/lib/pumpSpeedData";
import ProductPanel from "@/components/ProductPanel";
import type { PanelItem } from "@/components/ProductPanel";
import { CATALOG_MAP } from "@/lib/catalogs";

type SeriesKey = keyof typeof productData;
type Tab = "search" | "scan" | "selection";

type ScanResult = {
  modelName: string | null;
  partNo: string | null;
  pumpFamily: string;
  maker: string;
  confidence: "high" | "medium" | "low";
  serialNo: string | null;
  notes: string;
};

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

// 펌프 시리즈 → ProductPanel 에 넘길 PanelItem 매핑
const SERIES_PANEL_MAP: Record<string, PanelItem> = {
  "RV":       { category: "오일펌프(소형 RV)",       code: "RV 시리즈",    title: "오일 로터리 베인 펌프 (소형)",    image: "/images/products/rv.jpeg"      },
  "E2M_small":{ category: "오일펌프(소형 E2M)",      code: "E2M 시리즈",   title: "오일 로터리 베인 펌프 (E2M 소형)",image: "/images/products/rv.jpeg"      },
  "E2M_large":{ category: "오일펌프(중대형 E2M)",    code: "E2M 시리즈",   title: "오일 로터리 베인 펌프 (E2M 중대형)",image: "/images/products/rv.jpeg"    },
  "nES":      { category: "오일펌프(nES)",            code: "nES 시리즈",   title: "오일 로터리 베인 펌프 (nES)",      image: "/images/products/rv.jpeg"      },
  "E2M+EH":   { category: "오일펌프(중대형 E2M)",    code: "E2M+EH",       title: "오일펌프 + 루츠 부스터 조합",     image: "/images/products/rv.jpeg"      },
  "nES+EH":   { category: "오일펌프(nES)",            code: "nES+EH",       title: "oES + 루츠 부스터 조합",          image: "/images/products/rv.jpeg"      },
  "GXS":      { category: "산업용드라이펌프(GXS)",   code: "GXS 시리즈",   title: "산업용 드라이 스크류",            image: "/images/products/gxs.jpeg"     },
  "EXS":      { category: "산업용드라이펌프(EXS)",   code: "EXS 시리즈",   title: "부식성 환경 드라이 스크류",       image: "/images/products/exs.jpeg"     },
  "EDS":      { category: "산업용드라이펌프(GXS)",   code: "EDS 시리즈",   title: "산업용 드라이 스크류 (EDS)",      image: "/images/products/gxs.jpeg"     },
  "EDC":      { category: "산업용드라이펌프(GXS)",   code: "EDC 시리즈",   title: "드라이 클로 펌프",                image: "/images/products/gxs.jpeg"     },
  "GXS+GXB":  { category: "산업용드라이펌프(GXS)",   code: "GXS+GXB",      title: "산업용 드라이 + 부스터 조합",     image: "/images/products/gxs.jpeg"     },
  "nXDS":     { category: "스크롤펌프(소형 nXDS)",   code: "nXDS 시리즈",  title: "드라이 스크롤 펌프 (소형)",       image: "/images/products/xds.jpeg"     },
  "XDS":      { category: "스크롤펌프(중형 XDS)",    code: "XDS 시리즈",   title: "드라이 스크롤 펌프 (중형)",       image: "/images/products/xds.jpeg"     },
  "nXRi":     { category: "반도체드라이펌프(nXRi)",  code: "nXRi 시리즈",  title: "멀티루츠 드라이 펌프",            image: "/images/products/ixh-ixl.jpeg" },
  "iXH":      { category: "반도체드라이펌프(iXH)",   code: "iXH 시리즈",   title: "반도체 드라이 펌프 (iXH)",        image: "/images/products/ixh-ixl.jpeg" },
  "nXL":      { category: "반도체드라이펌프(iXL)",   code: "iXL 시리즈",   title: "반도체 드라이 펌프 (iXL)",        image: "/images/products/ixh-ixl.jpeg" },
  "EH":       { category: "부스터펌프(EH)",           code: "EH 시리즈",    title: "루츠 부스터 펌프",                image: "/images/products/eh.jpeg"      },
  "nEXT":     { category: "터보펌프(nEXT)",           code: "nEXT 시리즈",  title: "터보분자 펌프 (nEXT)",            image: "/images/products/next.png"     },
};

const PUMP_L1 = ["오일펌프", "드라이펌프", "부스터펌프", "터보펌프"];

const PUMP_L2_MAP: Record<string, string[]> = {
  "오일펌프":   ["1단펌프", "2단펌프"],
  "드라이펌프": ["산업용 드라이", "반도체 드라이", "연구소용 드라이"],
};

const PUMP_L3_MAP: Record<string, string[]> = {
  "1단펌프":       ["오일 단독", "오일 단독 + 부스터펌프"],
  "2단펌프":       ["오일 단독", "오일 단독 + 부스터펌프"],
  "산업용 드라이": ["드라이 단독", "드라이 + 부스터 조합"],
  "반도체 드라이": ["드라이 단독", "드라이 + 부스터 조합"],
  "연구소용 드라이": ["드라이 단독", "드라이 + 부스터 조합"],
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

// TMP 시리즈/모델별 백킹펌프 후보 (고정 매핑 — 실제 운용 조합 기준)
// model 키가 series 키보다 우선 적용됨
const TMP_BACKING_MAP: Record<string, string[]> = {
  "iS":        ["GXS160/1750", "GXS250/2600"],
  "iXA":       ["GXS250/2600", "GXS450/4200", "GXS750/4200"],
  "nEXT240D":  ["nXDS10i", "nXDS15i"],
  "nEXT300D":  ["nXDS10i", "nXDS15i"],
  "nEXT400D":  ["nXDS10i", "nXDS15i"],
  "nEXT730D":  ["nXR120i"],
  "nEXT930D":  ["nXR120i"],
  "nEXT1230H": ["GXS160/1750"],
  "nEXT2807M": ["GXS160/1750", "GXS250/2600"],
  "nEXT3207M": ["GXS250/2600", "GXS450/4200"],
};

// XDD1 드라이 다이어프램 펌프 — ALL_PUMPS 미등재, 로컬 프록시
const XDD1_PROXY: PumpModel = {
  model: "XDD1", series: "XDD", type: "dry_scroll",
  speed50Hz: 1.2, speed60Hz: 1.5, ultimate: 3.5, motorKW_50Hz: 0.1,
};

// 압력 단위 변환 상수
const MBAR_TO_TORR = 0.750064;
const MBAR_TO_PA   = 100;

type PressureUnit = "mbar" | "Torr" | "Pa";
type TimeUnit     = "s" | "min";

function mbarToUnit(mbar: number, unit: PressureUnit): number {
  if (unit === "Torr") return mbar * MBAR_TO_TORR;
  if (unit === "Pa")   return mbar * MBAR_TO_PA;
  return mbar;
}

function unitToMbar(val: number, unit: PressureUnit): number {
  if (unit === "Torr") return val / MBAR_TO_TORR;
  if (unit === "Pa")   return val / MBAR_TO_PA;
  return val;
}

function fmtPressure(mbar: number, unit: PressureUnit): string {
  const val = mbarToUnit(mbar, unit);
  if (val === 0) return `0 ${unit}`;
  if (val >= 0.001) return `${+val.toPrecision(3)} ${unit}`;
  const decimals = Math.abs(Math.floor(Math.log10(val))) + 1;
  const trimmed = val.toFixed(decimals + 1)
    .replace(/(\.\d*[1-9])0+$/, '$1')
    .replace(/\.0*$/, '');
  return `${trimmed} ${unit}`;
}

// 압력 선택지 값은 항상 mbar 기준 내부값 — 라벨만 단위에 따라 동적 생성
const TARGET_P_VALUES_MBAR = ["10","1","0.1","0.01","0.001","0.0001","0.00001","0.000001","0.0000001"];
const TMP_TARGET_P_VALUES_MBAR = ["0.001","0.0001","0.00001","0.000001","0.0000001"];

function getTargetPOptions(unit: PressureUnit) {
  return TARGET_P_VALUES_MBAR.map((v, i) => ({
    label: fmtPressure(parseFloat(v), unit) + (i === TARGET_P_VALUES_MBAR.length - 1 ? ' (Max)' : ''),
    value: v,
  })).concat([{ label: '직접입력', value: '기타' }]);
}

function getTmpTargetPOptions(unit: PressureUnit) {
  return TMP_TARGET_P_VALUES_MBAR.map((v) => ({
    label: fmtPressure(parseFloat(v), unit),
    value: v,
  })).concat([{ label: "기타", value: "기타" }]);
}

function fmtTime(sec: number, unit: TimeUnit): string {
  if (unit === "min") {
    const min = sec / 60;
    if (min < 0.1) return "< 0.1분";
    return `${min.toFixed(1)}분`;
  }
  if (sec < 1)    return "< 1초";
  if (sec < 60)   return `${sec}초`;
  if (sec < 3600) return `${Math.floor(sec / 60)}분 ${sec % 60}초`;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}시간 ${m}분`;
}

function calcThroughputSlm(effectiveSpeed_m3h: number, target_mbar: number): number {
  const targetTorr = target_mbar * MBAR_TO_TORR;
  return effectiveSpeed_m3h * targetTorr * 0.02193;
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
    if (l2 === "연구소용 드라이") {
      if (l3 === "드라이 단독")          return ["nXDS", "XDS", "nXRi"];
      if (l3 === "드라이 + 부스터 조합") return ["XDS", "EH"];
      return ["nXDS", "XDS", "nXRi"];
    }
    if (l2 === "산업용 드라이") {
      if (l3 === "드라이 단독")          return ["GXS", "EXS", "EDS", "EDC"];
      if (l3 === "드라이 + 부스터 조합") return ["GXS+GXB"];
      return ["GXS", "EXS", "EDS", "EDC", "GXS+GXB"];
    }
    if (l2 === "반도체 드라이") {
      if (l3 === "드라이 단독")          return ["iXH", "iXL"];
      if (l3 === "드라이 + 부스터 조합") return ["iXH", "iXL"];
      return ["iXH", "iXL"];
    }
    return ["nXDS", "XDS", "nXRi", "GXS", "EXS", "EDS", "EDC", "GXS+GXB", "iXH", "iXL"];
  }
  return undefined;
}


export default function PumpSelector() {
  const { data: session } = useSession();
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [tab, setTab] = useState<Tab>("search");

  // AI 모델 인식 탭 상태
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanPreview, setScanPreview] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanProduct, setScanProduct] = useState<{ partNo: string; description: string; unitPrice: number | null; stock: number } | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
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

  const [pressureUnit, setPressureUnit] = useState<PressureUnit>("mbar");
  const [timeUnit, setTimeUnit]         = useState<TimeUnit>("s");
  const [panelItem, setPanelItem]       = useState<PanelItem | null>(null);

  const [results, setResults] = useState<PumpDownResult[] | null>(null);
  const [calcTargetMbar, setCalcTargetMbar] = useState<number | null>(null);
  const [calcError, setCalcError] = useState("");
  const [isCalc, setIsCalc] = useState(false);

  // ── 터보펌프 2단 계산 state ───────────────────────────────
  const [turboSeries, setTurboSeries] = useState("");
  const [turboTMP, setTurboTMP] = useState("");
  const [turboHvLen, setTurboHvLen] = useState("1");
  const [turboHvBends, setTurboHvBends] = useState("0");
  const [turboRoughLen, setTurboRoughLen] = useState("1");
  const [turboResult, setTurboResult] = useState<TurboPumpDownResult | null>(null);
  const [turboError, setTurboError] = useState("");
  const [turboIsCalc, setTurboIsCalc] = useState(false);

  const [cartLoading, setCartLoading] = useState<string | null>(null);
  const [cartAdded, setCartAdded] = useState<Set<string>>(new Set());

  // 선택된 TMP 객체
  const selectedTMPObj = TURBO_PUMPS.find(t => t.model === turboTMP) ?? null;

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
    // 커스텀 직접입력은 선택된 단위 기준 → mbar로 변환, 선택지값은 이미 mbar
    const rawParsed  = parseFloat(rawP);
    const target     = targetP === "기타"
                         ? unitToMbar(rawParsed, pressureUnit)
                         : rawParsed;
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
        setCalcTargetMbar(target);
      } catch {
        setCalcError("계산 중 오류가 발생했습니다.");
      } finally {
        setIsCalc(false);
      }
    }, 20);
  }

  // ── 터보펌프 2단 계산 ────────────────────────────────────
  function handleTurboCalc() {
    const tmp = selectedTMPObj;
    if (!tmp) { setTurboError("터보펌프 모델을 선택하세요."); return; }

    const rawVol  = form.chamberVol === "기타" ? chamberVolCustom : form.chamberVol;
    const rawP    = targetP === "기타" ? targetPCustom : targetP;
    const rawSpec = form.pipeSpec === "기타" ? pipeSpecCustom : form.pipeSpec;

    const vol    = parseFloat(rawVol);
    const tP     = targetP === "기타" ? unitToMbar(parseFloat(rawP), pressureUnit) : parseFloat(rawP);
    const roughID = rawSpec in PIPE_ID_MM ? PIPE_ID_MM[rawSpec] : (parseFloat(rawSpec) || 160);

    if (!vol || vol <= 0) { setTurboError("챔버 볼륨을 입력하세요."); return; }
    if (!tP  || tP  <= 0) { setTurboError("목표 압력을 입력하세요."); return; }
    if (tP >= TMP_TURNON_MBAR) {
      setTurboError(`목표 압력이 TMP 시동 압력(0.05 Torr / ${TMP_TURNON_MBAR.toFixed(4)} mbar) 이상입니다. 더 낮은 목표 압력을 설정하세요.`);
      return;
    }

    const hvID    = HV_FLANGE_ID[tmp.inletFlange] ?? 100;
    const hvLen   = parseFloat(turboHvLen) || 1;
    const hvBends = parseInt(turboHvBends) || 0;
    const roughLen = parseFloat(turboRoughLen) || 1;

    const calcInput = {
      chamberVol_L: vol,
      targetPressure_mbar: tP,
      hvPipeID_mm: hvID,
      hvPipeLength_m: hvLen,
      hvPipeBends: hvBends,
      roughPipeID_mm: roughID,
      roughPipeLength_m: roughLen,
    };

    setTurboError("");
    setTurboIsCalc(true);
    setTimeout(() => {
      try {
        if (tmp.integrated) {
          // 일체형: 내장 백킹펌프 사용
          const backingName = T_STATION_BACKING[tmp.model];
          const backing = backingName === "XDD1" ? XDD1_PROXY
            : ALL_PUMPS.find(p => p.model === backingName) ?? null;
          if (!backing) {
            setTurboError(`내장 백킹펌프(${backingName ?? "?"}) 데이터를 찾을 수 없습니다.`);
            return;
          }
          setTurboResult(calcTurboPumpDown(calcInput, tmp, backing));
        } else {
          // 독립형: TMP 모델/시리즈별 고정 백킹펌프 후보 → 가장 빠른 모델 자동 선정
          const backingNames = TMP_BACKING_MAP[tmp.model] ?? TMP_BACKING_MAP[tmp.series] ?? [];
          const candidates = backingNames
            .map(name => ALL_PUMPS.find(p => p.model === name))
            .filter((p): p is PumpModel => p != null);
          if (candidates.length === 0) {
            setTurboError("이 TMP 모델에 대한 백킹펌프 정보가 없습니다.");
            return;
          }
          let best: TurboPumpDownResult | null = null;
          let fallback: TurboPumpDownResult | null = null;
          for (const pump of candidates) {
            const r = calcTurboPumpDown(calcInput, tmp, pump);
            if (r.reachable) {
              if (!best || r.totalTime_s < best.totalTime_s) best = r;
            } else if (!fallback) {
              fallback = r;
            }
          }
          setTurboResult(best ?? fallback ?? calcTurboPumpDown(calcInput, tmp, candidates[0]));
        }
      } catch {
        setTurboError("계산 중 오류가 발생했습니다.");
      } finally {
        setTurboIsCalc(false);
      }
    }, 20);
  }

  async function handleAddToCart(partNo: string, desc: string) {
    setCartLoading(partNo);
    const result = await addToCartByPartNo(partNo, desc);
    setCartLoading(null);
    if (result === "ok") {
      setCartAdded(prev => new Set([...prev, partNo]));
      setTimeout(() => setCartAdded(prev => { const s = new Set(prev); s.delete(partNo); return s; }), 2000);
    }
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

  const newGlobalResults: FlatItem[] =
    !selectedCategory && search.trim().length >= 1
      ? spareItems.filter(
          (item) =>
            item.desc.toLowerCase().includes(search.toLowerCase()) ||
            item.partNo.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  async function handleScan() {
    if (!scanFile) return;
    setScanLoading(true);
    setScanResult(null);
    setScanProduct(null);
    try {
      const fd = new FormData();
      fd.append("photos", scanFile);
      const res = await fetch("/api/repair/identify", { method: "POST", body: fd });
      const data: ScanResult = await res.json();
      setScanResult(data);

      if ((data.confidence === "high" || data.confidence === "medium") && (data.modelName || data.partNo)) {
        const product = await autoAddToCart(data.modelName, data.partNo);
        if (product) setScanProduct(product);
      }
    } catch {
      setScanResult({ modelName: null, partNo: null, pumpFamily: "other", maker: "EDWARDS", confidence: "low", serialNo: null, notes: "오류가 발생했습니다. 다시 시도해주세요." });
    } finally {
      setScanLoading(false);
    }
  }

  async function autoAddToCart(modelName: string | null, scannedPartNo?: string | null): Promise<{ partNo: string; description: string; unitPrice: number | null; stock: number } | null> {
    try {
      type ProductRow = { id: number; partNo: string; description: string; displayPrice: number | null; stock: number };
      let base: ProductRow | null = null;

      // 1순위: 파트번호 직접 매칭 (명판의 CODE No. / Part No.)
      if (scannedPartNo) {
        const r = await fetch(`/api/products?q=${encodeURIComponent(scannedPartNo)}&limit=10`);
        const d = await r.json();
        base = ((d.products as ProductRow[]) ?? []).find((p) => p.partNo === scannedPartNo) ?? null;
      }

      // 2순위: 모델명으로 fallback
      if (!base && modelName) {
        const res = await fetch(`/api/products?q=${encodeURIComponent(modelName)}&limit=30`);
        const data = await res.json();
        const products: ProductRow[] = data.products ?? [];
        if (products.length === 0) return null;

        const upper = modelName.toUpperCase();
        const SPECIAL = ["3PH", " FX", "HT ", " HT", "IE2"];
        const isSpecial = (desc: string) => SPECIAL.some((s) => desc.toUpperCase().includes(s));

        const startsWithMatch = products
          .filter((p) => p.description.toUpperCase().startsWith(upper))
          .sort((a, b) => {
            const aSpec = isSpecial(a.description);
            const bSpec = isSpecial(b.description);
            if (aSpec && !bSpec) return 1;
            if (!aSpec && bSpec) return -1;
            return a.description.length - b.description.length;
          });

        base = startsWithMatch[0] ?? products.sort((a, b) => a.description.length - b.description.length)[0];
      }

      if (!base) return null;

      const cart = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
      const existing = cart.find((i: { productId: number }) => i.productId === base!.id);
      if (!existing) {
        cart.push({ productId: base.id, partNo: base.partNo, description: base.description, quantity: 1 });
        localStorage.setItem("quoteCart", JSON.stringify(cart));
      }
      window.dispatchEvent(new Event("quoteCartUpdated"));
      setTimeout(() => window.dispatchEvent(new Event("openScanQuote")), 2000);

      return { partNo: base.partNo, description: base.description, unitPrice: base.displayPrice, stock: base.stock ?? 0 };
    } catch {
      return null;
    }
  }

  function handleScanFile(file: File) {
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) return;
    setScanFile(file);
    setScanResult(null);
    setScanProduct(null);
    if (isPdf) {
      setScanPreview(URL.createObjectURL(file));
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setScanPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="mt-8">
      {/* 제품 패널 */}
      <ProductPanel
        item={panelItem}
        onClose={() => setPanelItem(null)}
        catalogUrl={panelItem ? (CATALOG_MAP[panelItem.category] ?? undefined) : undefined}
      />

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {/* 제품 검색 */}
        <button
          onClick={() => { setTab("search"); setSelectedCategory(null); setSearch(""); }}
          className="flex flex-col items-center justify-center py-4 px-3 border bg-paper text-ink border-ink hover:bg-ink hover:text-paper transition-colors"
        >
          <span className="text-[15px] font-semibold tracking-tight">제품 검색</span>
        </button>

        {/* AI 모델 인식 */}
        <button
          onClick={() => { setTab("scan"); setScanResult(null); }}
          className={`flex flex-col items-center justify-center py-4 px-3 border transition-colors ${
            tab === "scan"
              ? "bg-edred text-paper border-edred"
              : "bg-edred text-paper border-edred hover:bg-ink hover:border-ink"
          }`}
        >
          <span className="text-[15px] font-semibold tracking-tight">AI 모델 인식</span>
          <span className="mono text-[10px] tracking-[0.06em] mt-0.5 text-paper">
            명판 사진으로 즉시 견적
          </span>
        </button>

        {/* 펌프선정 및 시뮬레이션 */}
        <button
          onClick={() => {
            if (!session) { setShowLoginGate(true); return; }
            setTab("selection"); setSelectedCategory(null);
          }}
          className="group flex flex-col items-center justify-center py-4 px-3 border bg-paper text-ink border-ink hover:bg-ink hover:text-paper transition-colors"
        >
          <span className="text-[15px] font-semibold tracking-tight">펌프선정 및 시뮬레이션</span>
          <span className="mono text-[10px] tracking-[0.06em] mt-0.5 text-ink/60 group-hover:text-paper/70">
            {!session ? "🔒 로그인 필요" : "공정 조건 기반 자동 선정"}
          </span>
        </button>
      </div>

      {/* 로그인 게이트 오버레이 */}
      {showLoginGate && (
        <div className="relative mt-6">
          <div className="absolute inset-0 z-10 bg-paper/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 border hair min-h-[320px]">
            <div className="mono text-[10px] tracking-[0.16em] uppercase text-dim mb-4">로그인 필요</div>
            <h3 className="display text-[22px] leading-tight text-center mb-2">
              펌프선정 및 시뮬레이션은<br />로그인 후 이용 가능합니다
            </h3>
            <p className="text-[12px] text-dim text-center mb-6">
              로그인하시면 공정 조건에 맞는 최적 펌프를<br />자동으로 시뮬레이션해 드립니다.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 bg-ink text-paper text-[13px] mono tracking-wider hover:bg-edred transition-colors mb-3"
            >
              로그인하기 →
            </Link>
            <button
              onClick={() => setShowLoginGate(false)}
              className="text-[12px] text-dim hover:text-ink transition-colors"
            >
              계속 둘러보기
            </button>
          </div>
          <div className="min-h-[320px]" />
        </div>
      )}

      <div className="mt-6">
        {/* AI 모델 인식 */}
        {tab === "scan" && (
          <div>
            <p className="text-[14px] text-[#6A6660] mb-5">
              펌프에 부착된 <strong>명판(Nameplate)</strong> 사진을 업로드하면 AI가 모델을 자동으로 인식합니다.
            </p>

            {/* 업로드 영역 */}
            {!scanPreview ? (
              <div
                onClick={() => scanInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleScanFile(f); }}
                className="border-2 border-dashed border-ink/20 hover:border-ink/50 transition-colors cursor-pointer flex flex-col items-center justify-center py-14 gap-3 bg-[#F6F4EF]"
              >
                <svg className="w-10 h-10 text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-center">
                  <p className="text-[14px] font-medium text-ink">사진 업로드 또는 촬영</p>
                  <p className="mono text-[11px] text-dim mt-1">클릭하거나 사진을 드래그해서 놓으세요</p>
                  <p className="mono text-[10px] text-dim/60 mt-1">JPG · PNG · WEBP 지원</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 미리보기 */}
                <div className="relative border hair overflow-hidden">
                  {scanFile?.type === "application/pdf" ? (
                    <embed
                      src={scanPreview}
                      type="application/pdf"
                      className="w-full h-64 pointer-events-none bg-[#F6F4EF]"
                    />
                  ) : (
                    <img src={scanPreview} alt="명판 사진" className="w-full max-h-64 object-contain bg-[#F6F4EF]" />
                  )}
                  <button
                    onClick={() => { setScanFile(null); setScanPreview(""); setScanResult(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-ink/70 text-paper flex items-center justify-center text-[14px] hover:bg-edred transition-colors"
                  >×</button>
                </div>

                {/* 분석 결과 */}
                {!scanResult && (
                  <button
                    onClick={handleScan}
                    disabled={scanLoading}
                    className="w-full py-3 bg-ink text-paper text-[14px] font-semibold hover:bg-edred transition-colors disabled:opacity-50"
                  >
                    {scanLoading ? "AI 분석 중..." : "AI 모델 인식 시작 →"}
                  </button>
                )}

                {scanResult && (
                  <div className={`border p-5 space-y-3 ${
                    scanResult.confidence === "high" ? "border-green-300 bg-green-50" :
                    scanResult.confidence === "medium" ? "border-yellow-300 bg-yellow-50" :
                    "border-red-200 bg-red-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`mono text-[10px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded ${
                        scanResult.confidence === "high" ? "bg-green-200 text-green-800" :
                        scanResult.confidence === "medium" ? "bg-yellow-200 text-yellow-800" :
                        "bg-red-200 text-red-800"
                      }`}>
                        {scanResult.confidence === "high" ? "인식 완료" : scanResult.confidence === "medium" ? "부분 인식" : "인식 불가"}
                      </span>
                      <button onClick={() => { setScanFile(null); setScanPreview(""); setScanResult(null); }} className="mono text-[10px] text-dim hover:text-ink">다시 촬영</button>
                    </div>

                    {scanResult.modelName && (
                      <div>
                        <div className="mono text-[10px] text-dim uppercase tracking-[0.1em] mb-1">인식된 모델</div>
                        <div className="text-[20px] font-bold tracking-tight">{scanResult.modelName}</div>
                        {scanResult.maker && <div className="mono text-[11px] text-dim mt-0.5">{scanResult.maker}</div>}

                        {/* 가격 · 납기 */}
                        {scanProduct && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="border hair px-3 py-2 bg-paper">
                              <div className="mono text-[9px] tracking-[0.12em] uppercase text-dim mb-1">공급 가격</div>
                              <div className="text-[15px] font-bold tracking-tight">
                                {scanProduct.unitPrice
                                  ? `₩ ${scanProduct.unitPrice.toLocaleString("ko-KR")}`
                                  : <span className="text-[12px] text-dim font-normal">로그인 후 확인</span>
                                }
                              </div>
                            </div>
                            <div className="border hair px-3 py-2 bg-paper">
                              <div className="mono text-[9px] tracking-[0.12em] uppercase text-dim mb-1">납기</div>
                              <div className="text-[13px] font-semibold tracking-tight">
                                {scanProduct.stock > 0
                                  ? <span className="text-green-700">국내 재고 보유</span>
                                  : <span className="text-dim font-normal">납기 협의</span>
                                }
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-[12px] text-dim leading-relaxed">{scanResult.notes}</p>

                    {(scanResult.confidence === "high" || scanResult.confidence === "medium") && scanResult.modelName ? (
                      <div className="pt-1 space-y-2">
                        <div className="flex items-center gap-2 py-2.5 px-3 bg-green-100 border border-green-300">
                          <span className="text-green-700 text-[13px]">✓</span>
                          <span className="text-[12px] text-green-800 font-medium">견적서에 자동 추가됐습니다. 잠시 후 견적서가 열립니다.</span>
                        </div>
                        <button
                          onClick={() => { setTab("search"); setSearch(scanResult.modelName!); setSelectedCategory(null); }}
                          className="w-full py-2 border hair text-ink text-[12px] hover:bg-ink hover:text-paper transition-colors"
                        >
                          다른 사양 직접 검색 →
                        </button>
                      </div>
                    ) : (
                      <div className="pt-1 space-y-2">
                        <p className="text-[12px] text-dim">명판이 잘 보이도록 다시 촬영하거나, 모델명을 직접 입력해 검색해보세요.</p>
                        <button
                          onClick={() => { setTab("search"); setScanFile(null); setScanPreview(""); setScanResult(null); }}
                          className="w-full py-2.5 border hair text-ink text-[13px] hover:bg-ink hover:text-paper transition-colors"
                        >
                          모델명 직접 검색 →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <input ref={scanInputRef} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleScanFile(f); }} />

            {/* 촬영 팁 */}
            {!scanPreview && (
              <div className="mt-5 border hair p-4 bg-ink/[0.015]">
                <div className="mono text-[9px] tracking-[0.16em] uppercase text-dim mb-2">명판 촬영 팁</div>
                <ul className="space-y-1">
                  {["명판 전체가 화면에 들어오도록 가까이 촬영하세요", "글자가 흐리지 않게 초점을 맞춰주세요", "그림자가 생기지 않도록 밝은 곳에서 촬영하세요"].map((tip, i) => (
                    <li key={i} className="text-[12px] text-dim flex gap-2">
                      <span className="text-edred shrink-0">·</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 제품 검색 */}
        {tab === "search" && (
          <div>
            {!selectedCategory ? (
              <>
                <p className="text-[14px] text-[#6A6660] mb-3">신규 도입할 제품을 선택하거나 파트번호·모델명으로 검색하세요.</p>
                <input
                  type="text"
                  placeholder="파트번호 또는 모델명 검색 (예: A65301903, EH250)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border-2 border-ink px-3 py-2.5 text-[14px] focus:outline-none focus:border-edred bg-transparent mb-3 placeholder:text-[#2a2823] transition-colors"
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
                          <div className="shrink-0 ml-4 flex items-center gap-2">
                            <div className="text-[12px] font-semibold text-[#c00020]">
                              {item.price.toLocaleString()}원
                            </div>
                            <button
                              onClick={() => handleAddToCart(item.partNo, item.desc)}
                              disabled={cartLoading === item.partNo}
                              className={`px-2.5 py-1 text-[11px] border transition-colors whitespace-nowrap ${cartAdded.has(item.partNo) ? "bg-ink text-paper border-ink" : "border-[#E3DFD6] hover:border-ink hover:bg-ink hover:text-paper"} disabled:opacity-50`}
                            >
                              {cartAdded.has(item.partNo) ? "✓" : cartLoading === item.partNo ? "…" : "담기"}
                            </button>
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
                        className="border border-ink/25 p-3 text-left hover:border-ink hover:bg-ink hover:text-paper transition-all group"
                      >
                        <div className="text-[13px] font-semibold leading-snug">{item.category}</div>
                        <div className="text-[11px] text-[#6A6660] mt-1 group-hover:text-paper/70 leading-snug">
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
                            <div className="shrink-0 ml-4 flex items-center gap-2">
                              <div className="text-[12px] font-semibold text-[#c00020]">
                                {item.price.toLocaleString()}원
                              </div>
                              <button
                                onClick={() => handleAddToCart(item.partNo, item.desc)}
                                disabled={cartLoading === item.partNo}
                                className={`px-2.5 py-1 text-[11px] border transition-colors whitespace-nowrap ${cartAdded.has(item.partNo) ? "bg-ink text-paper border-ink" : "border-[#E3DFD6] hover:border-ink hover:bg-ink hover:text-paper"} disabled:opacity-50`}
                              >
                                {cartAdded.has(item.partNo) ? "✓" : cartLoading === item.partNo ? "…" : "담기"}
                              </button>
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

                <Link
                  href="/quote"
                  className="mt-4 w-full bg-ink text-paper py-3 text-[13px] hover:bg-[#c00020] transition-colors block text-center"
                >
                  견적 카트 보기 →
                </Link>
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
                <label className="text-[10px] mono text-ink font-medium uppercase tracking-wider">사용공정</label>
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
                      onClick={() => { setPumpL1(""); setPumpL2(""); setPumpL3(""); setTurboSeries(""); setTurboTMP(""); setTurboResult(null); }}
                      className="ml-1 text-[10px] text-[#6A6660] hover:text-[#c00020] underline"
                    >초기화</button>
                  </div>
                )}
                <div>
                  <div className="text-[10px] text-[#6A6660] mb-1.5">펌프 분류</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PUMP_L1.map((opt) => (
                      <button key={opt}
                        onClick={() => { setPumpL1(opt); setPumpL2(""); setPumpL3(""); setTurboSeries(""); setTurboTMP(""); setTurboResult(null); }}
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
                            onClick={() => { setTurboSeries(s); setTurboTMP(""); setTurboResult(null); }}
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
                              onClick={() => { setTurboTMP(t.model); setTurboResult(null); }}
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

              {/* 백킹펌프: 고정 후보 안내 (standalone TMP) */}
              {pumpL1 === "터보펌프" && selectedTMPObj && !selectedTMPObj.integrated && (() => {
                const names = TMP_BACKING_MAP[selectedTMPObj.model] ?? TMP_BACKING_MAP[selectedTMPObj.series] ?? [];
                if (names.length === 0) return null;
                return (
                  <div className="border border-[#E3DFD6] px-3 py-2 bg-[#F6F4EF] text-[11px] text-[#6A6660] leading-relaxed">
                    백킹펌프 후보: <span className="font-semibold text-ink">{names.join(" / ")}</span>
                    {names.length > 1 && <span className="ml-1">— 계산 후 최적 모델 자동 선정</span>}
                  </div>
                );
              })()}

              {/* 챔버볼륨 + 목표압력 (같은 행) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] mono text-ink font-medium uppercase tracking-wider">
                    챔버볼륨 (L) <span className="text-[#c00020]">*</span>
                  </label>
                  <select
                    value={form.chamberVol}
                    onChange={(e) => { setForm({ ...form, chamberVol: e.target.value }); if (e.target.value !== "기타") setChamberVolCustom(""); }}
                    className={`mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent${form.chamberVol === "기타" ? " text-[#9A9590]" : ""}`}
                  >
                    <option value="">선택</option>
                    {["1","10","100","1000","3000","5000","10000","20000","30000","50000"].map((v) => (
                      <option key={v} value={v}>{Number(v).toLocaleString()}L</option>
                    ))}
                    <option value="60000">60,000L (Max)</option>
                    <option value="기타">직접입력</option>
                  </select>
                  {form.chamberVol === "기타" && (
                    <input type="text" placeholder="직접 입력 (L)"
                      value={chamberVolCustom} onChange={(e) => setChamberVolCustom(e.target.value)}
                      className="mt-1.5 w-full border border-ink px-3 py-2 text-[13px] text-ink focus:outline-none bg-transparent"
                    />
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] mono text-ink font-medium uppercase tracking-wider">
                      목표 도달압력 <span className="text-[#c00020]">*</span>
                    </label>
                    <div className="flex gap-1">
                      {(["mbar","Torr","Pa"] as PressureUnit[]).map((u) => (
                        <button key={u}
                          onClick={() => setPressureUnit(u)}
                          className={`px-1.5 py-0.5 text-[10px] border transition-colors ${pressureUnit === u ? "bg-ink text-paper border-ink" : "border-[#E3DFD6] text-[#6A6660] hover:border-ink"}`}
                        >{u}</button>
                      ))}
                    </div>
                  </div>
                  <select
                    value={targetP}
                    onChange={(e) => { setTargetP(e.target.value); if (e.target.value !== "기타") setTargetPCustom(""); }}
                    className={`w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent${targetP === "기타" ? " text-[#9A9590]" : ""}`}
                  >
                    <option value="">선택</option>
                    {getTargetPOptions(pressureUnit).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {targetP === "기타" && (
                    <input type="text" placeholder={`직접 입력 (${pressureUnit})`}
                      value={targetPCustom} onChange={(e) => setTargetPCustom(e.target.value)}
                      className="mt-1.5 w-full border border-ink px-3 py-2 text-[13px] text-ink focus:outline-none bg-transparent"
                    />
                  )}
                </div>
              </div>

              {/* 배관 — 러핑(기존) / HV(터보) */}
              {pumpL1 !== "터보펌프" ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] mono text-ink font-medium uppercase tracking-wider">
                      배관규격 <span className="text-[#c00020]">*</span>
                    </label>
                    <select
                      value={form.pipeSpec}
                      onChange={(e) => { setForm({ ...form, pipeSpec: e.target.value }); if (e.target.value !== "기타") setPipeSpecCustom(""); }}
                      className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                    >
                      <option value="">선택</option>
                      {PIPE_SPEC_OPTIONS.filter(o => o !== "기타").map((o) => <option key={o} value={o}>{o}</option>)}
                      <option value="기타">직접입력</option>
                    </select>
                    {form.pipeSpec === "기타" && (
                      <input type="text" placeholder="내경 mm"
                        value={pipeSpecCustom} onChange={(e) => setPipeSpecCustom(e.target.value)}
                        className="mt-1.5 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] mono text-ink font-medium uppercase tracking-wider">
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
                      <option value="기타">직접입력</option>
                    </select>
                    {form.pipeLen === "기타" && (
                      <input type="text" placeholder="직접 입력 (m)"
                        value={pipeLenCustom} onChange={(e) => setPipeLenCustom(e.target.value)}
                        className="mt-1.5 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] mono text-ink font-medium uppercase tracking-wider">꺾임 (회)</label>
                    <select
                      value={form.bends}
                      onChange={(e) => { setForm({ ...form, bends: e.target.value }); if (e.target.value !== "기타") setBendsCustom(""); }}
                      className="mt-1 w-full border border-[#E3DFD6] px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-transparent"
                    >
                      <option value="">0회</option>
                      {["1","2","3","4","5"].map((v) => (
                        <option key={v} value={v}>{v}회</option>
                      ))}
                      <option value="기타">직접입력</option>
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
                          <label className="text-[10px] text-[#6A6660]">규격 (주배관 기준)</label>
                          <div className="mt-1 border border-[#E3DFD6] px-3 py-2 text-[13px] bg-[#F6F4EF] text-[#6A6660]">
                            {form.pipeSpec === "기타" ? (pipeSpecCustom || "—") : (form.pipeSpec || "—")}
                          </div>
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
                  <div className="px-4 py-2.5 bg-[#F6F4EF] border-b border-[#E3DFD6]">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-semibold mono uppercase tracking-wider">계산 결과</span>
                      <span className="text-[10px] text-[#6A6660]">{turboResult.turboModel}</span>
                    </div>
                    {selectedTMPObj && !selectedTMPObj.integrated && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[9px] bg-ink text-paper px-1.5 py-0.5 font-medium tracking-wide">자동 선정</span>
                        <span className="text-[12px] font-semibold text-ink">{turboResult.backingModel}</span>
                        <span className="text-[10px] text-[#6A6660]">백킹펌프 (GXS 시리즈 중 최적)</span>
                      </div>
                    )}
                  </div>
                  {!turboResult.reachable ? (
                    <div className="px-4 py-4 text-[12px] text-[#6A6660] leading-relaxed">
                      24시간 내 목표 압력 도달 어려움 —
                      챔버가 크거나 목표 진공도가 매우 낮아 장시간 펌핑이 필요합니다.
                      목표 압력을 높이거나 더 큰 TMP를 검토하세요.
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center px-4 py-3 border-b border-[#E3DFD6] gap-3">
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center text-[9px] font-bold border border-[#E3DFD6] text-[#6A6660]">1</div>
                        <div className="flex-1">
                          <div className="text-[12px] font-medium">Stage 1 — 러핑</div>
                          <div className="text-[10px] text-[#6A6660] mono mt-0.5">
                            대기압 → 0.05 Torr ({TMP_TURNON_MBAR.toFixed(4)} mbar) · {turboResult.backingModel}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[13px] font-semibold mono">{fmtTime(turboResult.stage1_s, timeUnit)}</div>
                        </div>
                      </div>
                      <div className="flex items-center px-4 py-3 border-b border-[#E3DFD6] gap-3">
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center text-[9px] font-bold border border-[#E3DFD6] text-[#6A6660]">2</div>
                        <div className="flex-1">
                          <div className="text-[12px] font-medium">Stage 2 — TMP 고진공</div>
                          <div className="text-[10px] text-[#6A6660] mono mt-0.5">
                            유효속도 {turboResult.tmpEffSpeed_Ls} L/s · 한계 {fmtPressure(turboResult.ultimateSystem_mbar, pressureUnit)}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[13px] font-semibold mono">{fmtTime(turboResult.stage2_s, timeUnit)}</div>
                          <div className="text-[10px] text-[#6A6660]">{turboResult.turboModel}</div>
                        </div>
                      </div>
                      <div className="flex items-center px-4 py-3 bg-[#F6F4EF] gap-3">
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center text-[9px] font-bold bg-ink text-paper">∑</div>
                        <div className="flex-1">
                          <div className="text-[12px] font-semibold">총 펌프다운 시간</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[15px] font-bold mono text-ink">{fmtTime(turboResult.totalTime_s, timeUnit)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {turboResult.reachable && (
                    <div className="px-4 py-3 border-t border-[#E3DFD6] flex gap-2">
                      <Link
                        href={`/products?q=${encodeURIComponent(turboResult.turboModel)}`}
                        className="flex-1 text-center text-[11px] border border-[#E3DFD6] py-2 hover:border-ink hover:bg-ink hover:text-paper transition-colors"
                      >
                        {turboResult.turboModel} 카탈로그 →
                      </Link>
                      <Link
                        href={`/products?q=${encodeURIComponent(turboResult.backingModel)}`}
                        className="flex-1 text-center text-[11px] border border-[#E3DFD6] py-2 hover:border-ink hover:bg-ink hover:text-paper transition-colors"
                      >
                        {turboResult.backingModel} 카탈로그 →
                      </Link>
                    </div>
                  )}
                  <div className="px-4 py-2.5 border-t border-[#E3DFD6] bg-[#F6F4EF]">
                    <p className="text-[10px] text-[#6A6660] leading-relaxed">
                      ※ TMP 스핀업 시간(1~3분)은 포함되지 않습니다. SUS, 아웃게싱 시간 의존형 모델(1.9×10⁻⁷ mbar·L/s·cm² @ 1h 기준) 적용.
                      백킹펌프는 TMP 모델별 실운용 조합 중 최적 자동 선정. 최종 선정은 스마텍 전문가 검토를 권장합니다.
                    </p>
                  </div>
                </div>
              )}

              {/* ── 계산 결과 (일반) ─────────────────────────── */}
              {pumpL1 !== "터보펌프" && results !== null && (
                <div className="border border-[#E3DFD6] mt-2">
                  {/* 결과 헤더 */}
                  <div className="px-4 py-2.5 bg-[#F6F4EF] border-b border-[#E3DFD6] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold mono uppercase tracking-wider">계산 결과</span>
                      <span className="ml-3 text-[10px] text-[#6A6660]">
                        목표 {fmtPressure(parseFloat(targetP === "기타" ? String(unitToMbar(parseFloat(targetPCustom), pressureUnit)) : targetP), pressureUnit)}
                        {" · "}{Number(form.chamberVol === "기타" ? chamberVolCustom : form.chamberVol).toLocaleString()}L
                        {" · "}{form.pipeSpec === "기타" ? pipeSpecCustom : form.pipeSpec}
                        {" "}{form.pipeLen === "기타" ? pipeLenCustom : form.pipeLen}m
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {/* 처리량 컬럼 레이블 */}
                      <div className="text-right">
                        <div className="text-[10px] font-semibold text-[#6A6660] uppercase tracking-wider">처리량</div>
                        <div className="text-[10px] text-[#6A6660]">
                          @ {calcTargetMbar != null ? fmtPressure(calcTargetMbar, pressureUnit) : ""}
                        </div>
                      </div>
                      {/* 구분선 */}
                      <div className="w-px h-6 bg-[#E3DFD6]" />
                      {/* 시간 단위 선택 */}
                      <div className="flex gap-1">
                        {(["s","min"] as TimeUnit[]).map((u) => (
                          <button key={u}
                            onClick={() => setTimeUnit(u)}
                            className={`px-1.5 py-0.5 text-[10px] border transition-colors ${timeUnit === u ? "bg-ink text-paper border-ink" : "border-[#E3DFD6] text-[#6A6660] hover:border-ink"}`}
                          >{u === "s" ? "초" : "분"}</button>
                        ))}
                      </div>
                    </div>
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
                      {results.map((r, i) => {
                        const throughput = calcThroughputSlm(r.effectiveSpeed_m3h, calcTargetMbar ?? 0);
                        return (
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

                            {/* 처리량 — 숫자만, 레이블은 헤더에 */}
                            <div className="shrink-0 text-right">
                              <div className="text-[12px] font-semibold mono">
                                {throughput >= 10 ? throughput.toFixed(1) : throughput.toFixed(3)} slm
                              </div>
                            </div>

                            {/* 시간 + 카탈로그 */}
                            <div className="shrink-0 text-right">
                              <div className={`text-[13px] font-semibold mono ${i === 0 ? "text-ink" : ""}`}>
                                {fmtTime(r.pumpDownTime_s, timeUnit)}
                              </div>
                              <button
                                onClick={() => setPanelItem(SERIES_PANEL_MAP[r.series] ?? null)}
                                className="mt-1 block text-[10px] text-[#6A6660] hover:text-ink underline w-full text-right"
                              >
                                카탈로그 →
                              </button>
                            </div>
                          </div>
                        );
                      })}
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
                  window.open(`mailto:info@smartechvacuum.com?subject=${sub}&body=${body}`, "_blank");
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
