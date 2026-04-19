import * as XLSX from "xlsx";
import path from "path";

const excelPath = path.resolve(
  __dirname,
  "../제품아이템번호 및 단가/원본_2026_Price_IV_SV_VTS_통합.xlsx"
);

const wb = XLSX.readFile(excelPath);
console.log("Sheets:", wb.SheetNames);

const sheet = wb.Sheets[wb.SheetNames[0]];
const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

console.log(`\n=== First 5 rows ===`);
for (let i = 0; i < Math.min(5, rows.length); i++) {
  console.log(`Row ${i}:`, rows[i].slice(0, 8));
}
console.log(`\n=== Row 2 (sample data?) ===`);
console.log(rows[2]);
console.log(`\n=== Row 10 ===`);
console.log(rows[10]);
console.log(`\n=== Row 100 ===`);
console.log(rows[100]);
