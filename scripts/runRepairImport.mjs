// 수리 교체파트 엑셀 → DB 임포트 스크립트
// 실행: node scripts/runRepairImport.mjs
import XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EXCEL_PATH = "C:/Users/rokmc/Desktop/스마텍수리자동화/더베큠전달/수리교체파트_최종.xlsx";
const BASE_MARGIN  = 1.4;
const EXTRA_MARGIN = 1.2;

function getPumpFamily(model) {
  const m = model.toLowerCase().replace(/\s/g, "");
  if (m.startsWith("nxds") || m.startsWith("xds")) return "scroll";
  if (m.startsWith("rv") || m.startsWith("e2m") || m.startsWith("duo") || m.startsWith("w2v")) return "rotary_vane";
  if (m.startsWith("eh")) return "booster";
  if (m.startsWith("ih") || m.startsWith("iqi")) return "dry";
  return "other";
}

function parsePrice(raw) {
  const cleaned = String(raw).replace(/[,\s]/g, "").replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function isNumericString(s) {
  return /^[\d,\s.]+$/.test(String(s).trim()) && String(s).trim().length > 0;
}

function parseSheet(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  // skipHidden: false, 빈 행 포함 안 됨 → 헤더 행을 동적으로 탐색
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });

  if (rows.length < 2) return null;

  // 헤더 행 탐색: col[2] === "수리비용" 인 행
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    if (String(rows[i]?.[2] ?? "").trim() === "수리비용") { headerIdx = i; break; }
  }
  if (headerIdx < 0) return null;

  // 모델명: 헤더 행의 col[1]
  const modelName = String(rows[headerIdx]?.[1] ?? "").trim();
  if (!modelName || modelName === "수리비용" || modelName === "모델명" || modelName === "No") return null;

  let basePrice = 0;
  const parts = [];
  const extras = [];
  let currentCategory = "";

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const col1 = String(rows[i]?.[0] ?? "").trim();
    const col2 = String(rows[i]?.[1] ?? "").trim();
    const col3 = String(rows[i]?.[2] ?? "").trim();

    if (col1) currentCategory = col1;

    // 합계 행 스킵
    if (col1 && isNumericString(col2)) continue;
    if (!col1 && !col2) continue;

    if (currentCategory.includes("기본수리")) {
      if (col3 && parsePrice(col3) > 0 && basePrice === 0) {
        basePrice = parsePrice(col3);
      }
      if (col2 && !isNumericString(col2)) {
        parts.push(col2);
      }
    } else if (currentCategory) {
      if (col2 && !isNumericString(col2)) {
        extras.push({
          category: currentCategory,
          name: col2,
          price: parsePrice(col3),
        });
      }
    }
  }

  return { modelName, pumpFamily: getPumpFamily(modelName), basePrice, parts, extras };
}

async function main() {
  console.log("📂 엑셀 파일 읽는 중...");
  const wb = XLSX.readFile(EXCEL_PATH);
  console.log(`📊 시트 수: ${wb.SheetNames.length}`);

  let created = 0, updated = 0, skipped = 0;

  for (const sheetName of wb.SheetNames) {
    const parsed = parseSheet(wb, sheetName);
    if (!parsed) { console.log(`  ⏭  ${sheetName} — 파싱 실패 스킵`); skipped++; continue; }

    const { modelName, pumpFamily, basePrice, parts, extras } = parsed;
    console.log(`  ✦  ${modelName} | 기본수리 원가 ${basePrice.toLocaleString()}원 | 파트 ${parts.length}종 | 추가항목 ${extras.length}종`);

    const existing = await prisma.repairKit.findFirst({ where: { pumpModel: modelName } });

    if (existing) {
      await prisma.repairKit.update({
        where: { id: existing.id },
        data: {
          pumpFamily,
          basePrice,
          parts: {
            deleteMany: {},
            create: parts.map((name, idx) => ({ name, sortOrder: idx })),
          },
          extraParts: {
            deleteMany: {},
            create: extras.map((e) => ({ category: e.category, name: e.name, price: e.price })),
          },
        },
      });
      updated++;
    } else {
      await prisma.repairKit.create({
        data: {
          pumpFamily,
          pumpMaker: "EDWARDS",
          pumpModel: modelName,
          basePrice,
          tier2Price: 0,
          tier3Price: 0,
          isActive: true,
          parts: { create: parts.map((name, idx) => ({ name, sortOrder: idx })) },
          extraParts: { create: extras.map((e) => ({ category: e.category, name: e.name, price: e.price })) },
        },
      });
      created++;
    }
  }

  console.log(`\n✅ 완료 — 신규: ${created} / 업데이트: ${updated} / 스킵: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
