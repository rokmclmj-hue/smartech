/**
 * 카탈로그에서 추출한 펌프 성능 데이터
 * 출처: Edwards 제품 카탈로그 (스마텍 보유본)
 * 배기속도 단위: m³/h  |  도달진공도 단위: mbar
 *
 * Speed Curve(압력별 배기속도)는 카탈로그 내 이미지 그래프로만 존재.
 * 현재는 정격(peak) 배기속도 기준으로 pump-down time 근사 계산.
 * → Edwards에 CSV 데이터 확보 시 speedCurve 배열을 추가할 것.
 */

export type PumpType = "oil_vane" | "dry_scroll" | "dry_screw" | "booster" | "turbo";

export type PumpModel = {
  model: string;
  series: string;
  type: PumpType;
  speed50Hz: number;   // m³/h
  speed60Hz: number;   // m³/h
  ultimate: number;    // mbar (without gas ballast)
  motorKW_50Hz: number;
  inletFlange?: string;
  /** [pressure_mbar, speed_m3h][] — Edwards로부터 수치 확보 시 채움 */
  speedCurve?: [number, number][];
};

// ─────────────────────────────────────────────────────
// RV 오일 로터리 베인 (소형)
// Source: 1.오일펌프_소형RV.pdf p6
// ─────────────────────────────────────────────────────
const RV: PumpModel[] = [
  { model:"RV3",  series:"RV", type:"oil_vane", speed50Hz:3.3,  speed60Hz:4.0,  ultimate:2.0e-3, motorKW_50Hz:0.09, inletFlange:"NW16" },
  { model:"RV5",  series:"RV", type:"oil_vane", speed50Hz:5.1,  speed60Hz:6.2,  ultimate:2.0e-3, motorKW_50Hz:0.09, inletFlange:"NW25" },
  { model:"RV8",  series:"RV", type:"oil_vane", speed50Hz:8.5,  speed60Hz:10.2, ultimate:2.0e-3, motorKW_50Hz:0.18, inletFlange:"NW25" },
  { model:"RV12", series:"RV", type:"oil_vane", speed50Hz:12.0, speed60Hz:14.4, ultimate:2.0e-3, motorKW_50Hz:0.25, inletFlange:"NW25" },
];

// ─────────────────────────────────────────────────────
// E2M 오일 로터리 베인 (소형 E2M0.7~28)
// Source: 1-1.오일펌프_소형E2M.pdf p2
// ─────────────────────────────────────────────────────
const E2M_small: PumpModel[] = [
  { model:"E2M0.7", series:"E2M_small", type:"oil_vane", speed50Hz:0.75, speed60Hz:0.90, ultimate:3.0e-3, motorKW_50Hz:0.09 },
  { model:"E2M1.5", series:"E2M_small", type:"oil_vane", speed50Hz:1.6,  speed60Hz:1.9,  ultimate:3.0e-3, motorKW_50Hz:0.16 },
  { model:"E2M18",  series:"E2M_small", type:"oil_vane", speed50Hz:17.0, speed60Hz:20.4, ultimate:1.0e-3, motorKW_50Hz:0.55, inletFlange:"NW40" },
  { model:"E2M28",  series:"E2M_small", type:"oil_vane", speed50Hz:27.5, speed60Hz:33.0, ultimate:1.0e-3, motorKW_50Hz:0.75, inletFlange:"NW40" },
];

// ─────────────────────────────────────────────────────
// E2M 오일 로터리 베인 (중대형 E2M40~275)
// Source: 2.오일펌프_중대형E2M.pdf
// ─────────────────────────────────────────────────────
const E2M_large: PumpModel[] = [
  { model:"E2M40",  series:"E2M_large", type:"oil_vane", speed50Hz:37,  speed60Hz:44,  ultimate:3.0e-3, motorKW_50Hz:1.1,  inletFlange:"NW40"  },
  { model:"E2M80",  series:"E2M_large", type:"oil_vane", speed50Hz:74,  speed60Hz:90,  ultimate:3.0e-3, motorKW_50Hz:2.2,  inletFlange:"NW50"  },
  { model:"E2M175", series:"E2M_large", type:"oil_vane", speed50Hz:160, speed60Hz:196, ultimate:3.0e-3, motorKW_50Hz:5.5,  inletFlange:"ISO100" },
  { model:"E2M275", series:"E2M_large", type:"oil_vane", speed50Hz:255, speed60Hz:306, ultimate:3.0e-3, motorKW_50Hz:7.5,  inletFlange:"ISO100" },
];

