// Edwards 공식 카탈로그(PDF) 기준 검증된 스펙 데이터.
// components/ProductPanel.tsx(스펙 비교 패널)와 app/products/[partNo](모델 상세페이지)가 공유한다.
// 추가/수정 시 반드시 Edwards PDF 카탈로그로 재확인 후 기입 — 추정값 금지.

export type SpecRow = { label: string; unit: string; values: string[] };
export type SpecData = { models: string[]; rows: SpecRow[] };

export const SPEC_DATA: Record<string, SpecData> = {
  "오일펌프(소형 RV)": {
    models: ["RV3", "RV5", "RV8", "RV12"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["3.9", "6.1", "10.0", "14.3"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["2.0×10⁻³", "2.0×10⁻³", "2.0×10⁻³", "2.0×10⁻³"] },
      { label: "모터 출력 (60 Hz)", unit: "W", values: ["550", "550", "550", "550"] },
      { label: "회전수 (60 Hz)", unit: "rpm", values: ["1,800", "1,800", "1,800", "1,800"] },
      { label: "소음", unit: "dB(A)", values: ["48", "48", "48", "48"] },
      { label: "무게", unit: "kg", values: ["25", "25", "28", "29"] },
      { label: "오일 용량", unit: "L", values: ["0.7", "0.7", "0.75", "1.0"] },
      { label: "인렛 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["12~40", "12~40", "12~40", "12~40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["430×158×225", "430×158×225", "470×158×225", "490×158×225"] },
    ],
  },
  "오일펌프(소형 E2M)": {
    models: ["E2M0.7", "E2M1.5", "E2M18", "E2M28"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["0.85", "2.0", "20.6", "33.1"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["3×10⁻³", "3×10⁻³", "1×10⁻³", "1×10⁻³"] },
      { label: "모터 출력 (60 Hz)", unit: "W", values: ["90", "160", "750", "900"] },
      { label: "회전수 (60 Hz)", unit: "rpm", values: ["1,700", "1,700", "1,720", "1,720"] },
      { label: "소음", unit: "dB(A)", values: ["43", "54", "57", "57"] },
      { label: "무게", unit: "kg", values: ["10", "10", "39", "44"] },
      { label: "오일 용량", unit: "L", values: ["0.2~0.28", "0.2~0.28", "0.75~1.05", "1.2~1.5"] },
      { label: "인렛 플랜지", unit: "", values: ["NW10", "NW10", "NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["12~40", "12~40", "13~40", "13~40"] },
    ],
  },
  "오일펌프(중대형 E2S)": {
    models: ["E2S45", "E2S65", "E2S85"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["50", "69", "94"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["3.0×10⁻³", "3.0×10⁻³", "3.0×10⁻³"] },
      { label: "모터 출력 (60 Hz)", unit: "kW", values: ["1.3", "1.8", "2.6"] },
      { label: "소음 (60 Hz)", unit: "dB(A)", values: ["60", "62", "62"] },
      { label: "무게", unit: "kg", values: ["80", "90", "100"] },
      { label: "오일 용량", unit: "L", values: ["4.3", "4.8", "5.5"] },
      { label: "인렛 플랜지", unit: "", values: ["NW40", "NW40", "NW40"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW25"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["740×244×405", "770×244×405", "857×244×405"] },
    ],
  },
  "오일펌프(중대형 E2M)": {
    models: ["E2M40", "E2M80", "E2M175", "E2M275"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["44", "90", "196", "306"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["3.0×10⁻³", "3.0×10⁻³", "3.0×10⁻³", "3.0×10⁻³"] },
      { label: "모터 출력 (60 Hz)", unit: "kW", values: ["1.5", "3.0", "6.5", "8.5"] },
      { label: "소음", unit: "dB(A)", values: ["65", "65", "75", "75"] },
      { label: "무게", unit: "kg", values: ["75", "104", "198", "216"] },
      { label: "오일 용량", unit: "L", values: ["2.2~4", "4~6.3", "16~25", "18~28"] },
      { label: "인렛 플랜지", unit: "", values: ["NW40", "NW40", "NW63", "NW63"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW40", "NW40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["780×240×395", "889×266×429", "1055×388×533", "1165×388×533"] },
    ],
  },
  "오일펌프(nES)": {
    models: ["nES40", "nES65", "nES100", "nES200"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["47", "64", "105", "200"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["0.5", "0.5", "0.5", "0.08"] },
      { label: "모터 출력 (60 Hz)", unit: "kW", values: ["1.3", "1.8", "3.6", "5.5"] },
      { label: "소음 (60 Hz)", unit: "dB(A)", values: ["60", "64", "64", "73"] },
      { label: "무게", unit: "kg", values: ["67", "86", "104", "142"] },
      { label: "오일 용량", unit: "L", values: ["1", "2", "2", "5~9"] },
      { label: "인렛 플랜지", unit: "", values: ["NW40", "NW40", "NW40", "NW63"] },
      { label: "배기 플랜지", unit: "", values: ["NW40", "NW40", "NW40", "NW63"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["540×284×303", "586×320×314", "721×400×319", "1002×535×415"] },
    ],
  },
  "스크롤펌프(소형 nXDS)": {
    models: ["nXDS6i", "nXDS10i", "nXDS15i", "nXDS20i"],
    rows: [
      { label: "배기속도 (Peak)", unit: "m³/h", values: ["6.2", "12.7", "17.1", "22.0"] },
      { label: "도달압력", unit: "mbar", values: ["2.0×10⁻²", "7.0×10⁻³", "7.0×10⁻³", "3.0×10⁻²"] },
      { label: "모터 출력", unit: "W", values: ["260", "280", "300", "260"] },
      { label: "회전수", unit: "rpm", values: ["1,800", "1,800", "1,800", "1,800"] },
      { label: "소음", unit: "dB(A)", values: ["<52", "<52", "<52", "<52"] },
      { label: "무게", unit: "kg", values: ["26.2", "25.8", "25.2", "25.6"] },
      { label: "인렛 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["10~40", "10~40", "10~40", "10~40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["432×282×302", "432×282×302", "432×282×302", "432×282×302"] },
    ],
  },
  "스크롤펌프(중형 XDS)": {
    models: ["XDS35i", "XDS46i"],
    rows: [
      { label: "배기속도 (Peak)", unit: "m³/h", values: ["35", "40"] },
      { label: "도달압력", unit: "mbar", values: ["0.01", "0.05"] },
      { label: "모터 출력", unit: "W", values: ["520", "520"] },
      { label: "회전수", unit: "rpm", values: ["1,750", "1,750"] },
      { label: "소음", unit: "dB(A)", values: ["57", "55.4"] },
      { label: "무게", unit: "kg", values: ["48", "48"] },
      { label: "인렛 플랜지", unit: "", values: ["NW40", "NW40"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["5~40", "5~40"] },
    ],
  },
  "산업용드라이펌프(GXS)": {
    models: ["GXS160", "GXS250", "GXS450", "GXS750"],
    rows: [
      { label: "배기속도 (Peak)", unit: "m³/h", values: ["160", "250", "450", "740"] },
      { label: "도달압력", unit: "mbar", values: ["7×10⁻³", "4×10⁻³", "5×10⁻³", "3×10⁻³"] },
      { label: "모터 출력", unit: "kW", values: ["3.8", "4.0", "7.2", "10.0"] },
      { label: "소음", unit: "dB(A)", values: ["<64", "<64", "<64", "<70"] },
      { label: "무게", unit: "kg", values: ["305", "305", "640", "640"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO63", "ISO63", "ISO100", "ISO100"] },
      { label: "배기 플랜지", unit: "", values: ["NW40", "NW40", "NW50", "NW50"] },
      { label: "작동 온도", unit: "°C", values: ["5~40", "5~40", "5~40", "5~40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["880×347×1092", "880×347×1092", "872×300×1186", "1134×413×1622"] },
    ],
  },
  "산업용드라이펌프(EXS)": {
    models: ["EXS160", "EXS250", "EXS450", "EXS750"],
    rows: [
      { label: "배기속도 (Peak)", unit: "m³/h", values: ["160", "250", "450", "740"] },
      { label: "도달압력", unit: "mbar", values: ["1×10⁻²", "1×10⁻²", "1×10⁻²", "1×10⁻²"] },
      { label: "모터 출력", unit: "kW", values: ["3.8", "4.0", "7.2", "10.5"] },
      { label: "소음", unit: "dB(A)", values: ["<64", "<64", "<64", "<70"] },
      { label: "무게", unit: "kg", values: ["305", "315", "570", "650"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO63", "ISO63", "ISO100", "ISO100"] },
      { label: "배기 플랜지", unit: "", values: ["NW40", "NW40", "ISO63", "NW50"] },
      { label: "작동 온도", unit: "°C", values: ["5~40", "5~40", "5~40", "5~40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["1265×520×539", "1265×520×539", "1445×567×763", "1650×567×642"] },
    ],
  },
  "반도체드라이펌프(iXH)": {
    models: ["iXH100", "iXH610", "iXH1210", "iXH1820", "iXH3030"],
    rows: [
      { label: "최대 배기속도", unit: "m³/h", values: ["100", "665", "1,025", "1,820", "2,900"] },
      { label: "도달압력", unit: "mbar", values: ["2×10⁻²", "5×10⁻³", "5×10⁻³", "5×10⁻³", "5×10⁻³"] },
      { label: "소비전력 (도달압력 시)", unit: "kW", values: ["2.1", "2.6", "3.2", "3.9", "5.7"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO63", "ISO100", "ISO100", "ISO160", "ISO160"] },
      { label: "배기 플랜지", unit: "", values: ["NW40", "NW40", "NW40", "NW40", "NW40"] },
      { label: "무게", unit: "kg", values: ["260", "355", "430", "487", "619"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["784×390×526", "784×390×780", "784×390×780", "901×390×780", "915×517×966"] },
    ],
  },
  "반도체드라이펌프(nXRi)": {
    models: ["nXR30i", "nXR40i", "nXR60i", "nXR90i", "nXR120i"],
    rows: [
      { label: "배기속도 (Peak)", unit: "m³/h", values: ["30", "40", "60", "90", "120"] },
      { label: "도달압력", unit: "mbar", values: ["0.03", "0.03", "0.03", "0.03", "0.03"] },
      { label: "소음", unit: "dB(A)", values: ["55", "55", "55", "55", "55"] },
      { label: "무게", unit: "kg", values: ["27", "27", "29", "29", "29"] },
      { label: "인렛 플랜지", unit: "", values: ["NW25", "NW25", "NW40", "NW40", "NW40"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["5~40", "5~40", "5~40", "5~40", "5~40"] },
    ],
  },
  "터보펌프(nEXT)": {
    models: ["nEXT85D", "nEXT240D", "nEXT300D", "nEXT400D", "nEXT730D"],
    rows: [
      { label: "배기속도 N₂ (Peak)", unit: "m³/h", values: ["302", "864", "1,080", "1,440", "2,628"] },
      { label: "소비전력", unit: "W", values: ["80", "160", "160", "160", "—"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO63", "ISO100", "ISO100", "ISO160", "ISO160"] },
      { label: "배기 포트", unit: "", values: ["NW16", "NW25", "NW25", "NW25", "NW40"] },
      { label: "무게", unit: "kg", values: ["2.9", "5.7", "5.7", "6.5", "14.6"] },
    ],
  },
  "반도체드라이펌프(iXL)": {
    models: ["iXL250Q", "iXL500Q", "iXL500R", "iXL750Q"],
    rows: [
      { label: "배기속도 (드라이 펌프)", unit: "m³/h", values: ["250", "500", "500", "750"] },
      { label: "도달압력", unit: "mbar", values: ["<5×10⁻³", "<5×10⁻³", "<5×10⁻³", "<5×10⁻³"] },
      { label: "소비전력 (도달압력 시)", unit: "kW", values: ["5.3", "7.0", "7.0", "9.8"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO160", "ISO160", "ISO160", "ISO160"] },
      { label: "배기 플랜지", unit: "", values: ["NW40", "NW50", "NW50", "NW50"] },
      { label: "무게", unit: "kg", values: ["515", "740", "874", "918"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["1092×390×830", "1186×517×966", "1186×517×966", "1622×517×1031"] },
    ],
  },
  "부스터펌프(EH)": {
    models: ["EH250", "EH500", "EH1200", "EH2600", "EH4200"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["375", "605", "1,435", "3,110", "4,985"] },
      { label: "모터 출력", unit: "kW", values: ["2.2", "2.2", "3.0", "11.0", "11.0"] },
      { label: "냉각 방식", unit: "", values: ["공냉", "공냉", "수냉", "수냉", "수냉"] },
      { label: "무게", unit: "kg", values: ["69", "106", "149", "401", "481"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO63", "ISO100", "ISO160", "ISO160", "ISO250"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["705×305×272", "791×305×265", "953×380×334", "1156×522×479", "1336×522×479"] },
    ],
  },
};

/** "E2M0.7" → "e2m0-7", "nXDS10i" → "nxds10i" 등 URL-safe 슬러그 변환 */
function slugifyModel(model: string): string {
  return model
    .toLowerCase()
    .replace(/[.\s/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** 모델명 → 전체 URL 슬러그 (예: "RV3" → "edwards-rv3") */
export function modelSlug(model: string): string {
  return `edwards-${slugifyModel(model)}`;
}

export type ModelLookup = { category: string; model: string; index: number };

/** URL 파라미터(예: "edwards-rv3")로 카테고리·모델·인덱스를 찾는다. 못 찾으면 null. */
export function findModelBySlug(param: string): ModelLookup | null {
  const norm = param.toLowerCase();
  for (const [category, data] of Object.entries(SPEC_DATA)) {
    const index = data.models.findIndex((m) => modelSlug(m) === norm);
    if (index !== -1) return { category, model: data.models[index], index };
  }
  return null;
}

/** sitemap.ts에서 사용 — 모든 모델 슬러그 목록 */
export function allModelSlugs(): string[] {
  const out: string[] = [];
  for (const data of Object.values(SPEC_DATA)) {
    for (const m of data.models) out.push(modelSlug(m));
  }
  return out;
}

/** 특정 모델의 스펙 행(라벨/단위/값 1개)만 추출 */
export function getModelSpecRows(category: string, index: number) {
  return SPEC_DATA[category].rows.map((r) => ({
    label: r.label,
    unit: r.unit,
    value: r.values[index],
  }));
}

/** 같은 카테고리의 다른 모델(대체·상위/하위 모델) 목록 */
export function getSiblingModels(category: string, excludeIndex: number) {
  return SPEC_DATA[category].models
    .map((m, i) => ({ model: m, slug: modelSlug(m), index: i }))
    .filter((m) => m.index !== excludeIndex);
}
