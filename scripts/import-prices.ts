/**
 * scripts/import-prices.ts
 *
 * 엑셀 가격표 임포트 스크립트
 * - data/원본_2026_Price_IV_SV_VTS_통합.xlsx 의 "2026" 포함 탭을 읽음
 * - 각 행: Part No (col 1) + 단가 원화 (col 3) 추출
 * - DB Product 검색: 있으면 costPrice 업데이트, 없으면 신규 생성
 *
 * 실행: npx tsx scripts/import-prices.ts
 */

import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  // 엑셀 파일 위치 — 프로젝트 루트의 data/ 폴더
  const excelPath = path.resolve(process.cwd(), "data/원본_2026_Price_IV_SV_VTS_통합.xlsx");

  console.log("엑셀 파일 읽는 중:", excelPath);

  const workbook = XLSX.readFile(excelPath);

  // "2026" 이 포함된 시트 이름을 찾음
  const sheetName = workbook.SheetNames.find((n) => n.includes("2026"));
  if (!sheetName) {
    console.error("오류: 시트 이름에 '2026'이 포함된 탭을 찾지 못했습니다.");
    console.error("현재 탭 목록:", workbook.SheetNames);
    process.exit(1);
  }

  console.log(`사용할 시트: "${sheetName}"`);

  const sheet = workbook.Sheets[sheetName];

  // header:1 → 각 행을 배열로 반환 (0-indexed)
  // Row 0 = 헤더 (재고관리, Part NO, Part Description, Price, ...)
  // Row 1~ = 실제 데이터
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  console.log(`총 ${rows.length}행 발견 (헤더 포함)`);

  const dataRows = rows.slice(1); // 헤더 행 제외

  let updated = 0;
  let created = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const partNo = String((row as unknown[])[1] ?? "").trim();
    const priceRaw = (row as unknown[])[3];

    // Part No가 없으면 스킵
    if (!partNo) {
      skipped++;
      continue;
    }

    // 단가 파싱: 숫자이면 그대로, 문자열이면 콤마 제거 후 변환
    const costPrice =
      typeof priceRaw === "number"
        ? priceRaw
        : parseFloat(String(priceRaw ?? "").replace(/,/g, "")) || 0;

    // 단가가 0 이하면 스킵 (빈 행 또는 잘못된 데이터)
    if (costPrice <= 0) {
      skipped++;
      continue;
    }

    // DB에서 Part No로 검색
    const existing = await prisma.product.findUnique({ where: { partNo } });

    if (existing) {
      // 있으면 costPrice만 업데이트
      await prisma.product.update({
        where: { partNo },
        data: { costPrice },
      });
      updated++;
    } else {
      // 없으면 신규 생성 (description=코드번호, stock=0)
      await prisma.product.create({
        data: {
          partNo,
          description: partNo, // 코드번호를 description으로 사용
          costPrice,
          stock: 0,
        },
      });
      created++;
    }
  }

  console.log("─────────────────────────────────");
  console.log(`처리 완료`);
  console.log(`  업데이트: ${updated}건`);
  console.log(`  신규 생성: ${created}건`);
  console.log(`  스킵: ${skipped}건`);
  console.log(`  합계: ${updated + created + skipped}건 (헤더 제외)`);
  console.log("─────────────────────────────────");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("임포트 실패:", e);
  prisma.$disconnect();
  process.exit(1);
});
