import { recommendPumps } from '../lib/pumpSpeedData';

const input = {
  chamberVol_L: 200,
  targetPressure_mbar: 0.01,
  startPressure_mbar: 1013,
  pipeID_mm: 160,
  pipeLength_m: 5,
  pipeBends: 2,
  hz: 60 as const,
};

const results = recommendPumps(input);
console.log('결과 개수:', results.length);
results.forEach(r => {
  const t = r.timeToTarget_s;
  const timeStr = t != null ? `${Math.round(t)}초 (${(t / 60).toFixed(1)}분)` : 'N/A';
  console.log(r.model, '→', r.reachable ? timeStr : '도달불가');
});
