import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
const { hash } = bcrypt;
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SHEET_TO_TIER = {
  "딜러": "DEALER",
  "OEM": "OEM",
  "엔드유저": "ENDUSER",
};

function normalizePhone(input) {
  if (!input) return "";
  let digits = String(input).replace(/\D/g, "");
  if (digits.startsWith("82")) digits = "0" + digits.slice(2);
  return digits;
}

const file = path.resolve("스마텍_업체분류_20260502.xlsx");
const buf = fs.readFileSync(file);
const wb = XLSX.read(buf, { type: "buffer" });

// ── 1. 엑셀 → 객체 배열 ─────────────────────────────────────
const all = [];
for (const sheetName of wb.SheetNames) {
  const tier = SHEET_TO_TIER[sheetName];
  if (!tier) continue;
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false });
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const company = (r["회사명"] ?? "").toString().trim();
    if (!company) continue;
    all.push({
      sheet: sheetName,
      row: i + 2,
      tier,
      company,
      name: (r["담당자"] ?? "").toString().trim() || null,
      position: (r["직책"] ?? "").toString().trim() || null,
      phone: normalizePhone(r["핸드폰"]),
      email: (r["이메일"] ?? "").toString().trim().toLowerCase() || null,
      memo: (r["비고"] ?? "").toString().trim() || null,
    });
  }
}

console.log(`📋 엑셀에서 ${all.length}명 읽음`);

// ── 2. 파일 내 핸드폰 중복: 첫 번째만 유지, 나머지는 phone=null ──
const phoneSeen = new Set();
for (const r of all) {
  if (!r.phone) continue;
  if (phoneSeen.has(r.phone)) {
    console.log(`  ↳ 핸드폰 중복으로 비움: ${r.sheet}#${r.row} ${r.company}/${r.name}`);
    r.phone = "";
  } else {
    phoneSeen.add(r.phone);
  }
}

// ── 3. DB에 이미 있는 이메일/핸드폰 조회 → 충돌 시 건너뜀 ──
const fileEmails = [...new Set(all.map(r => r.email).filter(Boolean))];
const filePhones = [...new Set(all.map(r => r.phone).filter(Boolean))];

const dbEmailHits = new Set(
  (await prisma.user.findMany({
    where: { email: { in: fileEmails } },
    select: { email: true },
  })).map(u => u.email)
);
const dbPhoneHits = new Set(
  (await prisma.user.findMany({
    where: { phone: { in: filePhones } },
    select: { phone: true },
  })).map(u => u.phone)
);

// ── 4. 등록 (한 명씩, 충돌 보고) ─────────────────────────────
let inserted = 0;
let skipped = 0;
const skippedRows = [];

for (const r of all) {
  if (r.email && dbEmailHits.has(r.email)) {
    skipped++;
    skippedRows.push(`${r.sheet}#${r.row} ${r.company}/${r.name} — 이메일 충돌(${r.email})`);
    continue;
  }
  if (r.phone && dbPhoneHits.has(r.phone)) {
    skipped++;
    skippedRows.push(`${r.sheet}#${r.row} ${r.company}/${r.name} — 핸드폰 충돌(${r.phone})`);
    continue;
  }

  const randomPassword = crypto.randomBytes(16).toString("hex");
  const passwordHash = await hash(randomPassword, 12);

  await prisma.user.create({
    data: {
      email: r.email,
      name: r.name || r.company,
      company: r.company,
      passwordHash,
      tier: r.tier,
      phone: r.phone || null,
    },
  });
  inserted++;
}

console.log(`\n✅ 등록 완료: ${inserted}명`);
if (skipped > 0) {
  console.log(`⏭️  건너뜀: ${skipped}명`);
  for (const s of skippedRows) console.log(`   - ${s}`);
}

// ── 5. 등급별 집계 (확인용) ─────────────────────────────────
const counts = await prisma.user.groupBy({
  by: ["tier"],
  _count: { _all: true },
});
console.log("\n📊 현재 DB 등급별 인원:");
for (const c of counts) console.log(`   ${c.tier}: ${c._count._all}명`);

await prisma.$disconnect();
