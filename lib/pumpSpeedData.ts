/**
 * 펌프 성능 데이터 + Pump-Down Time 계산 엔진
 * 출처: Edwards 제품 카탈로그, Edwards PumpCalc CSV (2026-04-21 추출)
 *
 * speedCurve 보유 모델: nXDS 시리즈 (PumpCalc 시뮬레이션 데이터 디지타이징)
 *   - X: 펌프 흡입구 압력 [mbar], Y: 배기속도 [m³/h]
 *   - 추출 조건: 1L SUS+Nitrile, NW25 1.1m foreline, Air, 60Hz
 *   - speedCurve 있으면 수치 ODE 적분, 없으면 ln 근사식 사용
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
  {
    model:"RV3",  series:"RV", type:"oil_vane", speed50Hz:3.3,  speed60Hz:4.0,  ultimate:2.0e-3, motorKW_50Hz:0.09, inletFlange:"NW16",
    speedCurve: [
      [899.3468,4.0],[484.7995,4.0],[257.4206,4.0],[139.5755,4.0],[75.4083,4.0],[40.7361,4.0],
      [20.9005,4.0],[11.3,4.0],[6.1378,3.96],[3.3577,3.89],[1.7619,3.78],[0.932,3.69],
      [0.5018,3.55],[0.2785,3.39],[0.1488,3.21],[0.079,3.01],[0.0423,2.77],[0.0228,2.47],
      [0.012,2.05],[0.0065,1.36],[0.0065,0.0],
    ],
  },
  {
    model:"RV5",  series:"RV", type:"oil_vane", speed50Hz:5.1,  speed60Hz:6.2,  ultimate:2.0e-3, motorKW_50Hz:0.09, inletFlange:"NW25",
    speedCurve: [
      [894.6422,6.0],[478.3189,6.0],[255.0167,6.04],[138.2868,6.09],[74.7233,6.17],[40.3765,6.24],
      [21.8173,6.24],[11.7962,6.24],[6.087,6.23],[3.3313,6.14],[1.7576,5.96],[0.9877,5.77],
      [0.5164,5.57],[0.2825,5.34],[0.1478,4.99],[0.0807,4.55],[0.0429,4.12],[0.0235,3.68],
      [0.0125,2.97],[0.0067,2.15],[0.0067,0.0],
    ],
  },
  {
    model:"RV8",  series:"RV", type:"oil_vane", speed50Hz:8.5,  speed60Hz:10.2, ultimate:2.0e-3, motorKW_50Hz:0.18, inletFlange:"NW25",
    speedCurve: [
      [838.5234,9.76],[455.1979,9.7],[246.4539,9.77],[128.781,9.86],[69.6408,9.95],[37.6308,10.05],
      [20.3341,10.15],[10.9874,10.19],[5.9444,10.24],[3.24,10.21],[1.7031,10.03],[0.9163,9.57],
      [0.4906,8.76],[0.2673,7.95],[0.1444,7.09],[0.0758,5.99],[0.0409,5.0],[0.0222,4.05],
      [0.0118,3.0],[0.0065,1.88],[0.0065,0.0],
    ],
  },
  {
    model:"RV12", series:"RV", type:"oil_vane", speed50Hz:12.0, speed60Hz:14.4, ultimate:2.0e-3, motorKW_50Hz:0.25, inletFlange:"NW25",
    speedCurve: [
      [827.9571,12.79],[446.3838,12.53],[241.9341,12.88],[125.8973,13.33],[68.0312,13.78],[36.761,14.23],
      [19.864,14.6],[10.1968,14.7],[5.526,14.53],[3.0259,14.24],[1.6003,13.79],[0.8673,13.01],
      [0.4526,11.47],[0.2457,9.85],[0.1294,8.28],[0.0703,6.69],[0.0379,5.61],[0.0198,4.62],
      [0.0105,3.5],[0.0057,2.26],[0.0057,0.0],
    ],
  },
];

// ─────────────────────────────────────────────────────
// E2M 오일 로터리 베인 (소형 E2M0.7~28)
// Source: 1-1.오일펌프_소형E2M.pdf p2
// ─────────────────────────────────────────────────────
const E2M_small: PumpModel[] = [
  {
    model:"E2M0.7", series:"E2M_small", type:"oil_vane", speed50Hz:0.75, speed60Hz:0.90, ultimate:3.0e-3, motorKW_50Hz:0.09, inletFlange:"NW10",
    speedCurve: [
      [935.5385,0.89],[527.2201,0.97],[287.8181,1.02],[163.7076,1.05],[93.1127,1.07],[52.9748,1.07],
      [28.7072,1.06],[16.4321,1.04],[9.4331,1.03],[5.1542,1.02],[2.8276,1.01],[1.6416,0.99],
      [0.9207,0.95],[0.5042,0.9],[0.2863,0.85],[0.1586,0.78],[0.0897,0.72],[0.0513,0.68],
      [0.0286,0.62],[0.016,0.58],[0.016,0.0],
    ],
  },
  {
    model:"E2M1.5", series:"E2M_small", type:"oil_vane", speed50Hz:1.6,  speed60Hz:1.9,  ultimate:3.0e-3, motorKW_50Hz:0.16, inletFlange:"NW16",
    speedCurve: [
      [922.1388,1.95],[523.4618,1.97],[289.7466,2.0],[164.9129,2.01],[93.8011,2.02],[53.3532,2.02],
      [28.8492,2.01],[16.4538,2.01],[9.4176,1.99],[5.1444,1.97],[2.9716,1.94],[1.6587,1.82],
      [0.9461,1.69],[0.5258,1.56],[0.2956,1.34],[0.1705,1.15],[0.0942,0.98],[0.0536,0.84],
      [0.0304,0.72],[0.0169,0.59],[0.0169,0.0],
    ],
  },
  {
    model:"E2M18",  series:"E2M_small", type:"oil_vane", speed50Hz:17.0, speed60Hz:20.4, ultimate:1.0e-3, motorKW_50Hz:0.55, inletFlange:"NW40",
    speedCurve: [
      [756.0294,21.5],[387.5385,21.5],[209.568,21.5],[109.7988,21.5],[56.4717,21.5],[29.1246,21.5],
      [15.746,21.5],[8.083,21.51],[4.1577,21.47],[2.169,21.21],[1.1583,20.46],[0.6142,18.97],
      [0.3094,16.77],[0.1641,14.8],[0.0853,12.58],[0.0445,10.83],[0.0232,9.24],[0.0122,7.91],
      [0.0065,6.75],[0.0034,5.55],[0.0034,0.0],
    ],
  },
  {
    model:"E2M28",  series:"E2M_small", type:"oil_vane", speed50Hz:27.5, speed60Hz:33.0, ultimate:1.0e-3, motorKW_50Hz:0.75, inletFlange:"NW40",
    speedCurve: [
      [683.3792,31.36],[361.3885,29.15],[187.6482,28.53],[97.9443,29.17],[52.9249,30.15],[27.1685,30.49],
      [14.7132,31.8],[7.5528,33.89],[4.0831,34.1],[2.1275,33.37],[1.1469,31.47],[0.5884,28.91],
      [0.3167,24.95],[0.1664,20.0],[0.086,16.4],[0.0462,13.83],[0.0239,11.47],[0.0126,9.27],
      [0.0068,7.13],[0.0035,5.14],[0.0035,0.0],
    ],
  },
];

// ─────────────────────────────────────────────────────
// E2M 오일 로터리 베인 (중대형 E2M40~275)
// Source: 2.오일펌프_중대형E2M.pdf
// ─────────────────────────────────────────────────────
const E2M_large: PumpModel[] = [
  // speedCurve: Edwards PumpCalc CSV (2026-04-23), 100L SUS+Viton, NW40, Air, GB off, 60Hz
  // E2M40: 1m 3-bend (300s) → BPP min 0.019 mbar; 끝점은 카탈로그 얼티밋(3e-3 mbar)
  {
    model:"E2M40",  series:"E2M_large", type:"oil_vane", speed50Hz:37,  speed60Hz:44,  ultimate:3.0e-3, motorKW_50Hz:1.1,  inletFlange:"NW40",
    speedCurve: [
      [957.7591,44.0],[535.1411,44.0],[309.0488,44.0],[173.4066,44.0],[99.902,44.0],[54.0128,44.0],
      [30.8377,44.0],[17.5335,44.0],[9.9565,44.0],[5.6466,44.01],[3.1995,43.44],[1.8184,42.42],
      [1.0388,40.69],[0.5656,38.55],[0.3257,35.9],[0.1808,32.47],[0.103,28.84],[0.058,25.88],
      [0.0334,22.95],[0.0188,19.8],[0.003,0.0],
    ],
  },
  // E2M80: PD2 2m 3-bend (300s) → sim min 0.014 mbar; 끝점 카탈로그 얼티밋(3e-3 mbar)
  {
    model:"E2M80",  series:"E2M_large", type:"oil_vane", speed50Hz:74,  speed60Hz:90,  ultimate:3.0e-3, motorKW_50Hz:2.2,  inletFlange:"NW40",
    speedCurve: [
      [933.3417,80.0],[520.2911,80.0],[287.0475,80.2],[161.1738,80.13],[88.4053,80.19],[50.3422,81.59],
      [28.5785,81.62],[15.4307,81.69],[8.7503,81.28],[4.9234,80.37],[2.7466,80.31],[1.5218,79.52],
      [0.8378,77.61],[0.4719,68.58],[0.2659,61.16],[0.1436,53.0],[0.0809,44.92],[0.0454,35.31],
      [0.0251,28.9],[0.0143,24.37],[0.003,0.0],
    ],
  },
  {
    model:"E2M175", series:"E2M_large", type:"oil_vane", speed50Hz:160, speed60Hz:196, ultimate:3.0e-3, motorKW_50Hz:5.5,  inletFlange:"ISO63",
    speedCurve: [
      [685.9231,186.0],[456.1912,186.0],[316.6529,186.01],[206.9638,186.0],[140.4162,185.99],[94.4259,186.02],
      [63.0302,185.99],[41.8636,185.99],[29.2348,186.0],[19.413,186.02],[12.9259,186.02],[8.6651,185.64],
      [5.8824,184.71],[3.9715,182.56],[2.6978,179.66],[1.7815,174.76],[1.2015,168.04],[0.8249,158.61],
      [0.5525,143.38],[0.3679,123.52],[0.003,0.0],
    ],
  },
  {
    model:"E2M275", series:"E2M_large", type:"oil_vane", speed50Hz:255, speed60Hz:306, ultimate:3.0e-3, motorKW_50Hz:7.5,  inletFlange:"ISO63",
    speedCurve: [
      [610.784,288.07],[414.2005,288.0],[273.444,288.0],[187.1679,288.0],[127.0429,287.99],[81.3485,287.99],
      [57.1641,288.0],[38.0275,287.99],[25.2355,288.0],[16.7481,288.02],[11.2016,287.89],[7.5513,287.09],
      [5.1901,285.05],[3.4004,280.94],[2.3448,273.91],[1.5748,261.79],[1.0352,242.27],[0.6923,218.16],
      [0.4691,191.26],[0.3148,163.0],[0.003,0.0],
    ],
  },
];

// ─────────────────────────────────────────────────────
// nES 오일 로터리 베인 (대형)
// Source: 3.오일펌프_nES.pdf p6-7
// ─────────────────────────────────────────────────────
const nES: PumpModel[] = [
  {
    model:"nES40",   series:"nES", type:"oil_vane", speed50Hz:38.5, speed60Hz:47.0,  ultimate:0.5,  motorKW_50Hz:1.3,  inletFlange:"NW40",
    speedCurve: [
      [600.5769,46.6],[405.8589,46.12],[281.0746,45.3],[192.5521,44.82],[136.4251,45.51],[90.9759,45.98],
      [63.7121,45.82],[44.457,46.04],[30.9667,46.13],[20.4624,45.85],[14.2749,44.92],[10.0213,44.2],
      [6.9402,44.05],[4.7936,42.65],[3.175,39.31],[2.2375,35.79],[1.5332,30.38],[1.0387,23.67],
      [0.7338,14.65],[0.5003,0.03],[0.5003,0.0],
    ],
  },
  {
    model:"nES65",   series:"nES", type:"oil_vane", speed50Hz:54.0, speed60Hz:64.0,  ultimate:0.5,  motorKW_50Hz:1.8,  inletFlange:"NW40",
    speedCurve: [
      [515.3837,64.13],[360.56,63.08],[248.6853,62.54],[169.616,62.35],[120.266,62.31],[84.6472,62.34],
      [56.2536,62.32],[39.2849,61.4],[27.4535,60.31],[19.2093,59.04],[13.4733,57.29],[9.0895,55.13],
      [6.4332,52.89],[4.5281,50.07],[3.063,44.98],[2.1167,38.64],[1.4975,31.05],[1.0503,22.5],
      [0.711,11.84],[0.5003,0.02],[0.5003,0.0],
    ],
  },
  {
    model:"nES100",  series:"nES", type:"oil_vane", speed50Hz:87.5, speed60Hz:105.0, ultimate:0.5,  motorKW_50Hz:3.0,  inletFlange:"NW40",
    speedCurve: [
      [385.3551,105.41],[265.9203,105.17],[190.8058,104.86],[136.0682,104.08],[96.4081,103.34],[67.8665,102.77],
      [47.5273,102.26],[33.1915,101.59],[23.1796,100.58],[16.205,98.89],[11.3665,96.32],[8.4084,93.92],
      [5.6947,90.64],[4.0478,87.46],[2.8643,83.15],[2.0471,75.7],[1.4368,60.88],[1.0009,43.3],
      [0.7183,24.07],[0.5003,0.03],[0.5003,0.0],
    ],
  },
  {
    model:"nES200",  series:"nES", type:"oil_vane", speed50Hz:170,  speed60Hz:200,   ultimate:0.08, motorKW_50Hz:4.5,  inletFlange:"ISO63",
    speedCurve: [
      [242.3528,197.74],[158.3111,194.91],[102.3024,193.93],[68.7015,194.02],[45.7906,194.43],[28.8695,193.16],
      [19.1526,189.96],[12.7327,185.07],[8.5346,175.97],[5.5034,163.29],[3.6182,150.2],[2.3827,131.14],
      [1.578,111.33],[1.0238,93.05],[0.661,73.63],[0.4362,49.48],[0.2839,28.76],[0.1859,15.6],
      [0.1228,6.34],[0.0808,0.12],[0.0808,0.0],
    ],
  },
  {
    model:"nES300",  series:"nES", type:"oil_vane", speed50Hz:240,  speed60Hz:290,   ultimate:0.08, motorKW_50Hz:5.5,  inletFlange:"ISO63",
    speedCurve: [
      [192.6178,273.43],[131.75,266.59],[89.3756,260.8],[63.2196,255.88],[42.2866,251.06],[29.6249,246.88],
      [19.6682,241.93],[13.735,237.26],[9.6438,231.03],[6.4894,222.26],[4.4033,211.63],[3.0509,198.57],
      [2.1078,181.53],[1.463,160.19],[0.9942,135.68],[0.6713,101.69],[0.461,64.83],[0.3157,33.17],
      [0.2197,12.72],[0.1504,0.06],[0.1504,0.0],
    ],
  },
  { model:"nES300S", series:"nES", type:"oil_vane", speed50Hz:284,  speed60Hz:330,   ultimate:0.08, motorKW_50Hz:6.0,  inletFlange:"ISO63"  },
  { model:"nES470",  series:"nES", type:"oil_vane", speed50Hz:400,  speed60Hz:470,   ultimate:0.08, motorKW_50Hz:11.0, inletFlange:"ISO100" },
  { model:"nES570",  series:"nES", type:"oil_vane", speed50Hz:470,  speed60Hz:0,     ultimate:0.08, motorKW_50Hz:11.0, inletFlange:"ISO100" },
  {
    model:"nES630",  series:"nES", type:"oil_vane", speed50Hz:640,  speed60Hz:755,   ultimate:0.08, motorKW_50Hz:18.5, inletFlange:"ISO100",
    speedCurve: [
      [152.4263,719.6],[103.6341,712.31],[69.9129,702.53],[46.8284,688.98],[31.2003,673.22],[20.7282,652.3],
      [13.7514,633.15],[9.6148,613.5],[6.4733,582.58],[4.2033,532.16],[2.9188,481.65],[1.9526,408.16],
      [1.307,319.56],[0.8638,217.35],[0.593,150.24],[0.3983,93.2],[0.2661,51.31],[0.1806,25.0],
      [0.1198,8.65],[0.0806,0.12],[0.0806,0.0],
    ],
  },
  { model:"nES750",  series:"nES", type:"oil_vane", speed50Hz:755,  speed60Hz:0,     ultimate:0.08, motorKW_50Hz:18.5, inletFlange:"ISO100" },
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
  { model:"EXS160",  series:"EXS", type:"dry_screw", speed50Hz:160, speed60Hz:192, ultimate:1.0e-2, motorKW_50Hz:0, inletFlange:"ISO63"  },
  { model:"EXS250",  series:"EXS", type:"dry_screw", speed50Hz:250, speed60Hz:300, ultimate:1.0e-2, motorKW_50Hz:0, inletFlange:"ISO63"  },
];

// ─────────────────────────────────────────────────────
// nXDS 드라이 스크롤 (소형)
// speedCurve: Edwards PumpCalc CSV 디지타이징 (2026-04-21)
// Source: 4.스크롤펌프_소형nXDS.pdf
// 단위: [pump inlet pressure mbar, pumping speed m³/h], 60Hz
// ─────────────────────────────────────────────────────
const nXDS: PumpModel[] = [
  {
    model:"nXDS6i", series:"nXDS", type:"dry_scroll",
    speed50Hz:6.1, speed60Hz:6.4, ultimate:5e-3, motorKW_50Hz:0.23, inletFlange:"NW25",
    speedCurve: [
      [562.96861, 6.3356], [312.94818, 6.3957], [165.63259, 6.4104], [94.68738, 6.41],
      [51.14951, 6.3584], [27.62467, 6.3085], [15.69958, 6.2741], [8.48432, 6.2311],
      [4.62286, 6.0793], [2.54519, 5.8751], [1.42146, 5.5341], [0.77997, 4.9949],
      [0.42665, 4.4126], [0.2321, 3.7366], [0.12523, 3.1253], [0.06852, 2.3914],
      [0.03834, 1.3802], [0.02088, 0.0971], [0.005, 0.0],
    ],
  },
  {
    model:"nXDS10i", series:"nXDS", type:"dry_scroll",
    speed50Hz:10.0, speed60Hz:11.1, ultimate:5e-3, motorKW_50Hz:0.35, inletFlange:"NW25",
    speedCurve: [
      [525.70912, 10.7184], [273.58043, 10.9976], [144.04265, 11.0879], [74.18583, 11.0999],
      [38.1525, 11.1238], [19.55924, 11.1155], [10.01472, 11.0708], [5.12684, 10.9759],
      [2.65116, 10.6424], [1.39088, 10.0817], [0.71512, 9.0243], [0.36956, 7.9151],
      [0.19277, 6.7015], [0.10126, 5.6895], [0.05344, 4.8516], [0.02713, 4.1148],
      [0.01405, 2.8109], [0.00727, 0.2529], [0.005, 0.0],
    ],
  },
  {
    model:"nXDS15i", series:"nXDS", type:"dry_scroll",
    speed50Hz:12.5, speed60Hz:15.0, ultimate:5e-3, motorKW_50Hz:0.40, inletFlange:"NW40",
    speedCurve: [
      [518.29899, 13.9954], [266.7463, 14.6436], [139.89973, 14.9467], [71.93699, 15.0463],
      [36.89131, 15.0245], [18.98006, 14.9918], [10.2239, 14.8413], [5.23432, 14.3405],
      [2.70609, 13.6735], [1.4161, 12.8174], [0.72276, 11.4591], [0.37227, 9.7743],
      [0.1943, 8.1638], [0.09894, 6.6536], [0.05173, 5.6233], [0.02677, 4.914],
      [0.01419, 3.7891], [0.00725, 0.2868], [0.005, 0.0],
    ],
  },
  {
    model:"nXDS20i", series:"nXDS", type:"dry_scroll",
    // 2단 스크롤: 저압 구간에서 배기속도 피크 (9 mbar에서 ~21.8 m³/h)
    speed50Hz:18.1, speed60Hz:21.8, ultimate:5e-3, motorKW_50Hz:0.60, inletFlange:"NW40",
    speedCurve: [
      [520.28861, 13.0322], [291.55504, 14.6154], [166.87098, 16.1799], [94.85823, 17.9536],
      [51.19922, 19.8005], [29.07277, 20.7992], [16.50735, 21.4769], [9.34351, 21.7597],
      [5.27083, 21.6747], [2.97447, 21.1576], [1.69403, 20.0484], [0.93268, 18.0819],
      [0.52724, 15.8808], [0.29903, 13.4963], [0.16683, 10.9989], [0.09668, 8.1128],
      [0.0531, 4.6854], [0.03025, 0.0765], [0.005, 0.0],
    ],
  },
];

// ─────────────────────────────────────────────────────
// GXS 산업용 드라이 스크류 (단독)
// speedCurve: Edwards PumpCalc CSV 디지타이징 (2026-04-21)
// Source: 7.산업용드라이펌프_GXS Dry.pdf
// 조건: 100L SUS, NW25 1.1m, Air, 60Hz
// X = BP 흡입구 압력 [mbar], Y = 배기속도 [m³/h]
// ─────────────────────────────────────────────────────
const GXS: PumpModel[] = [
  {
    model:"GXS160", series:"GXS", type:"dry_screw",
    speed50Hz:133, speed60Hz:160, ultimate:1e-2, motorKW_50Hz:4.0, inletFlange:"NW40",
    speedCurve: [
      [825.4436,113.87],[461.9472,112.04],[252.3638,111.84],[140.4333,114.42],
      [75.3984,120.31],[42.3127,125.46],[22.8128,132.21],[12.7431,137.1],
      [6.9513,142.83],[3.8714,148.35],[2.2017,152.76],[1.2274,154.62],
      [0.6748,153.8],[0.369,150.25],[0.2037,144.4],[0.1098,133.93],
      [0.0622,121.63],[0.0346,101.44],[0.019,64.99],[0.0104,4.05],[0.01,0.0],
    ],
  },
  {
    model:"GXS250", series:"GXS", type:"dry_screw",
    speed50Hz:208, speed60Hz:250, ultimate:1e-2, motorKW_50Hz:7.5, inletFlange:"ISO63",
    speedCurve: [
      [753.8408,149.87],[418.357,167.62],[229.2082,182.39],[129.5366,196.8],
      [71.8804,210.25],[39.595,220.77],[21.7869,229.2],[11.8542,237.95],
      [6.789,244.17],[3.8224,244.39],[2.0911,240.46],[1.161,236.47],
      [0.6303,232.33],[0.3437,223.57],[0.1922,209.12],[0.108,196.89],
      [0.06,179.11],[0.0329,148.62],[0.0186,101.01],[0.0102,4.05],[0.01,0.0],
    ],
  },
  {
    model:"GXS450", series:"GXS", type:"dry_screw",
    speed50Hz:375, speed60Hz:450, ultimate:1e-2, motorKW_50Hz:15.0, inletFlange:"ISO100",
    speedCurve: [
      [532.9121,324.77],[299.9915,376.69],[172.0869,392.37],[94.2259,402.04],
      [52.9284,413.91],[30.792,424.93],[16.7572,436.53],[9.6438,443.83],
      [5.5602,439.17],[3.0702,435.34],[1.7903,431.5],[0.9999,423.36],
      [0.5424,410.27],[0.3157,393.37],[0.1759,365.24],[0.1009,308.66],
      [0.0563,256.27],[0.0324,199.47],[0.0179,127.85],[0.0102,4.06],[0.01,0.0],
    ],
  },
  {
    model:"GXS750", series:"GXS", type:"dry_screw",
    speed50Hz:625, speed60Hz:750, ultimate:1e-2, motorKW_50Hz:22.0, inletFlange:"ISO160",
    speedCurve: [
      [310.44,597.08],[178.549,618.84],[106.8019,643.91],[60.5119,666.08],
      [35.6054,685.46],[20.5988,706.11],[12.0703,747.81],[7.0475,747.11],
      [4.033,731.78],[2.3722,714.52],[1.3658,717.05],[0.7673,715.39],
      [0.4507,694.4],[0.265,660.74],[0.1503,601.98],[0.0906,517.38],
      [0.0527,435.14],[0.03,336.13],[0.0173,203.42],[0.0101,4.21],[0.01,0.0],
    ],
  },
];

// ─────────────────────────────────────────────────────
// GXS + GXB 루츠 부스터 조합 시스템
// speedCurve: X = GXB 흡입구 압력 [mbar], Y = 시스템 유효 배기속도 [m³/h]
// speed60Hz = 시스템 최고 배기속도 기준
// ─────────────────────────────────────────────────────
const GXS_GXB: PumpModel[] = [
  {
    model:"GXS160/1750", series:"GXS+GXB", type:"dry_screw",
    speed50Hz:650, speed60Hz:780, ultimate:5e-3, motorKW_50Hz:0, inletFlange:"NW40",
    speedCurve: [
      [632.9225,204.66],[314.3665,132.58],[155.8133,150.79],[78.8011,187.91],
      [39.5933,247.92],[19.6185,331.3],[9.758,437.31],[4.9346,556.53],
      [2.5074,657.32],[1.2108,739.7],[0.5945,779.92],[0.2987,759.2],
      [0.1521,666.53],[0.0754,520.19],[0.0385,436.73],[0.0187,401.18],
      [0.0095,385.86],[0.0048,348.4],[0.0024,246.53],[0.0012,33.7],[0.005,0.0],
    ],
  },
  {
    model:"GXS250/2600", series:"GXS+GXB", type:"dry_screw",
    speed50Hz:1190, speed60Hz:1427, ultimate:5e-3, motorKW_50Hz:0, inletFlange:"ISO63",
    speedCurve: [
      [571.5087,236.37],[289.2686,216.85],[145.9997,269.18],[73.1254,355.29],
      [35.2432,486.63],[17.395,652.43],[8.9734,823.46],[4.4495,1020.95],
      [2.2087,1233.42],[1.1119,1372.78],[0.5804,1427.24],[0.2888,1371.21],
      [0.1381,1120.12],[0.0694,859.68],[0.035,670.73],[0.0176,585.65],
      [0.009,556.45],[0.0045,513.06],[0.0022,378.24],[0.0011,36.12],[0.005,0.0],
    ],
  },
  {
    model:"GXS450/2600", series:"GXS+GXB", type:"dry_screw",
    speed50Hz:1617, speed60Hz:1940, ultimate:5e-3, motorKW_50Hz:0, inletFlange:"ISO100",
    speedCurve: [
      [212.5303,806.79],[110.6254,681.15],[60.1706,774.46],[30.6626,924.8],
      [16.2358,1101.48],[8.5615,1301.85],[4.5678,1507.32],[2.3681,1713.51],
      [1.2941,1878.67],[0.6822,1939.76],[0.3574,1871.82],[0.1809,1726.62],
      [0.0977,1545.98],[0.0517,1305.03],[0.0276,1028.74],[0.0145,798.14],
      [0.0074,659.59],[0.0039,562.03],[0.0021,386.82],[0.0011,36.19],[0.005,0.0],
    ],
  },
  {
    model:"GXS450/4200", series:"GXS+GXB", type:"dry_screw",
    speed50Hz:1750, speed60Hz:2101, ultimate:5e-3, motorKW_50Hz:0, inletFlange:"ISO100",
    speedCurve: [
      [127.9736,1449.32],[69.9446,1081.65],[37.8621,1064.58],[19.6718,1179.0],
      [10.8747,1337.69],[5.9352,1521.05],[3.2542,1708.44],[1.7067,1896.7],
      [0.8966,2009.35],[0.5035,2068.63],[0.2616,2100.07],[0.1504,2083.72],
      [0.076,1994.26],[0.0427,1833.48],[0.0229,1537.63],[0.0124,1148.08],
      [0.0067,832.88],[0.0035,649.36],[0.0019,434.69],[0.001,38.11],[0.005,0.0],
    ],
  },
  {
    model:"GXS750/2600", series:"GXS+GXB", type:"dry_screw",
    speed50Hz:1676, speed60Hz:2010, ultimate:5e-3, motorKW_50Hz:0, inletFlange:"ISO160",
    speedCurve: [
      [27.7269,1371.15],[16.7221,2009.75],[10.1197,1132.27],[6.0703,802.41],
      [3.6616,666.17],[2.2582,552.15],[1.3619,435.91],[0.8152,331.1],
      [0.4812,245.61],[0.2923,186.45],[0.1832,146.81],[0.1081,115.27],
      [0.0661,94.69],[0.0401,79.52],[0.0242,68.15],[0.0146,59.45],
      [0.0088,52.58],[0.0054,46.94],[0.0032,41.62],[0.0019,36.37],[0.005,0.0],
    ],
  },
  {
    model:"GXS750/4200", series:"GXS+GXB", type:"dry_screw",
    speed50Hz:2175, speed60Hz:2610, ultimate:5e-3, motorKW_50Hz:0, inletFlange:"ISO160",
    speedCurve: [
      [82.2149,2256.12],[45.3445,2017.55],[24.5853,1994.56],[13.7301,2069.59],
      [7.7739,2188.31],[4.2911,2340.43],[2.3715,2474.55],[1.3131,2580.56],
      [0.7337,2609.36],[0.3997,2606.02],[0.2127,2583.15],[0.1237,2532.22],
      [0.0672,2426.0],[0.0376,2241.75],[0.0199,1909.54],[0.011,1478.58],
      [0.0062,1095.04],[0.0035,795.78],[0.0019,493.9],[0.001,38.33],[0.005,0.0],
    ],
  },
];

// ─────────────────────────────────────────────────────
// iXH 반도체 드라이펌프
// Source: Edwards PumpCalc CSV (2026-04-21)
// 조건: 100L SUS+Nitrile, NW25 1.1m, Air, 60Hz
// iXH100~1820: 44/56 slm purge  |  iXH3030~6060H: 44/96/133 slm purge
// ─────────────────────────────────────────────────────
const iXH: PumpModel[] = [
  {
    model:"iXH100", series:"iXH", type:"dry_screw",
    speed50Hz:0, speed60Hz:97.8, ultimate:0.031, motorKW_50Hz:0, inletFlange:"ISO63",
    speedCurve: [
      [916.7974,53.29],[525.7093,55.84],[313.2807,58.66],[181.8397,62.39],[102.823,69.41],
      [61.0606,75.9],[34.6274,83.35],[20.5095,89.5],[12.0813,93.3],[7.0129,96.54],
      [3.9973,97.81],[2.374,97.31],[1.393,95.79],[0.8121,92.26],[0.4767,85.8],
      [0.2737,74.78],[0.1578,61.41],[0.0902,43.12],[0.0532,24.31],[0.031,1.42],[0.031,0.0],
    ],
  },
  {
    model:"iXH200H", series:"iXH", type:"dry_screw",
    speed50Hz:0, speed60Hz:217.6, ultimate:0.069, motorKW_50Hz:0, inletFlange:"ISO63",
    speedCurve: [
      [895.0872,72.9],[536.3537,81.68],[326.1404,92.97],[203.1053,107.11],[123.4611,133.55],
      [74.1637,162.36],[44.6565,184.76],[27.2386,196.75],[16.2068,205.21],[10.15,209.89],
      [6.0118,217.29],[3.8073,217.6],[2.2036,215.2],[1.3259,209.48],[0.8493,201.35],
      [0.5167,187.17],[0.311,161.84],[0.1821,125.22],[0.1124,76.25],[0.0686,0.64],[0.0686,0.0],
    ],
  },
  {
    model:"iXH610", series:"iXH", type:"dry_screw",
    speed50Hz:0, speed60Hz:645.8, ultimate:0.0017, motorKW_50Hz:0, inletFlange:"ISO100",
    speedCurve: [
      [869.6297,64.45],[431.7764,68.03],[224.1734,83.5],[111.2405,112.04],[55.854,159.0],
      [28.2241,218.11],[13.3606,301.86],[6.7977,398.25],[3.416,488.2],[1.7484,554.9],
      [0.8948,607.79],[0.4198,639.1],[0.2155,645.76],[0.1061,628.9],[0.0548,590.02],
      [0.0269,519.37],[0.0137,431.91],[0.0069,330.84],[0.0035,205.68],[0.0017,23.29],[0.0017,0.0],
    ],
  },
  {
    model:"iXH1210H", series:"iXH", type:"dry_screw",
    speed50Hz:0, speed60Hz:714.1, ultimate:0.0054, motorKW_50Hz:0, inletFlange:"ISO100",
    speedCurve: [
      [781.8352,109.34],[411.2925,81.92],[218.8318,94.3],[121.3432,114.88],[64.9854,153.75],
      [34.9048,210.34],[18.552,287.04],[9.6409,381.59],[5.2208,478.95],[2.7474,569.34],
      [1.4973,642.55],[0.8274,696.08],[0.4292,714.06],[0.2333,682.62],[0.123,576.95],
      [0.0656,453.23],[0.0346,372.78],[0.0193,322.58],[0.01,221.23],[0.0054,7.48],[0.0054,0.0],
    ],
  },
  {
    model:"iXH1220H", series:"iXH", type:"dry_screw",
    speed50Hz:0, speed60Hz:857.0, ultimate:0.0036, motorKW_50Hz:0, inletFlange:"ISO100",
    speedCurve: [
      [755.693,125.99],[404.3269,101.77],[205.6876,132.24],[108.764,177.64],[56.3595,252.12],
      [30.6418,344.47],[15.9053,458.76],[8.316,579.07],[4.244,708.08],[2.313,797.91],
      [1.1782,852.35],[0.6155,856.99],[0.3213,808.02],[0.1703,682.64],[0.0902,535.43],
      [0.0466,439.86],[0.0246,394.6],[0.0133,354.75],[0.0069,256.98],[0.0036,11.26],[0.0036,0.0],
    ],
  },
  {
    model:"iXH1820H", series:"iXH", type:"dry_screw",
    speed50Hz:0, speed60Hz:1021.1, ultimate:0.0035, motorKW_50Hz:0, inletFlange:"ISO160",
    speedCurve: [
      [778.0078,107.95],[412.7174,96.74],[212.5796,121.91],[114.3427,158.66],[57.7146,222.79],
      [30.4806,305.11],[15.3423,405.16],[8.0903,517.1],[4.2492,656.15],[2.2576,787.0],
      [1.2056,905.13],[0.6191,999.62],[0.3243,1021.08],[0.1661,964.11],[0.0897,857.63],
      [0.0473,681.2],[0.0236,551.99],[0.0125,471.24],[0.0066,340.51],[0.0035,11.65],[0.0035,0.0],
    ],
  },
  {
    model:"iXH3030", series:"iXH", type:"dry_screw",
    speed50Hz:0, speed60Hz:879.5, ultimate:0.0047, motorKW_50Hz:0, inletFlange:"ISO160",
    speedCurve: [
      [745.0502,92.47],[405.2139,72.42],[208.3366,99.99],[112.5308,138.53],[60.5474,200.25],
      [32.6503,300.72],[16.9485,412.56],[8.7815,531.76],[4.7344,649.57],[2.5245,753.47],
      [1.321,831.95],[0.7092,879.48],[0.3832,871.09],[0.2053,786.83],[0.1086,663.57],
      [0.0573,566.43],[0.0308,522.44],[0.0165,497.35],[0.0088,403.28],[0.0047,8.58],[0.0047,0.0],
    ],
  },
  {
    model:"iXH3045H", series:"iXH", type:"dry_screw",
    speed50Hz:0, speed60Hz:1168.7, ultimate:0.0079, motorKW_50Hz:0, inletFlange:"ISO160",
    speedCurve: [
      [530.1143,192.95],[270.8319,173.7],[137.7179,241.67],[70.7188,341.67],[36.3798,465.22],
      [17.6104,605.28],[9.3943,738.89],[4.5612,896.12],[2.3549,1042.23],[1.1862,1126.55],
      [0.6177,1168.03],[0.3024,1122.12],[0.155,985.58],[0.0784,808.53],[0.0416,688.98],
      [0.0211,631.86],[0.0107,599.97],[0.0052,566.38],[0.0027,461.2],[0.0014,28.96],[0.0014,0.0],
    ],
  },
  {
    model:"iXH4550HT", series:"iXH", type:"dry_screw",
    speed50Hz:0, speed60Hz:1326.5, ultimate:0.0083, motorKW_50Hz:0, inletFlange:"ISO160",
    speedCurve: [
      [687.2652,135.38],[342.6889,124.31],[174.1821,199.92],[91.945,291.2],[44.9173,440.88],
      [23.3263,600.31],[12.1219,755.08],[6.1126,923.38],[3.0865,1112.39],[1.5421,1263.64],
      [0.8004,1324.65],[0.4044,1295.05],[0.1985,1122.73],[0.1032,897.08],[0.0503,714.56],
      [0.0254,654.0],[0.0129,653.91],[0.0069,637.21],[0.0034,521.58],[0.0017,23.05],[0.0017,0.0],
    ],
  },
  {
    model:"iXH6050H", series:"iXH", type:"dry_screw",
    speed50Hz:0, speed60Hz:1300.1, ultimate:0.0072, motorKW_50Hz:0, inletFlange:"ISO160",
    speedCurve: [
      [665.4745,132.93],[323.347,130.1],[154.2984,210.11],[73.9461,321.72],[35.5486,480.54],
      [18.3383,617.02],[8.5264,777.19],[4.1401,949.89],[2.0747,1123.95],[0.9593,1245.25],
      [0.4603,1300.1],[0.2236,1237.61],[0.1138,1089.39],[0.0553,931.18],[0.0257,851.89],
      [0.0128,803.25],[0.0063,744.75],[0.0029,658.45],[0.0014,464.94],[0.0007,57.33],[0.0007,0.0],
    ],
  },
];

// ─────────────────────────────────────────────────────
// nXRi / iXL / nEXT / STP — PumpCalc CSV 미확보
// ─────────────────────────────────────────────────────
const PENDING: PumpModel[] = [
  { model:"nXRi200", series:"nXRi", type:"dry_screw", speed50Hz:0, speed60Hz:0, ultimate:0, motorKW_50Hz:0 },
];

// ─────────────────────────────────────────────────────
// 전체 펌프 목록
// ─────────────────────────────────────────────────────
export const ALL_PUMPS: PumpModel[] = [
  ...RV, ...E2M_small, ...E2M_large, ...nES, ...EH, ...EXS,
  ...nXDS, ...GXS, ...GXS_GXB, ...iXH, ...PENDING,
];

export const PUMPS_BY_SERIES: Record<string, PumpModel[]> = {
  RV, E2M_small, E2M_large, nES, EH, EXS, nXDS, GXS, GXS_GXB, iXH,
};

// ─────────────────────────────────────────────────────
// 표준 플랜지 규격 및 배관 최적화 추천
// ─────────────────────────────────────────────────────

/** KF(NW) / ISO 표준 플랜지: 이름, 내경(mm) */
export const STANDARD_FLANGES = [
  { name: "NW10",   id_mm: 10  },
  { name: "NW16",   id_mm: 16  },
  { name: "NW25",   id_mm: 25  },
  { name: "NW40",   id_mm: 40  },
  { name: "NW50",   id_mm: 50  },
  { name: "ISO63",  id_mm: 63  },
  { name: "ISO100", id_mm: 100 },
  { name: "ISO160", id_mm: 160 },
  { name: "ISO200", id_mm: 200 },
] as const;

