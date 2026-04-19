import { prisma } from "./db";

export type Tier = "PENDING" | "CONSUMER" | "OEM" | "DEALER" | "ADMIN";

const DEFAULT_MULTIPLIERS: Record<string, number> = {
  CONSUMER: 1.5,
  OEM: 1.35,
  DEALER: 1.2,
  ADMIN: 1.0,
};

let cachedRules: Record<string, number> | null = null;
let cacheTime = 0;

export async function getMultiplier(tier: string): Promise<number> {
  if (!cachedRules || Date.now() - cacheTime > 60_000) {
    const rules = await prisma.priceRule.findMany();
    cachedRules = Object.fromEntries(rules.map((r) => [r.tier, r.multiplier]));
    cacheTime = Date.now();
  }
  return cachedRules[tier] ?? DEFAULT_MULTIPLIERS[tier] ?? 1.5;
}

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}
