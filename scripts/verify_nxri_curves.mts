// @ts-ignore
import pumpDataModule from '../lib/pumpSpeedData';
const { calcPumpDown, ALL_PUMPS } = pumpDataModule as any;

/**
 * 수정된 nXRi 속도 곡선 검증
 * PumpCalc 조건: Air, 1093L, 5.874m², KF40(40mm) 1m 2-bend, 목표 0.1 Torr
 */

const input = {
  chamberVol_L: 1093,
  chamberSurface_cm2: 58740,   // 5.874 m²
  pipeID_mm: 40,
  pipeLength_m: 1.0,
  pipeBends: 2,
  targetPressure_mbar: 0.13332, // 0.1 Torr
  hz: 60,
};

// PumpCalc 실측값 (CSV data720291.csv 분석)
// nXR30i: PumpCalc 시험이 30분에서 중단(챔버 0.504mbar). 0.1 Torr 미도달 → 검증 불가
const pumpCalcRef: Record<string, number> = {
  nXR30i: 0,     // 기준값 없음 — 시험 미도달
  nXR40i: 28.22, // CSV 직접 추출: line 409-410 교차점
  nXR60i: 22.95, // CSV 직접 추출: line 634-635 교차점
  nXR90i: 22.28, // CSV 직접 추출: line 878-879 교차점
};

const prevResults: Record<string, number> = {
  nXR30i: 35.4,
  nXR40i: 25.3,
  nXR60i: 18.2,
  nXR90i: 17.4,
};

console.log("=== nXRi 속도 곡선 교체 후 시뮬레이션 검증 ===");
console.log("조건: 1093L, KF40 40mm 1m 2-bend, 목표 0.1 Torr\n");
console.log(
  "펌프".padEnd(10) +
  "이전(분)".padStart(10) +
  "수정후(분)".padStart(11) +
  "PumpCalc(분)".padStart(13) +
  "오차".padStart(8)
);
console.log("-".repeat(54));

const pumps = ["nXR30i", "nXR40i", "nXR60i", "nXR90i"];
for (const pumpModel of pumps) {
  const pump = ALL_PUMPS.find((p: any) => p.model === pumpModel);
  if (!pump) { console.log(`${pumpModel}: 모델 없음`); continue; }

  const result = calcPumpDown(input, pump);
  if (!result) { console.log(`${pumpModel}: 결과 없음`); continue; }

  const sim = result.pumpDownTime_min;
  const ref = pumpCalcRef[pumpModel];
  const errStr = ref > 0 ? `${((sim - ref) / ref * 100).toFixed(1)}%` : "기준없음";
  const refStr = ref > 0 ? ref.toFixed(1) : "미도달";
  const prev = prevResults[pumpModel];
  console.log(
    pumpModel.padEnd(10) +
    prev.toFixed(1).padStart(10) +
    sim.toFixed(1).padStart(11) +
    refStr.padStart(13) +
    errStr.padStart(10)
  );
}
console.log("\n오차 기준: PumpCalc 대비 ±5% 이내 목표");