export type FlangeEntry = typeof STANDARD_FLANGES[number];

export type PipeRecommendation = {
  /** 추천 플랜지 규격 */
  recommended: { name: string; id_mm: number; conductance_m3h: number; efficiencyPct: number };
  /** 한 단계 작은 규격 (비교용) */
  smaller:     { name: string; id_mm: number; conductance_m3h: number; efficiencyPct: number } | null;
  /** 한 단계 큰 규격 (비교용) */
  larger:      { name: string; id_mm: number; conductance_m3h: number; efficiencyPct: number } | null;
  note?: string;
};

/**
 * AI 상담용 최적 배관 플랜지 추천
 *
 * 분자류 컨덕턴스(저압 한계, p→0)를 기준으로 사용.
 * → 러프/미디엄 진공 전 구간에서 보수적으로 안전한 규격 산출.
 *
 * 목표 효율(기본 95%): S_eff / S_pump ≥ targetEfficiency
 * 수학적으로 C_pipe ≥ S_pump × ratio / (1 - ratio) 를 만족하는 최소 규격 선택.
 * 펌프 자체 흡입구 플랜지보다 큰 규격은 추천하지 않음.
 */
export function recommendPipe(
  pump: PumpModel,
  pipeLength_m: number,
  pipeBends = 0,
  hz: 50 | 60 = 60,
  targetEfficiency = 0.95,
): PipeRecommendation {
  const S_pump = hz === 50 ? pump.speed50Hz : pump.speed60Hz;

  // 펌프 흡입구 플랜지 내경 파악 (상한 캡용)
  const inletID = pump.inletFlange
    ? (STANDARD_FLANGES.find(f => f.name === pump.inletFlange)?.id_mm ?? Infinity)
    : Infinity;

  // 분자류 컨덕턴스만 사용 (p=0 극한)
  const molC = (id_mm: number) => {
    const d = id_mm / 1000;
    const L = Math.max(pipeLength_m + pipeBends * (d * 15), 0.01);
    return 4.356e5 * Math.pow(d, 3) / L; // m³/h
  };

  const effPct = (id_mm: number) => {
    const C = molC(id_mm);
    if (S_pump <= 0 || C <= 0) return 100;
    return Math.round((C / (S_pump + C)) * 1000) / 10; // %
  };

  // 대상 후보: 펌프 흡입구 이하 규격만
  const candidates = STANDARD_FLANGES.filter(f => f.id_mm <= inletID);

  let recIdx = candidates.findIndex(f => effPct(f.id_mm) >= targetEfficiency * 100);
  if (recIdx === -1) recIdx = candidates.length - 1; // 전부 미달이면 최대 규격

  const make = (f: typeof STANDARD_FLANGES[number]) => {
    const C = molC(f.id_mm);
    return { name: f.name, id_mm: f.id_mm, conductance_m3h: Math.round(C * 10) / 10, efficiencyPct: effPct(f.id_mm) };
  };

  const rec = candidates[recIdx];
  const recEff = effPct(rec.id_mm);

  return {
    recommended: make(rec),
    smaller:     recIdx > 0 ? make(candidates[recIdx - 1]) : null,
    larger:      recIdx < candidates.length - 1 ? make(candidates[recIdx + 1]) : null,
    note: recEff < targetEfficiency * 100
      ? `최대 규격(${rec.name})에서도 ${recEff}% — 배관 길이 단축 또는 병렬 배관 검토 필요`
      : undefined,
  };
}

