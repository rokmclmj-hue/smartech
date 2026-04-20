/**
 * 계산 엔진 검증: nXDS 4모델 + GXS 4모델
 * 조건: NW25 1.1m, Air, 60Hz
 *   nXDS: 1L chamber, 60min ChamberP
 *   GXS:  100L chamber, 60min ChamberP
 *
 * PumpCalc 기준값 (ChamberP column, Torr → mbar):
 *   nXDS6i:     0.01587 Torr = 0.02117 mbar
 *   nXDS10i:    0.00572 Torr = 0.00763 mbar
 *   nXDS15i:    0.00573 Torr = 0.00764 mbar
 *   nXDS20i:    0.02288 Torr = 0.03051 mbar
 *   GXS160:     0.01710 Torr = 0.02280 mbar
 *   GXS250:     0.01685 Torr = 0.02248 mbar
 *   GXS450:     0.01682 Torr = 0.02244 mbar
 *   GXS750:     0.01695 Torr = 0.02261 mbar
 *
 * 오차 분석 (2026-04-21):
 *   nXDS: -3% ~ -15%  (1L 챔버, 파이프 C >> 펌프 S → bisection 불필요, 오차는 주로 outgassing 모델 차이)
 *   GXS:  -33% 계통 오차 (100L 챔버)
 *     - 파이프 C_mol = 6.19 m³/h << GXS 펌프 속도 → bisection으로 P_pump 계산 (bisection 도입 전 -52%)
 *     - 잔류 -33%: 당사 constant Q_out vs PumpCalc time-decaying 모델 차이로 추정
 *       (equilibrium 분석: P_eq_ours=0.0152mbar vs P_eq_PumpCalc=0.0228mbar, 같은 조건에서 2.8x Q_out 차이 필요)
 *     - 펌프 속도를 0으로 줄여도 equilibrium은 ~2% 변화 → 완전히 pipe/outgassing dominated
 *   → 당사 엔진은 optimistic (실제보다 낮은 압력 예측), 펌프 선정 비교 목적으로는 허용 수준
 */

const TORR = 1.33322;

function pipeConductance(id_mm, len_m, bends, p_mbar = 1.0) {
  const d = id_mm / 1000;
  const L = Math.max(len_m + bends * d * 15, 0.01);
  const C_mol  = 4.356e5 * d ** 3 / L;
  const C_visc = 4.83e8  * d ** 4 / L * p_mbar;
  return C_mol + C_visc;
}

function interpolate(curve, p, scale = 1.0) {
  if (p >= curve[0][0]) return curve[0][1] * scale;
  if (p <= curve[curve.length - 1][0]) return 0;
  for (let i = 0; i < curve.length - 1; i++) {
    const [p1, s1] = curve[i], [p2, s2] = curve[i + 1];
    if (p <= p1 && p >= p2) {
      const t = (Math.log(p) - Math.log(p1)) / (Math.log(p2) - Math.log(p1));
      return Math.max(0, (s1 + t * (s2 - s1)) * scale);
    }
  }
  return 0;
}

function solvePumpInlet(P_chamber, curve, ultimate, C_pipe, scale) {
  const f = (p) => interpolate(curve, p, scale) * p - C_pipe * (P_chamber - p);
  if (f(P_chamber) <= 0) return P_chamber;
  let lo = ultimate, hi = P_chamber;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid; else hi = mid;
    if ((hi - lo) < 1e-12 * P_chamber) break;
  }
  return (lo + hi) / 2;
}

