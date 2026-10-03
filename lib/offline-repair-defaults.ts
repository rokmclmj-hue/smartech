// 전 모델 공통 마스터 항목 (엑셀 파싱 후 해당 항목만 isNA: false로 전환)
export const DEFAULT_ITEMS = [
  { sortOrder:  0, itemLabel: "Vacuum Test (Combi)",   unit: "Torr",       spec: null, isNA: true },
  { sortOrder:  1, itemLabel: "Vacuum Test (Single)",  unit: "Torr",       spec: null, isNA: true },
  { sortOrder:  2, itemLabel: "Vacuum (Booster)",      unit: "Torr",       spec: null, isNA: true },
  { sortOrder:  3, itemLabel: "Vacuum (Scroll)",       unit: "Torr",       spec: null, isNA: true },
  { sortOrder:  4, itemLabel: "Current (Combi)",       unit: "A",          spec: null, isNA: true },
  { sortOrder:  5, itemLabel: "Current (Single)",      unit: "A",          spec: null, isNA: true },
  { sortOrder:  6, itemLabel: "Current (Booster)",     unit: "A",          spec: null, isNA: true },
  { sortOrder:  7, itemLabel: "Current (Scroll)",      unit: "A",          spec: null, isNA: true },
  { sortOrder:  8, itemLabel: "Current (Rotary)",      unit: "A",          spec: null, isNA: true },
  { sortOrder:  9, itemLabel: "Body temp",             unit: "℃",          spec: null, isNA: true },
  { sortOrder: 10, itemLabel: "Body temp (Booster)",   unit: "℃",          spec: null, isNA: true },
  { sortOrder: 11, itemLabel: "Body temp (Scroll)",    unit: "℃",          spec: null, isNA: true },
  { sortOrder: 12, itemLabel: "Body temp (Rotary)",    unit: "℃",          spec: null, isNA: true },
  { sortOrder: 13, itemLabel: "Leak (sys.mod)",        unit: "mbar·ℓ/sec", spec: null, isNA: true },
  { sortOrder: 14, itemLabel: "Oil leak",              unit: "유/무",       spec: null, isNA: true },
  { sortOrder: 15, itemLabel: "Water leak",            unit: "유/무",       spec: null, isNA: true },
  { sortOrder: 16, itemLabel: "Noise",                 unit: "유/무",       spec: null, isNA: true },
  { sortOrder: 17, itemLabel: "Function test",         unit: "정상/이상",   spec: null, isNA: true },
  { sortOrder: 18, itemLabel: "Test time",             unit: "hr",          spec: null, isNA: true },
  { sortOrder: 19, itemLabel: "Oil",                   unit: "N/A",         spec: null, isNA: true },
];

// 수리접수 번호 SMT-YYYY-R-NNNNNN (수리접수 직접 등록·온라인수리에서 넘기기 공용)
export function formatRepairJobNo(id: number, year = new Date().getFullYear()): string {
  return `SMT-${year}-R-${String(id).padStart(6, "0")}`;
}

// 온라인 수리접수 증상 코드 → 한글 (관리자 화면·블로그 초안·수리접수 메모 공용)
export const SYMPTOM_KO: Record<string, string> = {
  vibration: "진동/소음", vacuum: "진공 불량", overload: "과부하",
  temperature: "온도 이상", oil_leak: "오일 누유", contamination: "공정 오염",
  electrical: "전기/제어 오류", other: "기타",
};
