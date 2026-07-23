// 수리견적서 PDF 금액 계산 회귀 테스트
// 2026-07-23: 추가파트 없을 때 견적금액이 무시되고 "협의"로 나오던 버그(커밋 c769ff9) 재발 방지용.
// 실행: npx tsx scripts/test-repair-quote-amounts.mts
import mod from "../lib/repairQuoteAmounts";
const { computeRepairQuoteAmounts } = mod as unknown as typeof import("../lib/repairQuoteAmounts");

type Case = {
  name: string;
  repairCost: number | null;
  items: { name: string; quantity: number; unitPrice: number }[];
  expectSupply: number | null;
};

const cases: Case[] = [
  {
    name: "추가파트 없이 견적금액만 저장 (이번 버그 케이스)",
    repairCost: 540000,
    items: [],
    expectSupply: 540000,
  },
  {
    name: "추가파트 있고 견적금액도 직접 지정 (직접 지정값 우선)",
    repairCost: 600000,
    items: [{ name: "Blade", quantity: 1, unitPrice: 144000 }],
    expectSupply: 600000,
  },
  {
    name: "추가파트만 있고 견적금액 미지정 (품목 합계 사용)",
    repairCost: null,
    items: [
      { name: "Blade", quantity: 1, unitPrice: 144000 },
      { name: "Sleeve", quantity: 1, unitPrice: 108000 },
    ],
    expectSupply: 252000,
  },
  {
    name: "품목도 견적금액도 없음 (협의 상태 유지되어야 함)",
    repairCost: null,
    items: [],
    expectSupply: null,
  },
];

let failed = 0;
for (const c of cases) {
  const { supply, vat, total } = computeRepairQuoteAmounts(c.repairCost, c.items);
  const ok = supply === c.expectSupply;
  if (!ok) failed++;
  console.log(
    `${ok ? "OK  " : "FAIL"} ${c.name} → supply=${supply} (기대값 ${c.expectSupply}) vat=${vat} total=${total}`
  );
}

if (failed > 0) {
  console.error(`\n${failed}개 케이스 실패`);
  process.exit(1);
}
console.log("\n모든 케이스 통과");