// ─────────────────────────────────────────────────────
// Pump-Down Time 계산 엔진
//
// speedCurve 있는 모델: ODE 수치 적분 (Edwards PumpCalc 동등)
//   dP/dt = [-S_eff(P) × P + Q_out] / V
//   S_eff = 1 / (1/S_pump(P) + 1/C_pipe(P))
//
// speedCurve 없는 모델: ln 근사식 (기존)
//   t = (V/S_eff) × ln(P_start/P_target)
//
// 배관 컨덕턴스 (점성류 + 분자류 합산, Knudsen 근사):
//   C = C_mol + C_visc = 4.356e5 × d³/L + 4.83e8 × d⁴/L × P
//   [m³/h, d=m, L=m, P=mbar]
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
  reachable: boolean;
};

/** 배관 컨덕턴스 [m³/h] — 점성류 + 분자류 Knudsen 합산 */
function pipeConductance_m3h(id_mm: number, len_m: number, bends: number, p_mbar = 1.0): number {
  const d = id_mm / 1000; // m
  const L = Math.max(len_m + bends * (d * 15), 0.01); // 꺾임 등가 길이 (지름 15배)
  const C_mol  = 4.356e5 * Math.pow(d, 3) / L;          // 분자류 [m³/h]
  const C_visc = 4.83e8  * Math.pow(d, 4) / L * p_mbar; // 점성류 [m³/h]
  return C_mol + C_visc;
}

