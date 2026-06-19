import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const r = await prisma.priceRule.upsert({
  where: { tier: "OEM" },
  update: { multiplier: 1.30 },
  create: { tier: "OEM", multiplier: 1.30 },
});
console.log("OK:", JSON.stringify(r));
await prisma.$disconnect();
