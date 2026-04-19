import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import path from "path";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORY_MAP: Record<number, string> = {
  1: "오일펌프(소형 RV)",
  2: "오일펌프(소형 E2M)",
  3: "오일펌프(중대형 E2M)",
  4: "오일펌프(중대형 E2S)",
  5: "오일펌프(nES)",
  6: "스크롤펌프(소형 nXDS)",
  7: "스크롤펌프(중형 XDS)",
  8: "부스터펌프(EH)",
  9: "산업용드라이펌프(GXS)",
  10: "산업용드라이펌프(EXS)",
  11: "반도체드라이펌프(iXH)",
  12: "반도체드라이펌프(nXRi)",
  13: "반도체드라이펌프(iXL)",
  14: "헬륨리크디텍터(ELD500)",
  15: "터보펌프(nEXT)",
  16: "터보펌프(nEXT Station)",
  17: "터보펌프(STP)",
  18: "저진공게이지(APG200)",
  19: "고진공게이지(AIM200)",
  20: "복합진공게이지(WRG200)",
  21: "디스플레이게이지(P4/P5)",
  22: "컨트롤러(TIC)",
  23: "컨트롤러(ADC)",
  24: "미스트필터(EMF)",
  25: "진공펌프오일(Ultra19)",
  26: "피팅/액세서리",
};

const PDF_MAP: Record<number, string> = {
  1: "1.오일펌프_소형RV.pdf",
  2: "1-1.오일펌프_소형E2M.pdf",
  3: "2.오일펌프_중대형E2M.pdf",
  4: "2-1오일펌프 중대형E2S.pdf",
  5: "3.오일펌프_nES.pdf",
  6: "4.스크롤펌프_소형nXDS.pdf",
  7: "5.스크롤펌프_중형XDS.pdf",
  8: "6.부스터펌프EH.pdf",
  9: "7.산업용드라이펌프_GXS Dry.pdf",
  10: "7-1.산업용드라이_EXS.pdf",
  11: "8.반도체드라이_iXH.pdf",
  12: "8-1.반도체드라이_nXRi.pdf",
  13: "9.반도체드라이_iXL.pdf",
  14: "9-1.헬륨리크디텍터_ELD500.pdf",
  15: "10.nEXT 터보펌프.pdf",
  16: "11.터보펌프_nEXT_Pumping_Station.pdf",
  17: "12.터보펌프_STP.pdf",
  18: "13.저진공게이지_APG200.pdf",
  19: "14.고진공게이지AIM200.pdf",
  20: "15.저진공+고진공게이지_WRG200.pdf",
  21: "16.디스플레이진공게이지_P4-P5.pdf",
  22: "17.컨트롤러_TIC.pdf",
  23: "18.컨트롤러_ADC.pdf",
  24: "19.미스트필터(EMF).pdf",
  25: "20.진공펌프오일_Ultra19.pdf",
  26: "21.피팅_52~57페이지사용.PDF",
};