function simulate(speedCurve, ultimate, chamberL, pipeID, pipeLen, outgasRate, surfaceCm2, maxMin = 60) {
  const V     = chamberL * 1e-3;
  const Q_out = outgasRate * surfaceCm2 * 1e-3;
  let P       = 1013.25;
  const dt    = 1.0;
  const maxT  = maxMin * 60;

  for (let t = 0; t < maxT; t += dt) {
    const C      = pipeConductance(pipeID, pipeLen, 0, P);
    const P_pump = solvePumpInlet(P, speedCurve, ultimate, C, 1.0);
    const S_pump = interpolate(speedCurve, P_pump);
    const S_eff  = S_pump > 0 ? S_pump * P_pump / P : 0;
    const dP     = ((-S_eff / 3600 * P + Q_out) / V) * dt;
    P = Math.max(P + dP, ultimate);
    if (Math.abs(dP) < 1e-10 * P) break;
  }
  return P;
}

// PumpCalc 조건: 1L SUS+Nitrile, outgassing 3e-7 mbar·L/s·cm², Area Factor 3
// Surface area of 1L sphere ≈ 550 cm², ×3 = 1650 cm²  (PumpCalc uses ~550*3=1650)
const nXDS_surface = 550 * 3;
const nXDS_Q       = 3e-7;  // mbar·L/s/cm²

// 100L SUS+Nitrile, sphere surface ≈ 5278 cm², ×3
const GXS_surface  = Math.pow(100e-3, 2/3) * 6 * 1e4 * 3;  // 큰 챔버
// PumpCalc default Area Factor 3, 실제 outgassing from data header
const GXS_Q        = 3e-7;