/** speed curve 로그-압력 선형 보간 */
function interpolateSpeed(
  curve: [number, number][],
  p_mbar: number,
  scale = 1.0,
): number {
  if (!curve || curve.length === 0) return 0;
  if (p_mbar >= curve[0][0])               return curve[0][1] * scale;
  if (p_mbar <= curve[curve.length - 1][0]) return 0;
  for (let i = 0; i < curve.length - 1; i++) {
    const [p1, s1] = curve[i];
    const [p2, s2] = curve[i + 1];
    if (p_mbar <= p1 && p_mbar >= p2) {
      const t = (Math.log(p_mbar) - Math.log(p1)) / (Math.log(p2) - Math.log(p1));
      return Math.max(0, (s1 + t * (s2 - s1)) * scale);
    }
  }
  return 0;
}

/**
 * 배관 양단 압력 P_chamber, 연결된 펌프 speed curve, pipe conductance가 주어질 때
 * 질량 보존 S_pump(P_pump)·P_pump = C·(P_chamber − P_pump) 를 이분법으로 풀어 P_pump 반환.
 * C >> S_pump 이면 P_pump ≈ P_chamber (pressure drop 없음),
 * C << S_pump 이면 P_pump << P_chamber (conductance-limited).
 */
function solvePumpInlet(
  P_chamber: number,
  curve: [number, number][],
  ultimate: number,
  C_pipe: number,
  scale: number,
): number {
  const f = (p: number) => interpolateSpeed(curve, p, scale) * p - C_pipe * (P_chamber - p);
  // f(P_chamber) = S_pump(P_chamber)*P_chamber ≥ 0
  // f(ultimate)  ≈ -C_pipe*(P_chamber - ultimate) < 0
  if (f(P_chamber) <= 0) return P_chamber; // S_pump=0 구간 (압력 아래 한계)
  let lo = ultimate, hi = P_chamber;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid; else hi = mid;
    if ((hi - lo) < 1e-12 * P_chamber) break;
  }
  return (lo + hi) / 2;
}

