import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SHEET_TO_TIER = {
  "딜러": "DEALER",
  "OEM": "OEM",
  "엔드유저": "ENDUSER",
};

const file = path.resolve("스마텍_업체분류_20260502.xlsx");
const buf = fs.readFileSync(file);
const wb = XLSX.read(buf, { type: "buffer" });

function normalizePhone(p) {
  if (!p) return null;
  return String(p).replace(/[^0-9]/g, "");
}

const all = [];
for (const sheetName of wb.SheetNames) {
  const tier = SHEET_TO_TIER[sheetName];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false });
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    all.push({
      sheet: sheetName,
      row: i + 2, // header is row 1
      tier,
      company: (r["회사명"] ?? "").toString().trim() || null,
      name: (r["담당자"] ?? "").toString().trim() || null,
      position: (r["직책"] ?? "").toString().trim() || null,
      phone: (r["핸드폰"] ?? "").toString().trim() || null,
      email: (r["이메일"] ?? "").toString().trim().toLowerCase() || null,
      memo: (r["비고"] ?? "").toString().trim() || null,
    });
  }
}

console.log("== TOTALS ==");
const byTier = {};
for (const r of all) byTier[r.tier] = (byTier[r.tier] ?? 0) + 1;
console.log(byTier, "TOTAL:", all.length);

// 빈 필드
console.log("\n== MISSING FIELDS ==");
const missingCompany = all.filter(r => !r.company);
const missingName = all.filter(r => !r.name);
const missingPhone = all.filter(r => !r.phone);
const missingEmail = all.filter(r => !r.email);
console.log("회사명 빈 값:", missingCompany.length, missingCompany.map(r => `${r.sheet}#${r.row}`));
console.log("담당자 빈 값:", missingName.length, missingName.map(r => `${r.sheet}#${r.row}`));
console.log("핸드폰 빈 값:", missingPhone.length, missingPhone.map(r => `${r.sheet}#${r.row}`));
console.log("이메일 빈 값:", missingEmail.length, missingEmail.map(r => `${r.sheet}#${r.row}`));

// 파일 내 중복 (이메일)
console.log("\n== DUPLICATES IN FILE ==");
const emailMap = new Map();
for (const r of all) {
  if (!r.email) continue;
  if (!emailMap.has(r.email)) emailMap.set(r.email, []);
  emailMap.get(r.email).push(r);
}
const dupEmails = [...emailMap.entries()].filter(([_, v]) => v.length > 1);
console.log("이메일 중복:", dupEmails.length);
for (const [email, rows] of dupEmails) {
  console.log(`  ${email}:`, rows.map(r => `${r.sheet}#${r.row}(${r.company}/${r.name})`));
}

const phoneMap = new Map();
for (const r of all) {
  const p = normalizePhone(r.phone);
  if (!p) continue;
  if (!phoneMap.has(p)) phoneMap.set(p, []);
  phoneMap.get(p).push(r);
}
const dupPhones = [...phoneMap.entries()].filter(([_, v]) => v.length > 1);
console.log("핸드폰 중복:", dupPhones.length);
for (const [phone, rows] of dupPhones) {
  console.log(`  ${phone}:`, rows.map(r => `${r.sheet}#${r.row}(${r.company}/${r.name})`));
}

// DB 충돌
console.log("\n== DB CONFLICTS ==");
const fileEmails = [...emailMap.keys()];
const filePhones = [...phoneMap.keys()];

const dbEmailHits = await prisma.user.findMany({
  where: { email: { in: fileEmails } },
  select: { id: true, email: true, name: true, company: true, tier: true },
});
console.log("DB에 이미 있는 이메일:", dbEmailHits.length);
for (const u of dbEmailHits) console.log(`  ${u.email} → ${u.company}/${u.name} (${u.tier})`);

const dbPhoneHits = await prisma.user.findMany({
  where: { phone: { in: filePhones } },
  select: { id: true, phone: true, name: true, company: true, tier: true },
});
console.log("DB에 이미 있는 핸드폰:", dbPhoneHits.length);
for (const u of dbPhoneHits) console.log(`  ${u.phone} → ${u.company}/${u.name} (${u.tier})`);

// 직책/비고 사용 통계
console.log("\n== EXTRA FIELDS USAGE ==");
console.log("직책 채워진 행:", all.filter(r => r.position).length, "/", all.length);
console.log("비고 채워진 행:", all.filter(r => r.memo).length, "/", all.length);
const memos = all.filter(r => r.memo);
if (memos.length > 0) {
  console.log("비고 샘플:");
  for (const r of memos.slice(0, 5)) console.log(`  ${r.sheet}#${r.row} (${r.company}): ${r.memo}`);
}

await prisma.$disconnect();
