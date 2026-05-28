// @ts-ignore
import pumpDataModule from '../lib/pumpSpeedData';
const { calcPumpDown, ALL_PUMPS } = pumpDataModule as any;

const TARGET_MBAR = 5e-3 * 1.33322; // 5×10⁻³ Torr → mbar (~0.006666 mbar)

const input = {
  chamberVol_L: 10000,
  targetPressure_mbar: TARGET_MBAR,
  startPressure_mbar: 1013,
  pipeID_mm: 160,
  pipeLength_m: 2.1,
  pipeBends: 2,
  hz: 60 as const,
};

const pump = ALL_PUMPS.find((p: any) => p.model === 'GXS450/4200');
if (!pump) { console.error('GXS450/4200 모델을 찾을 수 없음'); process.exit(1); }

const result = calcPumpDown(input, pump);
// pumpDownTime_s 는 pumpCalcFactor 이미 적용된 값
// 원래 ODE 시간 = pumpDownTime_s / pumpCalcFactor
const factor = pump.pumpCalcFactor ?? 1.0;
const odeTime_min = result.pumpDownTime_s / factor / 60;
const correctedTime_min = result.pumpDownTime_s / 60;

console.log('='.repeat(58));
console.log('  GXS450/4200 10K ODE 계산 결과');
console.log('='.repeat(58));
console.log(`  목표 압력              : ${TARGET_MBAR.toFixed(5)} mbar`);
console.log(`  도달 가능 여부         : ${result.reachable ? '✅' : '❌'}`);
console.log(`  ODE 순수 계산 시간     : ${odeTime_min.toFixed(4)} 분`);
console.log(`  기존 factor(${factor})  적용 : ${correctedTime_min.toFixed(4)} 분`);
console.log();
console.log(`  ▶ 신규 PumpCalc 10K 결과가 ${correctedTime_min.toFixed(2)}분 ±5%`);
console.log(`    (${(correctedTime_min * 0.95).toFixed(2)} ~ ${(correctedTime_min * 1.05).toFixed(2)} 분)`);
console.log(`    범위 안이면 ✅ 일치`);