/** speedCurve 기반 ODE 수치 적분 (Edwards PumpCalc 동등) */
function calcPumpDownNumerical(input: PumpDownInput, pump: PumpModel): PumpDownResult {
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

  const V       = chamberVol_L * 1e-3;                       // m³
  const scale   = hz === 50 ? 50 / 60 : 1.0;
  const surface = chamberSurface_cm2 ?? Math.pow(chamberVol_L * 1e-3, 2 / 3) * 6 * 1e4;
  const Q_out   = outgassingRate * surface * 1e-3;            // mbar·m³/s (상수 근사)
  const reachable = targetPressure_mbar > pump.ultimate;

  let P   = startPressure_mbar;
  let t_s = 0;
  const maxT = 86400; // 24h 상한
  const dt   = 1.0;   // 1초 스텝

  while (P > targetPressure_mbar && t_s < maxT) {
    const C      = pipeConductance_m3h(pipeID_mm, pipeLength_m, pipeBends, P); // m³/h
    const P_pump = solvePumpInlet(P, pump.speedCurve!, pump.ultimate, C, scale);
    const S_pump = interpolateSpeed(pump.speedCurve!, P_pump, scale);
    // S_eff = Q_net / P_chamber = S_pump(P_pump)·P_pump / P_chamber
    const S_eff   = S_pump > 0 ? S_pump * P_pump / P : 0;
    const S_eff_s = S_eff / 3600; // m³/s

    // dP/dt = (-S_eff × P + Q_out) / V  [mbar/s]
    const dP = ((-S_eff_s * P + Q_out) / V) * dt;
    P = Math.max(P + dP, pump.ultimate);
    t_s += dt;

    // 압력 변화 무시할 정도면 조기 종료
    if (Math.abs(dP) < 1e-10 * P) break;
  }

  const S_nom    = scale * (hz === 50 ? pump.speed50Hz : pump.speed60Hz);
  const C_nom    = pipeConductance_m3h(pipeID_mm, pipeLength_m, pipeBends, 1.0);
  const S_eff_nom = S_nom > 0 && C_nom > 0 ? 1 / (1 / S_nom + 1 / C_nom) : S_nom;

  return {
    model: pump.model,
    series: pump.series,
    pumpSpeed_m3h: Math.round(S_nom * 10) / 10,
    effectiveSpeed_m3h: Math.round(S_eff_nom * 10) / 10,
    pipeConduct_m3h: Math.round(C_nom * 10) / 10,
    pumpDownTime_s: Math.round(t_s),
    pumpDownTime_min: Math.round(t_s / 60 * 10) / 10,
    reachable,
  };
}

