import * as XLSX from "xlsx";
import { readFileSync } from "node:fs";

const path = ".next/dev/types/참고자료/스마텍_업체분류_20260502.xlsx";
const buf = readFileSync(path);
const wb = XLSX.read(buf, { type: "buffer" });

console.log("─────────────────────────────────────────────");
console.log("📂 파일:", path);
console.log("📑 시트 개수:", wb.SheetNames.length);
console.log("📑 시트 목록:", wb.SheetNames);
console.log("─────────────────────────────────────────────\n");

for (const sheetName of wb.SheetNames) {
  const sheet = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const rows = json.length;
  const headers = (json[0] ?? []);
  const sampleSecondRow = (json[1] ?? []);

  console.log(`■ 시트명: "${sheetName}"`);
  console.log(`  - 총 행 수 (헤더 포함): ${rows}`);
  console.log(`  - 데이터 행 수: ${Math.max(0, rows - 1)}`);
  console.log(`  - 컬럼 수: ${headers.length}`);
  console.log(`  - 컬럼 헤더:`);
  headers.forEach((h, i) => {
    const sample = sampleSecondRow[i];
    const sampleType = sample === "" ? "(빈값)" :
      typeof sample === "number" ? "숫자" :
      typeof sample === "string" ? `텍스트(예시 글자수 ${String(sample).length})` :
      typeof sample;
    console.log(`     ${String(i + 1).padStart(2, " ")}. "${h}"  →  타입 추정: ${sampleType}`);
  });
  console.log("");
}

console.log("─────────────────────────────────────────────");
console.log("✅ 구조 분석 완료 (데이터 본문은 표시 안 함)");
console.log("─────────────────────────────────────────────");
