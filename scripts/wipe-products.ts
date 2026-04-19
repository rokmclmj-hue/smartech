import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.quoteItem.deleteMany({});
  const r = await prisma.product.deleteMany({});
  console.log(`deleted ${r.count} products`);
  await prisma.$disconnect();
}
main();
