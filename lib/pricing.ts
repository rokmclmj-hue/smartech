import { prisma } from "./db";

export type Tier = "PENDING" | "ENDUSER" | "OEM" | "DEALER" | "KEY_DEALER" | "VIP_DEALER" | "ADMIN" | "PUBLIC";

// 기본 배율 (원가 × multiplier = 표시 가격)
const DEFAULT_MULTIPLIERS: Record<string, number> = {
  PUBLIC:     1.40,
  ENDUSER:    1.40,
  PENDING:    1.40,
  OEM:        1.30,
  DEALER:     1.20,
  KEY_DEALER: 1.15,
  VIP_DEALER: 1.10,
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
