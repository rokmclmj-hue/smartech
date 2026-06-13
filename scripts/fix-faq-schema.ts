import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

// [folder, sourceFile] — sourceFile은 DB에 저장된 실제 값
const ENTRIES: [string, string][] = [
  ["ELD500W-리크디텍터-20260601",          "ELD500W-리크디텍터"],
  ["RV-오일로터리펌프-유지관리-20260606",    "2026-06/RV-오일로터리펌프-유지관리-20260606"],
  ["가스-발라스트-20260603",                "가스 발라스트"],
  ["수소-에너지-드라이펌프-20260610",        "수소-에너지-드라이펌프-20260610"],
  ["이차전지-PFPE-오일-선택법-20260606",     "2026-06/이차전지-PFPE-오일-선택법-20260606"],
  ["진공게이지-종류-20260605",              "진공게이지 종류"],
  ["진공펌프-루츠부스터-조합-20260606",      "진공펌프-루츠부스터-조합"],
  ["진공펌프-수리-시-주의사항-20260601",     "진공펌프 수리 시 주의사항"],
];

async function main() {
  const base = join(process.cwd(), "블로그/output/2026-06");
  let updated = 0;

  for (const [folder, sourceFile] of ENTRIES) {
    const faqPath = join(base, folder, "faq.json");
    if (!existsSync(faqPath)) {
      console.log(`⏭️  faq.json 없음: ${folder}`);
      continue;
    }

    const faqSchema = readFileSync(faqPath, "utf8").trim();
    const result = await prisma.blogPost.updateMany({
      where: { sourceFile, faqSchema: "" },
      data: { faqSchema },
    });

    if (result.count > 0) {
      console.log(`✅ ${folder} (${result.count}개 업데이트)`);
      updated += result.count;
    } else {
      console.log(`⏭️  ${folder} — 이미 적용됨`);
    }
  }

  console.log(`\n완료: 총 ${updated}개 업데이트`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
