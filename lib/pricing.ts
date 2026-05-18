import { prisma } from "./db";

export type Tier = "PENDING" | "ENDUSER" | "OEM" | "DEALER" | "KEY_DEALER" | "ADMIN" | "PUBLIC";

// 기본 배율 (원가 × multiplier = 표시 가격)
// DEALER 20%, OEM 30%, ENDUSER·PUBLIC 40% 마진
const DEFAULT_MULTIPLIERS: Record<string, number> = {
  PUBLIC:     1.40, // 로그인 없음
  ENDUSER:    1.40, // 일반 회원
  PENDING:    1.40, // 승인 대기 (공개 가격과 동일)
  OEM:        1.30,
  DEALER:     1.20,
  KEY_DEALER: 1.15,
  ADMIN:      1.00,
};

let cachedRules: Record<string, number> | null = null;
let cacheTime = 0;

export async function getMultiplier(tier: string): Promise<number> {
  if (!cachedRules || Date.now() - cacheTime > 60_000) {
    const rules = await prisma.priceRule.findMany();
    cachedRules = Object.fromEntries(rules.map((r: { tier: string; multiplier: number }) => [r.tier, r.multiplier]));
    cacheTime = Date.now();
  }
  return cachedRules[tier] ?? DEFAULT_MULTIPLIERS[tier] ?? 1.35;
}

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}
