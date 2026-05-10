import * as XLSX from "xlsx";
import { readFileSync } from "node:fs";

const path = ".next/dev/types/참고자료/스마텍_업체분류_20260502.xlsx";
const buf = readFileSync(path);
const wb = XLSX.read(buf, { type: "buffer" });

// 시트명 → 챗봇용 카테고리 코드
const MAP = {
  "딜러": "DEALER",
  "OEM": "OEM",
  "엔드유저": "ENDUSER",
};

const out = {};

for (const sheetName of wb.SheetNames) {
  const code = MAP[sheetName];
  if (!code) continue;
  const sheet = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  // 헤더 1행 스킵, 회사명 컬럼(0번)만 추출, 빈 값/중복 제거
  const seen = new Set();
  const names = [];
  for (let i = 1; i < json.length; i++) {
    const v = String(json[i][0] ?? "").trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(v);
  }
  out[code] = names;
}

console.log("===== 결과 =====");
for (const [code, list] of Object.entries(out)) {
  console.log(`\n■ ${code} (${list.length}개)`);
  list.forEach((n, i) => console.log(`  ${i + 1}. ${n}`));
}

console.log("\n===== 통계 =====");
console.log("총 회사 수:", Object.values(out).reduce((s, a) => s + a.length, 0));
console.log("DEALER:", out.DEALER?.length ?? 0);
console.log("OEM:", out.OEM?.length ?? 0);
console.log("ENDUSER:", out.ENDUSER?.length ?? 0);