// ─────────────────────────────────────────────────────
// nES 오일 로터리 베인 (대형)
// Source: 3.오일펌프_nES.pdf p6-7
// ─────────────────────────────────────────────────────
const nES: PumpModel[] = [
  { model:"nES40",   series:"nES", type:"oil_vane", speed50Hz:38.5, speed60Hz:47.0,  ultimate:0.5,  motorKW_50Hz:1.3  },
  { model:"nES65",   series:"nES", type:"oil_vane", speed50Hz:54.0, speed60Hz:64.0,  ultimate:0.5,  motorKW_50Hz:1.8  },
  { model:"nES100",  series:"nES", type:"oil_vane", speed50Hz:87.5, speed60Hz:105.0, ultimate:0.5,  motorKW_50Hz:3.0  },
  { model:"nES200",  series:"nES", type:"oil_vane", speed50Hz:170,  speed60Hz:200,   ultimate:0.08, motorKW_50Hz:4.5  },
  { model:"nES300",  series:"nES", type:"oil_vane", speed50Hz:240,  speed60Hz:290,   ultimate:0.08, motorKW_50Hz:5.5  },
  { model:"nES300S", series:"nES", type:"oil_vane", speed50Hz:284,  speed60Hz:330,   ultimate:0.08, motorKW_50Hz:6.0  },
  { model:"nES470",  series:"nES", type:"oil_vane", speed50Hz:400,  speed60Hz:470,   ultimate:0.08, motorKW_50Hz:11.0 },
  { model:"nES570",  series:"nES", type:"oil_vane", speed50Hz:470,  speed60Hz:0,     ultimate:0.08, motorKW_50Hz:11.0 },
  { model:"nES630",  series:"nES", type:"oil_vane", speed50Hz:640,  speed60Hz:755,   ultimate:0.08, motorKW_50Hz:18.5 },
  { model:"nES750",  series:"nES", type:"oil_vane", speed50Hz:755,  speed60Hz:0,     ultimate:0.08, motorKW_50Hz:18.5 },
];

// ─────────────────────────────────────────────────────
// EH 루츠 부스터
// Source: 6.부스터펌프EH.pdf
// 모델명: EH500 / EH1200 / EH3000 / EH6500 / EH10000 (내부 명칭 추정)
// ─────────────────────────────────────────────────────
const EH: PumpModel[] = [
  { model:"EH500",   series:"EH", type:"booster", speed50Hz:310,  speed60Hz:375,  ultimate:0, motorKW_50Hz:2.2  },
  { model:"EH1200",  series:"EH", type:"booster", speed50Hz:505,  speed60Hz:605,  ultimate:0, motorKW_50Hz:2.2  },
  { model:"EH3000",  series:"EH", type:"booster", speed50Hz:1195, speed60Hz:1435, ultimate:0, motorKW_50Hz:3.0  },
  { model:"EH6500",  series:"EH", type:"booster", speed50Hz:2590, speed60Hz:3110, ultimate:0, motorKW_50Hz:11.0 },
  { model:"EH10000", series:"EH", type:"booster", speed50Hz:4140, speed60Hz:4985, ultimate:0, motorKW_50Hz:11.0 },
];

// ─────────────────────────────────────────────────────
// EXS 부식성 산업용 드라이 스크류
// Source: 7-1.산업용드라이_EXS.pdf
// ─────────────────────────────────────────────────────
const EXS: PumpModel[] = [
  { model:"EXS160",  series:"EXS", type:"dry_screw", speed50Hz:160, speed60Hz:192, ultimate:1.0e-2, motorKW_50Hz:0 },
  { model:"EXS250",  series:"EXS", type:"dry_screw", speed50Hz:250, speed60Hz:300, ultimate:1.0e-2, motorKW_50Hz:0 },
];

// ─────────────────────────────────────────────────────
// GXS / nXDS / XDS / iXH / nXRi / iXL / nEXT / STP
// 카탈로그가 이미지 기반 PDF — 수치 추출 불가
// Edwards 기술팀에 Speed Curve CSV 요청 필요
// ─────────────────────────────────────────────────────
const PENDING: PumpModel[] = [
  // GXS 산업용 드라이 스크류
  { model:"GXS160",  series:"GXS", type:"dry_screw", speed50Hz:0, speed60Hz:0, ultimate:0, motorKW_50Hz:0 },
  { model:"GXS250",  series:"GXS", type:"dry_screw", speed50Hz:0, speed60Hz:0, ultimate:0, motorKW_50Hz:0 },
  // nXDS 드라이 스크롤
  { model:"nXDS6i",  series:"nXDS", type:"dry_scroll", speed50Hz:0, speed60Hz:0, ultimate:0, motorKW_50Hz:0 },
  { model:"nXDS10i", series:"nXDS", type:"dry_scroll", speed50Hz:0, speed60Hz:0, ultimate:0, motorKW_50Hz:0 },
  { model:"nXDS15i", series:"nXDS", type:"dry_scroll", speed50Hz:0, speed60Hz:0, ultimate:0, motorKW_50Hz:0 },
  { model:"nXDS20i", series:"nXDS", type:"dry_scroll", speed50Hz:0, speed60Hz:0, ultimate:0, motorKW_50Hz:0 },
  // iXH 반도체 드라이
  { model:"iXH1200", series:"iXH", type:"dry_screw", speed50Hz:0, speed60Hz:0, ultimate:0, motorKW_50Hz:0 },
  // nXRi 반도체 드라이
  { model:"nXRi200", series:"nXRi", type:"dry_screw", speed50Hz:0, speed60Hz:0, ultimate:0, motorKW_50Hz:0 },
];