const pumps = [
  {
    name: "nXDS6i", chamberL: 1, surface: nXDS_surface, Q: nXDS_Q,
    ultimate: 5e-3, ref: 0.01587 * TORR,
    curve: [
      [562.96861,6.3356],[312.94818,6.3957],[165.63259,6.4104],[94.68738,6.41],
      [51.14951,6.3584],[27.62467,6.3085],[15.69958,6.2741],[8.48432,6.2311],
      [4.62286,6.0793],[2.54519,5.8751],[1.42146,5.5341],[0.77997,4.9949],
      [0.42665,4.4126],[0.2321,3.7366],[0.12523,3.1253],[0.06852,2.3914],
      [0.03834,1.3802],[0.02088,0.0971],[0.005,0.0],
    ],
  },
  {
    name: "nXDS10i", chamberL: 1, surface: nXDS_surface, Q: nXDS_Q,
    ultimate: 5e-3, ref: 0.00572 * TORR,
    curve: [
      [525.70912,10.7184],[273.58043,10.9976],[144.04265,11.0879],[74.18583,11.0999],
      [38.1525,11.1238],[19.55924,11.1155],[10.01472,11.0708],[5.12684,10.9759],
      [2.65116,10.6424],[1.39088,10.0817],[0.71512,9.0243],[0.36956,7.9151],
      [0.19277,6.7015],[0.10126,5.6895],[0.05344,4.8516],[0.02713,4.1148],
      [0.01405,2.8109],[0.00727,0.2529],[0.005,0.0],
    ],
  },
  {
    name: "nXDS15i", chamberL: 1, surface: nXDS_surface, Q: nXDS_Q,
    ultimate: 5e-3, ref: 0.00573 * TORR,
    curve: [
      [518.29899,13.9954],[266.7463,14.6436],[139.89973,14.9467],[71.93699,15.0463],
      [36.89131,15.0245],[18.98006,14.9918],[10.2239,14.8413],[5.23432,14.3405],
      [2.70609,13.6735],[1.4161,12.8174],[0.72276,11.4591],[0.37227,9.7743],
      [0.1943,8.1638],[0.09894,6.6536],[0.05173,5.6233],[0.02677,4.914],
      [0.01419,3.7891],[0.00725,0.2868],[0.005,0.0],
    ],
  },
  {
    name: "nXDS20i", chamberL: 1, surface: nXDS_surface, Q: nXDS_Q,
    ultimate: 5e-3, ref: 0.02288 * TORR,
    curve: [
      [520.28861,13.0322],[291.55504,14.6154],[166.87098,16.1799],[94.85823,17.9536],
      [51.19922,19.8005],[29.07277,20.7992],[16.50735,21.4769],[9.34351,21.7597],
      [5.27083,21.6747],[2.97447,21.1576],[1.69403,20.0484],[0.93268,18.0819],
      [0.52724,15.8808],[0.29903,13.4963],[0.16683,10.9989],[0.09668,8.1128],
      [0.0531,4.6854],[0.03025,0.0765],[0.005,0.0],
    ],
  },
  {
    name: "GXS160", chamberL: 100, surface: GXS_surface, Q: GXS_Q,
    ultimate: 1e-2, ref: 0.01710 * TORR,
    curve: [
      [825.4436,113.87],[461.9472,112.04],[252.3638,111.84],[140.4333,114.42],
      [75.3984,120.31],[42.3127,125.46],[22.8128,132.21],[12.7431,137.1],
      [6.9513,142.83],[3.8714,148.35],[2.2017,152.76],[1.2274,154.62],
      [0.6748,153.8],[0.369,150.25],[0.2037,144.4],[0.1098,133.93],
      [0.0622,121.63],[0.0346,101.44],[0.019,64.99],[0.0104,4.05],[0.01,0.0],
    ],
  },
  {
    name: "GXS250", chamberL: 100, surface: GXS_surface, Q: GXS_Q,
    ultimate: 1e-2, ref: 0.01685 * TORR,
    curve: [
      [753.8408,149.87],[418.357,167.62],[229.2082,182.39],[129.5366,196.8],
      [71.8804,210.25],[39.595,220.77],[21.7869,229.2],[11.8542,237.95],
      [6.789,244.17],[3.8224,244.39],[2.0911,240.46],[1.161,236.47],
      [0.6303,232.33],[0.3437,223.57],[0.1922,209.12],[0.108,196.89],
      [0.06,179.11],[0.0329,148.62],[0.0186,101.01],[0.0102,4.05],[0.01,0.0],
    ],
  },
  {
    name: "GXS450", chamberL: 100, surface: GXS_surface, Q: GXS_Q,
    ultimate: 1e-2, ref: 0.01682 * TORR,
    curve: [
      [532.9121,324.77],[299.9915,376.69],[172.0869,392.37],[94.2259,402.04],
      [52.9284,413.91],[30.792,424.93],[16.7572,436.53],[9.6438,443.83],
      [5.5602,439.17],[3.0702,435.34],[1.7903,431.5],[0.9999,423.36],
      [0.5424,410.27],[0.3157,393.37],[0.1759,365.24],[0.1009,308.66],
      [0.0563,256.27],[0.0324,199.47],[0.0179,127.85],[0.0102,4.06],[0.01,0.0],
    ],
  },
  {
    name: "GXS750", chamberL: 100, surface: GXS_surface, Q: GXS_Q,
    ultimate: 1e-2, ref: 0.01695 * TORR,
    curve: [
      [310.44,597.08],[178.549,618.84],[106.8019,643.91],[60.5119,666.08],
      [35.6054,685.46],[20.5988,706.11],[12.0703,747.81],[7.0475,747.11],
      [4.033,731.78],[2.3722,714.52],[1.3658,717.05],[0.7673,715.39],
      [0.4507,694.4],[0.265,660.74],[0.1503,601.98],[0.0906,517.38],
      [0.0527,435.14],[0.03,336.13],[0.0173,203.42],[0.0101,4.21],[0.01,0.0],
    ],
  },
];

console.log("모델         | 60min 도달압력(mbar)  | PumpCalc(mbar)  | 오차");
console.log("-------------|----------------------|-----------------|------");
for (const p of pumps) {
  const simP = simulate(p.curve, p.ultimate, p.chamberL, 25, 1.1, p.Q, p.surface, 60);
  const err  = ((simP - p.ref) / p.ref * 100).toFixed(1);
  const sign = parseFloat(err) > 0 ? "+" : "";
  console.log(
    `${p.name.padEnd(12)} | ${simP.toExponential(3).padStart(20)} | ${p.ref.toExponential(3).padStart(15)} | ${sign}${err}%`
  );
}