function inferCategory(partNo: string, description: string): { category: string; pdfFile: string } {
  const desc = description.toLowerCase();
  const part = partNo.toLowerCase();

  if (desc.includes("rv") || part.includes("rv")) return { category: CATEGORY_MAP[1], pdfFile: PDF_MAP[1] };
  if (desc.includes("e2m") && (desc.includes("small") || desc.includes("1.5") || desc.includes("2") || desc.includes("5"))) return { category: CATEGORY_MAP[2], pdfFile: PDF_MAP[2] };
  if (desc.includes("e2m")) return { category: CATEGORY_MAP[3], pdfFile: PDF_MAP[3] };
  if (desc.includes("e2s")) return { category: CATEGORY_MAP[4], pdfFile: PDF_MAP[4] };
  if (desc.includes("nes") || desc.includes("nES")) return { category: CATEGORY_MAP[5], pdfFile: PDF_MAP[5] };
  if (desc.includes("nxds") || desc.includes("nXDS")) return { category: CATEGORY_MAP[6], pdfFile: PDF_MAP[6] };
  if (desc.includes("xds") || desc.includes("XDS")) return { category: CATEGORY_MAP[7], pdfFile: PDF_MAP[7] };
  if (desc.includes(" eh") || part.includes("eh")) return { category: CATEGORY_MAP[8], pdfFile: PDF_MAP[8] };
  if (desc.includes("gxs")) return { category: CATEGORY_MAP[9], pdfFile: PDF_MAP[9] };
  if (desc.includes("exs")) return { category: CATEGORY_MAP[10], pdfFile: PDF_MAP[10] };
  if (desc.includes("ixh") || desc.includes("iXH")) return { category: CATEGORY_MAP[11], pdfFile: PDF_MAP[11] };
  if (desc.includes("nxri") || desc.includes("nXRi")) return { category: CATEGORY_MAP[12], pdfFile: PDF_MAP[12] };
  if (desc.includes("ixl") || desc.includes("iXL")) return { category: CATEGORY_MAP[13], pdfFile: PDF_MAP[13] };
  if (desc.includes("eld") || desc.includes("leak")) return { category: CATEGORY_MAP[14], pdfFile: PDF_MAP[14] };
  if (desc.includes("next") || desc.includes("nEXT")) return { category: CATEGORY_MAP[15], pdfFile: PDF_MAP[15] };
  if (desc.includes("stp")) return { category: CATEGORY_MAP[17], pdfFile: PDF_MAP[17] };
  if (desc.includes("apg")) return { category: CATEGORY_MAP[18], pdfFile: PDF_MAP[18] };
  if (desc.includes("aim")) return { category: CATEGORY_MAP[19], pdfFile: PDF_MAP[19] };
  if (desc.includes("wrg")) return { category: CATEGORY_MAP[20], pdfFile: PDF_MAP[20] };
  if (desc.includes("tic")) return { category: CATEGORY_MAP[22], pdfFile: PDF_MAP[22] };
  if (desc.includes("adc")) return { category: CATEGORY_MAP[23], pdfFile: PDF_MAP[23] };
  if (desc.includes("emf") || desc.includes("mist")) return { category: CATEGORY_MAP[24], pdfFile: PDF_MAP[24] };
  if (desc.includes("ultra") || desc.includes("oil")) return { category: CATEGORY_MAP[25], pdfFile: PDF_MAP[25] };
  if (desc.includes("fitting") || desc.includes("elbow") || desc.includes("clamp")) return { category: CATEGORY_MAP[26], pdfFile: PDF_MAP[26] };

  return { category: "기타", pdfFile: "" };
}

async function main() {
  const excelPath = path.resolve(
    __dirname,
    "../../제품아이템번호 및 단가/원본_2026_Price_IV_SV_VTS_통합.xlsx"
  );

  console.log("📂 Excel 파일 읽는 중...");
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  console.log(`📊 총 ${rows.length}행 발견`);

  // Row 2 is header (index 1), data starts at row 3 (index 2)
  const dataRows = rows.slice(2);

  let imported = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const importance = String(row[0] ?? "").trim();
    const partNo = String(row[2] ?? "").trim();
    const description = String(row[3] ?? "").trim();
    const priceRaw = row[4];

    if (!partNo || !description) {
      skipped++;
      continue;
    }

    const costPrice = typeof priceRaw === "number" ? priceRaw : parseFloat(String(priceRaw).replace(/,/g, "")) || 0;
    const isImportant = importance === "1";
    const { category, pdfFile } = inferCategory(partNo, description);

    await prisma.product.upsert({
      where: { partNo },
      update: { description, costPrice, isImportant, category, pdfFile },
      create: { partNo, description, costPrice, isImportant, category, pdfFile },
    });
    imported++;
  }

  console.log(`✅ 임포트 완료: ${imported}개 제품, ${skipped}개 건너뜀`);

  // Seed default price rules
  const rules = [
    { tier: "CONSUMER", multiplier: 1.5 },
    { tier: "OEM", multiplier: 1.35 },
    { tier: "DEALER", multiplier: 1.2 },
    { tier: "ADMIN", multiplier: 1.0 },
  ];

  for (const rule of rules) {
    await prisma.priceRule.upsert({
      where: { tier: rule.tier },
      update: { multiplier: rule.multiplier },
      create: rule,
    });
  }
  console.log("✅ 가격 배율 설정 완료");

  // Create admin user if not exists
  const adminEmail = "admin@smartech.co.kr";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await hash("smartech2026!", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "관리자",
        company: "스마텍",
        passwordHash,
        tier: "ADMIN",
      },
    });
    console.log(`✅ 관리자 계정 생성: ${adminEmail} / smartech2026!`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