/** ln 근사식 (speedCurve 없는 모델용) */
function calcPumpDownSimple(input: PumpDownInput, pump: PumpModel): PumpDownResult {
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

  const V         = chamberVol_L / 1000;
  const pumpSpeed = hz === 50 ? pump.speed50Hz : pump.speed60Hz;
  const C         = pipeConductance_m3h(pipeID_mm, pipeLength_m, pipeBends, 1.0);
  const S_eff     = pumpSpeed > 0 && C > 0 ? 1 / (1 / pumpSpeed + 1 / C) : pumpSpeed;
  const reachable = targetPressure_mbar > pump.ultimate;

  const surface    = chamberSurface_cm2 ?? Math.pow(chamberVol_L * 1e-3, 2 / 3) * 6 * 1e4;
  const Q_out      = outgassingRate * surface * 1e-3;
  const P_ult_sys  = Math.max(pump.ultimate, Q_out / (S_eff / 3600));
  const P_target   = Math.max(targetPressure_mbar, P_ult_sys * 1.05);

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

export function calcPumpDown(input: PumpDownInput, pump: PumpModel): PumpDownResult {
  return pump.speedCurve && pump.speedCurve.length > 0
    ? calcPumpDownNumerical(input, pump)
    : calcPumpDownSimple(input, pump);
}

/**
 * 조건에 맞는 펌프 자동 추천
 * - 목표 압력 도달 가능한 모델만
 * - pump-down time 기준 정렬
 */
export function recommendPumps(
  input: PumpDownInput,
  maxResults = 5,
  seriesFilter?: string[],   // 허용 시리즈 목록 (미지정 = 전체)
): PumpDownResult[] {
  const candidates = ALL_PUMPS.filter((p) => {
    if (p.speed60Hz <= 0) return false;
    if (p.type === "booster") return false;  // 부스터 단독 제외
    if (p.ultimate <= 0) return false;       // ultimate 미정 제외
    if (p.ultimate >= input.targetPressure_mbar) return false;
    if (seriesFilter && seriesFilter.length > 0 && !seriesFilter.includes(p.series)) return false;
    return true;
  });

  return candidates
    .map((p) => calcPumpDown(input, p))
    .filter((r) => r.reachable && r.pumpDownTime_s < 86400)
    .sort((a, b) => a.pumpDownTime_s - b.pumpDownTime_s)
    .slice(0, maxResults);
}