// ─────────────────────────────────────────────────────
// 전체 펌프 목록
// ─────────────────────────────────────────────────────
export const ALL_PUMPS: PumpModel[] = [
  ...RV, ...E2M_small, ...E2M_large, ...nES, ...EH, ...EXS, ...PENDING,
];

export const PUMPS_BY_SERIES: Record<string, PumpModel[]> = {
  RV, E2M_small, E2M_large, nES, EH, EXS,
};

// ─────────────────────────────────────────────────────
// Pump-Down Time 계산 엔진
//
// 물리 공식:
//   t = (V / S_eff) × ln(P_start / P_target)
//   S_eff = 1 / (1/S_pump + 1/C_pipe)
//   배관 컨덕턴스 (점성류):  C = 135 × d⁴ / L  [L/s, d=m, L=m]
//   배관 컨덕턴스 (분자류):  C = 12.1 × d³ / L [L/s]
//
// 참고: PumpCalc와 동일한 입력 구조
// ─────────────────────────────────────────────────────

export type PumpDownInput = {
  chamberVol_L: number;        // 챔버 용적 (L)
  outgassingRate?: number;     // mbar·L/s·cm² (기본값: SUS 1.3e-7)
  chamberSurface_cm2?: number; // 내표면적 cm² (미입력 시 챔버 구형 근사)
  startPressure_mbar?: number; // 초기압력 (기본값: 1013 mbar = 대기압)
  targetPressure_mbar: number; // 목표 압력 (mbar)
  pipeID_mm: number;           // 배관 내경 (mm)
  pipeLength_m: number;        // 배관 길이 (m)
  pipeBends?: number;          // 배관 꺾임 수 (기본값: 0)
  hz?: 50 | 60;                // 전원 주파수 (기본값: 60)
};

export type PumpDownResult = {
  model: string;
  series: string;
  pumpSpeed_m3h: number;
  effectiveSpeed_m3h: number;
  pipeConduct_m3h: number;
  pumpDownTime_s: number;
  pumpDownTime_min: number;
  reachable: boolean;          // 목표 압력 도달 가능 여부
};

function pipeConductance_m3h(id_mm: number, len_m: number, bends: number): number {
  const d = id_mm / 1000; // m
  const L = Math.max(len_m + bends * (d * 1.5), 0.01);
  // 점성류 기준 (> 1 mbar) — 보수적 추정
  const C_ls = 135 * Math.pow(d, 4) / L * 1000; // L/s
  return C_ls * 3.6; // → m³/h
}

export function calcPumpDown(input: PumpDownInput, pump: PumpModel): PumpDownResult {
  const {
    chamberVol_L,
    outgassingRate = 1.3e-7,
    chamberSurface_cm2,
    startPressure_mbar = 1013,
    targetPressure_mbar,
    pipeID_mm,
    pipeLength_m,
    pipeBends = 0,
    hz = 60,
  } = input;

  const V = chamberVol_L / 1000; // m³
  const pumpSpeed = hz === 50 ? pump.speed50Hz : pump.speed60Hz; // m³/h
  const C = pipeConductance_m3h(pipeID_mm, pipeLength_m, pipeBends);
  const S_eff = pumpSpeed > 0 && C > 0
    ? 1 / (1 / pumpSpeed + 1 / C)
    : pumpSpeed;

  const reachable = targetPressure_mbar > pump.ultimate;

  // Outgassing load (mbar·m³/s)
  const surface = chamberSurface_cm2 ?? Math.pow(chamberVol_L * 1e-3, 2/3) * 6 * 1e4;
  const Q_out = outgassingRate * surface * 1e-3; // mbar·m³/s

  // Ultimate pressure considering outgassing
  const P_ult_actual = Math.max(pump.ultimate, Q_out / (S_eff / 3600));

  // Effective target (clamp to reachable)
  const P_target = Math.max(targetPressure_mbar, P_ult_actual * 1.05);

  const t_s = reachable
    ? (V / (S_eff / 3600)) * Math.log(startPressure_mbar / P_target)
    : Infinity;

  return {
    model: pump.model,
    series: pump.series,
    pumpSpeed_m3h: pumpSpeed,
    effectiveSpeed_m3h: Math.round(S_eff * 10) / 10,
    pipeConduct_m3h: Math.round(C * 10) / 10,
    pumpDownTime_s: Math.round(t_s),
    pumpDownTime_min: Math.round(t_s / 60 * 10) / 10,
    reachable,
  };
}

/**
 * 조건에 맞는 펌프를 자동 추천
 * - 목표 압력 도달 가능한 모델만
 * - pump-down time 기준 정렬
 */
export function recommendPumps(
  input: PumpDownInput,
  maxResults = 5
): PumpDownResult[] {
  const candidates = ALL_PUMPS.filter(
    (p) => p.speed50Hz > 0 && p.ultimate < input.targetPressure_mbar
  );

  return candidates
    .map((p) => calcPumpDown(input, p))
    .filter((r) => r.reachable && r.pumpDownTime_s < 86400)
    .sort((a, b) => a.pumpDownTime_s - b.pumpDownTime_s)
    .slice(0, maxResults);
}
