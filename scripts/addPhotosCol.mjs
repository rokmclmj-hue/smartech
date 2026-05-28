import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
// photos 컬럼 존재 확인 후 없으면 추가
try {
  await p.$executeRawUnsafe(`ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "photos" TEXT`);
  console.log("photos 컬럼 추가 완료");
} catch(e) {
  console.log("이미 있거나:", e.message);
}
await p.$disconnect();
