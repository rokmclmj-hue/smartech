import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("등급 시스템 정합성 마이그레이션 시작\n");

// 1. CONSUMER 사용자 → ENDUSER
const migrated = await prisma.user.updateMany({
  where: { tier: "CONSUMER" },
  data: { tier: "ENDUSER" },
});
console.log(`사용자 ${migrated.count}명: CONSUMER → ENDUSER`);

// 2. CONSUMER PriceRule 삭제
const deleted = await prisma.priceRule.deleteMany({
  where: { tier: "CONSUMER" },
});
console.log(`PriceRule ${deleted.count}건: CONSUMER 삭제`);

// 3. 5개 등급 PriceRule upsert (최종 상태 보장)
const rules = [
  { tier: "ENDUSER", multiplier: 1.35 },
  { tier: "OEM", multiplier: 1.35 },
  { tier: "DEALER", multiplier: 1.20 },
  { tier: "KEY_DEALER", multiplier: 1.15 },
  { tier: "ADMIN", multiplier: 1.0 },
];

for (const r of rules) {
  await prisma.priceRule.upsert({
    where: { tier: r.tier },
    update: { multiplier: r.multiplier },
    create: r,
  });
  console.log(`PriceRule ${r.tier}: ${r.multiplier} 배 (upsert)`);
}

// 4. 결과 확인
const finalRules = await prisma.priceRule.findMany({ orderBy: { tier: "asc" } });
console.log("\n현재 PriceRule 전체:");
finalRules.forEach((r) => console.log(`  - ${r.tier}: ${r.multiplier}`));

const consumerCount = await prisma.user.count({ where: { tier: "CONSUMER" } });
console.log(`\n남은 CONSUMER 사용자: ${consumerCount}명 (0이어야 정상)`);

await prisma.$disconnect();
console.log("\n마이그레이션 완료");
