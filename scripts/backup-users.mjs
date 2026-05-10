import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const users = await prisma.user.findMany();
const ts = new Date().toISOString().replace(/[:.]/g, "-");
const out = path.resolve(`backup-users-${ts}.json`);
fs.writeFileSync(out, JSON.stringify(users, null, 2), "utf8");

console.log(`✅ ${users.length}명 백업 완료 → ${out}`);

await prisma.$disconnect();
