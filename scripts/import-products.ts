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
  16: "터보펌핑스테이션(T-Station)",
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
  const both = `${desc} ${part}`;

  if (/t-?station|tstation|pumping station/.test(desc)) return { category: CATEGORY_MAP[16], pdfFile: PDF_MAP[16] };
  if (/\bstp[- ]?\w*|stp\d/.test(both)) return { category: CATEGORY_MAP[17], pdfFile: PDF_MAP[17] };
  if (/\bnext\b|nexta|next\d|next turbo/.test(both)) return { category: CATEGORY_MAP[15], pdfFile: PDF_MAP[15] };

  // TIC/ADC: nEXT 모델명 다음, turbo 일반어 이전 (TIC Turbo Controller 오분류 방지)
  if (/\btic\b|tic \d|turbo.*controller|instrument controller/.test(both)) return { category: CATEGORY_MAP[22], pdfFile: PDF_MAP[22] };
  if (/\badc\b|adc \d|analog display|analogue display/.test(both)) return { category: CATEGORY_MAP[23], pdfFile: PDF_MAP[23] };

  if (/\bp0\d{2}\b|stator|rotor assy|turbo/.test(both)) return { category: CATEGORY_MAP[15], pdfFile: PDF_MAP[15] };
  if (/eld\d|leak detect|helium leak/.test(both)) return { category: CATEGORY_MAP[14], pdfFile: PDF_MAP[14] };

  // AIGX 게이지: igx 패턴보다 먼저 (AIM 계열 오분류 방지)
  if (/\baigx/.test(both)) return { category: CATEGORY_MAP[19], pdfFile: PDF_MAP[19] };

  if (/ixh\d|ixh |ixm\d|\bixm\b/.test(both)) return { category: CATEGORY_MAP[11], pdfFile: PDF_MAP[11] };
  if (/nxri|nxr\d|nxr /.test(both)) return { category: CATEGORY_MAP[12], pdfFile: PDF_MAP[12] };
  if (/ixl\d|ixl |nxl\d|nxl /.test(both)) return { category: CATEGORY_MAP[13], pdfFile: PDF_MAP[13] };
  if (/igx|ipx|ih\d|iq\d/.test(both)) return { category: CATEGORY_MAP[11], pdfFile: PDF_MAP[11] };

  // nGX는 GXS 계열
  if (/gxs|\bgx\d|\bngx/.test(both)) return { category: CATEGORY_MAP[9], pdfFile: PDF_MAP[9] };
  if (/\bexs|\beos|\beds|\bedc|\bnedc|\binedc|\bedo\d/.test(both)) return { category: CATEGORY_MAP[10], pdfFile: PDF_MAP[10] };

  // 오일/소모품은 booster 이전 (Vapour Booster Pump Fluid 오분류 방지)
  if (/ultra\s?\d|ultragrade|pfpe|fomblin|krytox|vacuum oil|apiezon|wax/.test(desc)) return { category: CATEGORY_MAP[25], pdfFile: PDF_MAP[25] };
  if (/silicone oil|lube|v lube|vapour.*fluid|diffusion.*fluid|booster.*fluid|pump fluid|\bfluid\b|grease|carbon pack|alumina|xtragrade|edwards 45|edwards 70\d/.test(desc)) return { category: CATEGORY_MAP[25], pdfFile: PDF_MAP[25] };

  if (/\beh\d|\beh\s|booster|qmb/.test(both)) return { category: CATEGORY_MAP[8], pdfFile: PDF_MAP[8] };
  if (/nxds|nxd\d/.test(both)) return { category: CATEGORY_MAP[6], pdfFile: PDF_MAP[6] };
  if (/\bxds\b|xds\d|scroll/.test(both)) return { category: CATEGORY_MAP[7], pdfFile: PDF_MAP[7] };
  if (/\bnes\b|nes\d/.test(both)) return { category: CATEGORY_MAP[5], pdfFile: PDF_MAP[5] };
  if (/e2s\d|\be2s\b/.test(both)) return { category: CATEGORY_MAP[4], pdfFile: PDF_MAP[4] };
  // 미스트필터: E2M 패턴 이전 (MF30 Fits E2M28 오분류 방지)
  if (/\bemf\d|\bemf\b|mist filter|oil mist/.test(both)) return { category: CATEGORY_MAP[24], pdfFile: PDF_MAP[24] };
  if (/e2m(0\.\d+|1[.\/]|1\.5|18|28|2\b|5\b|-1|-2|-5)/.test(both)) return { category: CATEGORY_MAP[2], pdfFile: PDF_MAP[2] };

  if (/\be2m\d|\be2m\b/.test(both)) return { category: CATEGORY_MAP[3], pdfFile: PDF_MAP[3] };
  if (/\brv\d|\brv\b/.test(both)) return { category: CATEGORY_MAP[1], pdfFile: PDF_MAP[1] };

  if (/apg\d|\bapg/.test(both)) return { category: CATEGORY_MAP[18], pdfFile: PDF_MAP[18] };
  if (/aim\d|\baim/.test(both) || /active ion gauge/.test(desc)) return { category: CATEGORY_MAP[19], pdfFile: PDF_MAP[19] };
  if (/wrg\d|\bwrg|wrh|wra/.test(both)) return { category: CATEGORY_MAP[20], pdfFile: PDF_MAP[20] };
  if (/\bp[45] gauge|p4-p5|p4\/p5|\bp[45]\b|\bp4\b|\bp5\b/.test(desc)) return { category: CATEGORY_MAP[21], pdfFile: PDF_MAP[21] };
  if (/capsule gauge|cg\d+k|pirani|penning|ion gauge|ionization gauge|tag controller|barocel|prg\d+|\bpra\d|\bpra-\d/.test(desc)) return { category: CATEGORY_MAP[20], pdfFile: PDF_MAP[20] };
  if (/\bgauge\b|vacuum.*switch|interlock switch|adjustable.*switch/.test(desc)) return { category: CATEGORY_MAP[20], pdfFile: PDF_MAP[20] };

  if (/valve|speedivalve|solenoid|pipeline valve|fitting|elbow|clamp|centering|nw\d+|kf\d+|iso\d+|dn\d+cf|tee |tee-|cross|flange|hose|gasket|o[- ]ring|o-ring\b|bellow|adapter|centring|spare tube|silencer|catchpot|trap|dust filter|chemical trap|cable|coupling|vibration pad/.test(desc)) return { category: CATEGORY_MAP[26], pdfFile: PDF_MAP[26] };
  if (/spare|service kit|overhaul kit|blade kit|rotor|stator|shaft|bearing|oil seal|sight glass|gear|cooling|fan\b|heater|heatsink|impeller|o\/s|core plug|washer|dowty|bonded seal|back shell|terminal|connector|plug|strainer|cartridge|regulator|sensor|interface|module|display|itim|mcm|sim|controller|holster|bracket|head ?plate|manifold|pump display|filter element|pair of gears|vibration|micro.?tim|\btim\b|bus.?bar|conn.?kit|hook.?up.?kit|pipe.?assy|quick.?connect|\bqc[- ]sock|\bqc[- ]skt|\bmale.?conn|nozzle.?kit|torque.?limit|after.?cool|microswitch|flow.?indicat|dowel|locking.?ring|spring|dust.?thrower|oil.?thrower|swing.?prv|gas.?ballast|oil.?filter|taper.?lock|inner.?ring|oil.?pump.?blade|banjo.?bolt|ethercat|blanking|blnkn|drain.?end|end.?cap|side.?panel|panel.*e2m|oil.?tube|tube.?assy|\bassy\b|service.*box/.test(desc)) return { category: CATEGORY_MAP[26], pdfFile: PDF_MAP[26] };

  if (/\bgv\d+/.test(both)) return { category: CATEGORY_MAP[3], pdfFile: PDF_MAP[3] };
  if (/\bem\d{2,}/.test(both)) return { category: CATEGORY_MAP[3], pdfFile: PDF_MAP[3] };
  if (/\beh\b/.test(both)) return { category: CATEGORY_MAP[8], pdfFile: PDF_MAP[8] };
  if (/calibrated leak|cl-cal|cl-int/.test(desc)) return { category: CATEGORY_MAP[14], pdfFile: PDF_MAP[14] };

  return { category: "피팅/액세서리", pdfFile: PDF_MAP[26] };
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

  // Row 0 is header; data starts at row 1
  const dataRows = rows.slice(1);

  let imported = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const importance = String(row[0] ?? "").trim();
    const partNo = String(row[1] ?? "").trim();
    const description = String(row[2] ?? "").trim();
    const priceRaw = row[3];

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
    { tier: "ENDUSER", multiplier: 1.35 },
    { tier: "OEM", multiplier: 1.35 },
    { tier: "DEALER", multiplier: 1.20 },
    { tier: "KEY_DEALER", multiplier: 1.15 },
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
