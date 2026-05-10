import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TARGET_USER_ID = 2;
const PHONE = "01031947170";

const updated = await prisma.user.update({
  where: { id: TARGET_USER_ID },
  data: { phone: PHONE },
  select: { id: true, email: true, name: true, tier: true, phone: true },
});

console.log("✅ 전화번호 등록 완료");
console.log(JSON.stringify(updated, null, 2));

await prisma.$disconnect();
