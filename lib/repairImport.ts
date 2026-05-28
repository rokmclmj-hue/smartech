/**
 * 수리 교체파트 엑셀 → DB 임포트
 * 원가 기준: 기본수리 × 1.4 / 추가항목 × 1.2 는 프론트에서 계산
 */
import * as XLSX from "xlsx";
import { prisma } from "@/lib/db";

type ParsedExtra = { category: string; name: string; price: number };
type ParsedSheet = {
  modelName: string;
  pumpFamily: string;
  basePrice: number;       // 원가
  parts: string[];         // 기본수리 포함 파트 목록
  extras: ParsedExtra[];   // 추가 선택 항목
};

function getPumpFamily(model: string): string {
  const m = model.toLowerCase().replace(/\s/g, "");
  if (m.startsWith("nxds") || m.startsWith("xds")) return "scroll";
  if (m.startsWith("rv") || m.startsWith("e2m") || m.startsWith("duo") || m.startsWith("w2v")) return "rotary_vane";
  if (m.startsWith("eh")) return "booster";
  if (m.startsWith("ih") || m.startsWith("iqi")) return "dry";
  return "other";
}

function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[,\s]/g, "").replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function isNumericString(s: string): boolean {
  return /^[\d,\s.]+$/.test(s.trim()) && s.trim().length > 0;
}

export function parseRepairExcel(buffer: Buffer): ParsedSheet[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const results: ParsedSheet[] = [];

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    const rows: string[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: "",
      raw: false,
    }) as string[][];

    // row index 2 (0-based) = 3행: header row
    if (rows.length < 4) continue;

    // 모델명: row[2][1]
    const modelName = (rows[2]?.[1] ?? "").trim();
    if (!modelName || modelName === "수리비용") continue;

    const pumpFamily = getPumpFamily(modelName);
    let basePrice = 0;
    const parts: string[] = [];
    const extras: ParsedExtra[] = [];
    let currentCategory = "";

    // row[3] 부터 데이터
    for (let i = 3; i < rows.length; i++) {
      const col1 = (rows[i]?.[0] ?? "").trim();
      const col2 = (rows[i]?.[1] ?? "").trim();
      const col3 = (rows[i]?.[2] ?? "").trim();

      // 카테고리 갱신
      if (col1) currentCategory = col1;

      // 마지막 합계 행 스킵: col1이 기본수리 계열이고 col2가 숫자인 경우
      if (col1 && isNumericString(col2)) continue;
      // col1/col2 모두 비어있으면 스킵
      if (!col1 && !col2) continue;

      if (currentCategory.includes("기본수리")) {
        // 첫 번째 행: 키트 가격
        if (col3 && parsePrice(col3) > 0 && basePrice === 0) {
          basePrice = parsePrice(col3);
        }
        // 파트명 수집 (숫자 아닌 경우만)
        if (col2 && !isNumericString(col2)) {
          parts.push(col2);
        }
      } else if (currentCategory) {
        // 추가 항목: category + name + price
        if (col2 && col3 && parsePrice(col3) > 0) {
          extras.push({
            category: currentCategory,
            name: col2,
            price: parsePrice(col3),
          });
        } else if (col2 && parsePrice(col2) === 0 && !isNumericString(col2)) {
          // price 없어도 이름은 있으면 추가 (가격 나중에 확인)
          extras.push({ category: currentCategory, name: col2, price: 0 });
        }
      }
    }

    if (modelName && basePrice >= 0) {
      results.push({ modelName, pumpFamily, basePrice, parts, extras });
    }
  }

  return results;
}

export async function importRepairPartsToDb(
  sheets: ParsedSheet[],
  options: { upsert?: boolean } = {}
): Promise<{ created: number; updated: number; skipped: number }> {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const sheet of sheets) {
    const { modelName, pumpFamily, basePrice, parts, extras } = sheet;

    if (!modelName) { skipped++; continue; }

    const existing = await prisma.repairKit.findFirst({
      where: { pumpModel: modelName },
    });

    if (existing && !options.upsert) {
      // upsert 모드가 아니면 기존 데이터 갱신
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
            create: extras.map((e) => ({
              category: e.category,
              name: e.name,
              price: e.price,
            })),
          },
        },
      });
      updated++;
    } else if (!existing) {
      await prisma.repairKit.create({
        data: {
          pumpFamily,
          pumpMaker: "EDWARDS",
          pumpModel: modelName,
          basePrice,
          tier2Price: 0,
          tier3Price: 0,
          isActive: true,
          parts: {
            create: parts.map((name, idx) => ({ name, sortOrder: idx })),
          },
          extraParts: {
            create: extras.map((e) => ({
              category: e.category,
              name: e.name,
              price: e.price,
            })),
          },
        },
      });
      created++;
    } else {
      skipped++;
    }
  }

  return { created, updated, skipped };
}
