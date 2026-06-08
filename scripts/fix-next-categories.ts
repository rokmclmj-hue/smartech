/**
 * nEXT 카테고리에 잘못 분류된 비터보 제품들을 "기타"로 이동
 * 실행: npx tsx scripts/fix-next-categories.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MISPLACED_PART_NOS = [
  "YT79U1Z50", // P079 IDT-001 W/10M CABLE
  "A70501713", // Stator LV DP250/400
  "A70501714", // Stator Ms DP250 GV250
  "A70601714", // Stator Ms DP300/400 GV400/600
  "A70601715", // Stator HV 50Hz DP400 GV400/600
];

async function main() {
  const result = await prisma.product.updateMany({
    where: { partNo: { in: MISPLACED_PART_NOS } },
    data: { category: "기타" },
  });
  console.log(`✅ ${result.count}개 제품 카테고리 → "기타" 변경 완료`);

  const updated = await prisma.product.findMany({
    where: { partNo: { in: MISPLACED_PART_NOS } },
    select: { partNo: true, description: true, category: true },
  });
  updated.forEach((p) =>
    console.log(`  ${p.partNo} | ${p.description} | ${p.category}`)
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
