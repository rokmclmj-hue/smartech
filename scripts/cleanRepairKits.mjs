import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const r = await p.repairKit.deleteMany({});
console.log("삭제:", r.count);
await p.$disconnect();
