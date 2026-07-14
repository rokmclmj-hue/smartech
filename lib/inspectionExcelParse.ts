import * as XLSX from "xlsx";

// 엑셀 라벨 → 마스터 항목명 매핑
export const INSPECTION_LABEL_MAP: Record<string, string> = {
  "Vacuum Test(Combi)":  "Vacuum Test (Combi)",
  "Vacuum Test(Single)": "Vacuum Test (Single)",
  "Vacuum (Booster)":    "Vacuum (Booster)",
  "Vacuum (Scroll)":     "Vacuum (Scroll)",
  "Current (Combi)":     "Current (Combi)",
  "Current (Single)":    "Current (Single)",
  "Current (Booster)":   "Current (Booster)",
  "Current (Scroll)":    "Current (Scroll)",
  "Current (Rotary)":    "Current (Rotary)",
  "Current (BP)":        "Current (Booster)",   // E2M275+EH2600 별칭
  "Current (RP)":        "Current (Rotary)",    // E2M275+EH2600 별칭
  "Body temp":           "Body temp",
  "Body temp (Booster)": "Body temp (Booster)",
  "Body temp (Scroll)":  "Body temp (Scroll)",
  "Body temp (Rotary)":  "Body temp (Rotary)",
  "Body temp (RP)":      "Body temp (Rotary)",  // E2M275+EH2600 별칭
  "Leak (sys.mod)":      "Leak (sys.mod)",
  "Oil leak":            "Oil leak",
  "Water leak":          "Water leak",
  "Noise":               "Noise",
  "Function test":       "Function test",
  "Test time":           "Test time",
  "Oil":                 "Oil",
  "Oil ":                "Oil",                 // 공백 포함 버전
};

export interface ParsedInspectionRow {
  masterLabel: string;
  spec: string | null;
  value: string;
  pass: boolean | null;
  isNA: boolean;
}

/**
 * 검사성적서 엑셀(수리 협력사 양식)을 파싱해서 마스터 항목별 값을 뽑아낸다.
 * 순번(seq) 컬럼이 1부터 시작하는 행을 데이터 시작점으로 자동 감지한다.
 * 반환값이 null이면 테이블을 못 찾은 것.
 */
export function parseInspectionExcel(buffer: Buffer): ParsedInspectionRow[] | null {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: "" });

  let startRow = -1;
  let o = 0;
  for (let i = 0; i < rows.length; i++) {
    if (Number(rows[i][0]) === 1) { startRow = i; o = 0; break; }
    if (Number(rows[i][1]) === 1) { startRow = i; o = 1; break; }
  }
  if (startRow < 0) return null;

  const clean = (s: string) => s.replace(/[■□]/g, "").trim();
  const pickChecked = (cellA: unknown, cellB: unknown) => {
    const a = String(cellA ?? "");
    const b = String(cellB ?? "");
    if (a.includes("■")) return clean(a);
    if (b.includes("■")) return clean(b);
    return "";
  };

  const parsed: ParsedInspectionRow[] = [];
  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    const seq = Number(row[o]);
    if (!Number.isFinite(seq) || seq < 1) continue;

    const excelLabel = String(row[o + 1] ?? "").trim();
    const masterLabel = INSPECTION_LABEL_MAP[excelLabel];
    if (!masterLabel) continue;

    const spec = String(row[o + 5] ?? "").trim() || null;

    // Oil 항목: Type(Fomblin/Mineral)·Action(Charge/Drain) 2줄 병합 체크박스.
    // seq 있는 첫 줄 + 다음 줄(seq 없음)까지 같이 읽어서 체크(■)된 라벨만 뽑는다.
    if (masterLabel === "Oil") {
      const nextRow = rows[i + 1] ?? [];
      const oilType = pickChecked(row[o + 8], nextRow[o + 8]);
      const oilAction = pickChecked(row[o + 11], nextRow[o + 11]);
      const value = [oilType, oilAction].filter(Boolean).join(" / ");
      // Oil은 P/F 판정 대상이 아니라 Type/Action 선택 항목 — 정상 파싱되면 P(합격)로 표시
      parsed.push({ masterLabel, spec, value, pass: value !== "" ? true : null, isNA: value === "" });
      continue;
    }

    const rawValue = String(row[o + 8] ?? "").trim();
    const rawPass = String(row[o + 11] ?? "").trim().toUpperCase();
    const isDot = rawValue === "." || rawValue === "";
    const isNA = isDot && (rawPass === "." || rawPass === "");
    const pass = rawPass === "OK" || rawPass === "PASS" ? true
               : rawPass === "NG" || rawPass === "FAIL" ? false
               : null;

    parsed.push({ masterLabel, spec, value: isDot ? "" : rawValue, pass: isNA ? null : pass, isNA });
  }

  return parsed;
}
