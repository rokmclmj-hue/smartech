import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true, tier: true, company: true, phone: true, createdAt: true },
});

console.log(`총 사용자 수: ${users.length}`);
console.log(JSON.stringify(users, null, 2));

await prisma.$disconnect();
