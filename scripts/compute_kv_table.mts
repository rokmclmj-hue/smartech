// @ts-ignore
import pumpDataModule from '../lib/pumpSpeedData';
const { calcPumpDown, ALL_PUMPS } = pumpDataModule as any;

const TARGET_MBAR = 5e-3 * 1.33322; // 5×10⁻³ Torr → mbar

// PumpCalc 추출 결과 (extract_pumpdown.mjs 실행 결과)
const PUMP_CALC: Record<string, Record<number, number | null>> = {
  'GXS160/1750': { 1000: 4.9357, 3000: 11.3916, 10000: 30.5865, 20000: 54.8252, 30000: 77.7658, 40000: 100.5925, 50000: null },
  'GXS250/2600': { 1000: 3.5814, 3000: 8.1804, 10000: 21.0583, 20000: 37.7299, 30000: 52.9036, 40000: 68.0037, 50000: 82.8710 },
  'GXS450/2600': { 1000: 2.9915, 3000: 6.5015, 10000: 16.2919, 20000: 28.3001, 30000: 38.9580, 40000: 49.4186, 50000: 59.5700 },
  'GXS450/4200': { 1000: 2.8185, 3000: 6.0551, 10000: 15.4547, 20000: 26.7239, 30000: 37.4937, 40000: 46.9994, 50000: 56.8512 },
  'GXS750/2600': { 1000: 2.7279, 3000: 5.8366, 10000: 14.4386, 20000: 24.4235, 30000: 33.4972, 40000: 41.9493, 50000: 50.1021 },
  'GXS750/4200': { 1000: 2.5131, 3000: 5.3336, 10000: 13.2774, 20000: 22.4681, 30000: 31.1477, 40000: 38.9030, 50000: 46.8893, 60000: 54.2903 },
};

const GXS_MODELS = Object.keys(PUMP_CALC);

console.log('='.repeat(80));
console.log('  ODE vs PumpCalc 비교 및 k(V) 보정 테이블');
console.log('='.repeat(80));

const kvTables: Record<string, { vol: number; odeMin: number; pcMin: number; k: number }[]> = {};

for (const modelName of GXS_MODELS) {
  const pump = ALL_PUMPS.find((p: any) => p.model === modelName);
  if (!pump) { console.error(`  [오류] ${modelName} 모델 없음`); continue; }

  const oldFactor: number = pump.pumpCalcFactor ?? 1.0;
  const pcData = PUMP_CALC[modelName];
  const volumes = Object.keys(pcData).map(Number).sort((a, b) => a - b);

  console.log(`\n  [${modelName}]  (기존 factor: ${oldFactor})`);
  console.log(`  ${'챔버(L)'.padEnd(10)} ${'ODE(분)'.padEnd(10)} ${'PC(분)'.padEnd(10)} ${'k=PC/ODE'.padEnd(12)} ${'기존오차%'}`);
  console.log(`  ${'-'.repeat(54)}`);

  const table: { vol: number; odeMin: number; pcMin: number; k: number }[] = [];

  for (const vol of volumes) {
    const pcMin = pcData[vol];
    if (pcMin === null) {
      console.log(`  ${String(vol).padEnd(10)} ${'미도달'.padEnd(10)} ${'미도달'.padEnd(10)} ${'N/A'.padEnd(12)} -`);
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
      console.log(`  ${String(vol).padEnd(10)} ${'미도달'.padEnd(10)} ${pcMin.toFixed(4).padEnd(10)} ${'N/A'.padEnd(12)} -`);
      continue;
    }

    // pumpDownTime_s 는 이미 oldFactor 적용됨 → 순수 ODE = / oldFactor
    const odeMin = result.pumpDownTime_s / oldFactor / 60;
    const k = pcMin / odeMin;
    const oldErr = ((oldFactor * odeMin - pcMin) / pcMin * 100);

    console.log(
      `  ${String(vol).padEnd(10)} ${odeMin.toFixed(4).padEnd(10)} ${pcMin.toFixed(4).padEnd(10)} ${k.toFixed(4).padEnd(12)} ${oldErr.toFixed(1)}%`
    );

    table.push({ vol, odeMin, pcMin, k });
  }

  kvTables[modelName] = table;
}

// ── TypeScript 출력 ───────────────────────────────────────────────────────
console.log('\n');
console.log('='.repeat(80));
console.log('  pumpSpeedData.ts 에 붙여넣을 k(V) 테이블 코드');
console.log('='.repeat(80));

for (const modelName of GXS_MODELS) {
  const table = kvTables[modelName];
  if (!table || table.length === 0) continue;

  const varName = modelName.replace('/', '_').replace(/[^A-Za-z0-9_]/g, '');
  const entries = table.map(r => `    { vol: ${r.vol}, k: ${r.k.toFixed(4)} }`).join(',\n');
  console.log(`\n  // ${modelName}`);
  console.log(`  pumpCalcKV_${varName}: [\n${entries}\n  ],`);
}
