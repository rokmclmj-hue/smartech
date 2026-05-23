const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.knownCompany.count();
  const byTier = await prisma.knownCompany.groupBy({ by: ["tier"], _count: true });
  console.log("=== KnownCompany (분류 기준 데이터) ===");
  console.log("총계:", total, "개 — 안전하게 유지됨");
  byTier.forEach((r) => console.log(" -", r.tier, ":", r._count, "개"));

  const users = await prisma.user.findMany({ select: { id: true, name: true, tier: true } });
  console.log("\n=== User (로그인 계정) ===");
  console.log("남은 수:", users.length);
  users.forEach((u) => console.log(" - [" + u.tier + "]", u.name));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
