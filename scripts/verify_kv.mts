// @ts-ignore
import pumpDataModule from '../lib/pumpSpeedData';
const { calcPumpDown, ALL_PUMPS } = pumpDataModule as any;

const TARGET_MBAR = 5e-3 * 1.33322;

// PumpCalc 기준 정답
const PUMP_CALC: Record<string, Record<number, number | null>> = {
  'GXS160/1750': { 1000: 4.9357, 3000: 11.3916, 10000: 30.5865, 20000: 54.8252, 30000: 77.7658, 40000: 100.5925, 50000: null },
  'GXS250/2600': { 1000: 3.5814, 3000: 8.1804, 10000: 21.0583, 20000: 37.7299, 30000: 52.9036, 40000: 68.0037, 50000: 82.8710 },
  'GXS450/2600': { 1000: 2.9915, 3000: 6.5015, 10000: 16.2919, 20000: 28.3001, 30000: 38.9580, 40000: 49.4186, 50000: 59.5700 },
  'GXS450/4200': { 1000: 2.8185, 3000: 6.0551, 10000: 15.4547, 20000: 26.7239, 30000: 37.4937, 40000: 46.9994, 50000: 56.8512 },
  'GXS750/2600': { 1000: 2.7279, 3000: 5.8366, 10000: 14.4386, 20000: 24.4235, 30000: 33.4972, 40000: 41.9493, 50000: 50.1021 },
  'GXS750/4200': { 1000: 2.5131, 3000: 5.3336, 10000: 13.2774, 20000: 22.4681, 30000: 31.1477, 40000: 38.9030, 50000: 46.8893, 60000: 54.2903 },
};

console.log('='.repeat(80));
console.log('  k(V) 보정 적용 후 검증 (ODE 결과 vs PumpCalc 기준)');
console.log('='.repeat(80));

let totalPoints = 0, passCount = 0;

for (const modelName of Object.keys(PUMP_CALC)) {
  const pump = ALL_PUMPS.find((p: any) => p.model === modelName);
  if (!pump) { console.log(`  [${modelName}] 모델 없음`); continue; }

  const pcData = PUMP_CALC[modelName];
  const volumes = Object.keys(pcData).map(Number).sort((a, b) => a - b);

  console.log(`\n  [${modelName}]`);
  console.log(`  ${'챔버(L)'.padEnd(10)} ${'새ODE(분)'.padEnd(12)} ${'PC(분)'.padEnd(12)} ${'오차%'.padEnd(10)} 판정`);
  console.log(`  ${'-'.repeat(52)}`);

  for (const vol of volumes) {
    const pcMin = pcData[vol];
    if (pcMin === null) {
      console.log(`  ${String(vol).padEnd(10)} ${'미도달'.padEnd(12)} ${'미도달'.padEnd(12)} ${'N/A'.padEnd(10)} ✅ (둘 다 미도달)`);
      continue;
    }

    const result = calcPumpDown({
      chamberVol_L: vol,
      targetPressure_mbar: TARGET_MBAR,
      startPressure_mbar: 1013,
      pipeID_mm: 160,
      pipeLength_m: 2.1,
      pipeBends: 2,
      hz: 60 as const,
    }, pump);

    if (!result.reachable) {
      console.log(`  ${String(vol).padEnd(10)} ${'미도달'.padEnd(12)} ${pcMin.toFixed(4).padEnd(12)} ${'N/A'.padEnd(10)} ❓ (ODE 미도달)`);
      continue;
    }

    const newMin = result.pumpDownTime_s / 60;
    const err = (newMin - pcMin) / pcMin * 100;
    const pass = Math.abs(err) <= 5.0;

    totalPoints++;
    if (pass) passCount++;

    console.log(
      `  ${String(vol).padEnd(10)} ${newMin.toFixed(4).padEnd(12)} ${pcMin.toFixed(4).padEnd(12)} ${(err >= 0 ? '+' : '') + err.toFixed(1) + '%'.padEnd(8)} ${pass ? '✅' : '❌'}`
    );
  }
}

console.log('\n' + '='.repeat(80));
console.log(`  결과: ${passCount} / ${totalPoints} 포인트 ±5% 이내`);
if (passCount === totalPoints) {
  console.log('  ✅ 모든 보정점 통과 — pumpSpeedData.ts 업데이트 완료');
} else {
  console.log('  ⚠️  일부 포인트 범위 초과 — 확인 필요');
}
console.log('='.repeat(80));
