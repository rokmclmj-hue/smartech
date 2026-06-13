import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ITEMS = [
  // SV 부서
  { category:"Pump", department:"SV", partNo:"A37141919", name:"E2M0.7 200-230V 50/60HZ IEC", currentStock:1, minStock:1, orderQty:1, unitPrice:1600000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A37132919", name:"E2M1.5 200-230V 50/60HZ IEC", currentStock:0, minStock:0, orderQty:1, unitPrice:1700000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A36317984", name:"E2M18 115V/200-230V 1PH 50/60Hz", currentStock:0, minStock:0, orderQty:1, unitPrice:3600000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A37333934", name:"E2M28 HC 3PH IE3 ASIA 50/60HZ", currentStock:0, minStock:0, orderQty:1, unitPrice:3800000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Filter", department:"SV", partNo:"A46220000", name:"EMF3 Oil Mist Filter NW10", currentStock:1, minStock:1, orderQty:1, unitPrice:150000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Filter", department:"SV", partNo:"A46226000", name:"EMF10 Oil Mist Filter NW25", currentStock:1, minStock:0, orderQty:1, unitPrice:190000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Filter", department:"SV", partNo:"A46229000", name:"EMF20 Oil Mist Filter NW25", currentStock:1, minStock:0, orderQty:1, unitPrice:230000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A65201903", name:"RV3 115/230V 1Ph 50/60Hz Set 230V", currentStock:1, minStock:0, orderQty:1, unitPrice:1850000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A65301903", name:"RV5 115/230V 1PH 50/60Hz Set 230V", currentStock:1, minStock:0, orderQty:1, unitPrice:1900000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A65401903", name:"RV8 115/230V 1PH 50/60Hz Set 230V", currentStock:1, minStock:0, orderQty:1, unitPrice:1950000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A65501903", name:"RV12 115/230V 1PH 50/60Hz Set 230V", currentStock:1, minStock:0, orderQty:1, unitPrice:2000000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A74401903", name:"mXDS3 230V 1ph 50/60Hz (Standard)", currentStock:1, minStock:0, orderQty:1, unitPrice:2800000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A73501809", name:"Gas Ballast Adaptor Kit nXDS", currentStock:0, minStock:0, orderQty:1, unitPrice:160000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A73501983", name:"nXDS6i 100-127/200-240V 1ph 50/60Hz", currentStock:0, minStock:0, orderQty:1, unitPrice:4330000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A73601983", name:"nXDS10i 100-127/200-240V 1ph 50/60Hz", currentStock:1, minStock:0, orderQty:1, unitPrice:4430000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A73701983", name:"nXDS15i 100-127/200-240V 1ph 50/60Hz", currentStock:1, minStock:0, orderQty:1, unitPrice:4540000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A73801983", name:"nXDS20i 100-127/200-240V 1ph 50/60Hz", currentStock:0, minStock:0, orderQty:1, unitPrice:4640000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A73602983", name:"nXDS10iC 100-127/200-240V 1ph 50/60Hz", currentStock:0, minStock:0, orderQty:1, unitPrice:4950000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A73702983", name:"nXDS15iC 100-127/200-240V 1ph 50/60Hz", currentStock:0, minStock:0, orderQty:1, unitPrice:5150000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"A73001983", name:"XDS35i 100-120/200-230V 1PH 50/60Hz", currentStock:1, minStock:0, orderQty:1, unitPrice:8600000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Gauge", department:"SV", partNo:"D1G1011100", name:"APG200-XM-NW16", currentStock:0, minStock:0, orderQty:1, unitPrice:330000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Gauge", department:"SV", partNo:"D1G1021100", name:"APG200-XM-NW25", currentStock:0, minStock:0, orderQty:1, unitPrice:340000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Gauge", department:"SV", partNo:"D1G2011100", name:"APG200-XLC-NW16", currentStock:4, minStock:0, orderQty:1, unitPrice:370000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Gauge", department:"SV", partNo:"D1G2021100", name:"APG200-XLC-NW25", currentStock:0, minStock:0, orderQty:1, unitPrice:390000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Gauge", department:"SV", partNo:"D2G0021100", name:"AIM200-X-NW25", currentStock:2, minStock:0, orderQty:1, unitPrice:750000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Gauge", department:"SV", partNo:"D2G0021150", name:"AIM200-S-NW25", currentStock:0, minStock:0, orderQty:1, unitPrice:820000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Gauge", department:"SV", partNo:"D3G0021100", name:"WRG200-X-NW25", currentStock:0, minStock:0, orderQty:1, unitPrice:950000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Controller", department:"SV", partNo:"D39591500", name:"ADC Enhanced MkII Gauge Controller", currentStock:1, minStock:0, orderQty:1, unitPrice:700000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Controller", department:"SV", partNo:"D39700000", name:"TIC Instrument Controller 3 Head RS232", currentStock:0, minStock:0, orderQty:1, unitPrice:1650000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Controller", department:"SV", partNo:"D39722000", name:"TIC Turbo & Inst Controller 200W RS232", currentStock:0, minStock:0, orderQty:1, unitPrice:2300000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Cable", department:"SV", partNo:"D40001010", name:"1M Active Gauge Cable", currentStock:1, minStock:0, orderQty:1, unitPrice:20000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Cable", department:"SV", partNo:"D40001030", name:"3M Active Gauge Cable", currentStock:1, minStock:0, orderQty:1, unitPrice:50000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Cable", department:"SV", partNo:"D40001050", name:"5M Active Gauge Cable", currentStock:1, minStock:0, orderQty:1, unitPrice:30000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Cable", department:"SV", partNo:"D40001100", name:"10M Active Gauge Cable", currentStock:1, minStock:0, orderQty:1, unitPrice:40000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Pump", department:"SV", partNo:"TS85W1001", name:"T-Station 85H Wet NW40 200-240V", currentStock:0, minStock:0, orderQty:1, unitPrice:8000000, leadTime:"4주", supplier:"에드워드코리아" },
  // AK 부서
  { category:"Oil", department:"AK", partNo:"H11301019", name:"FOMBLIN Y VAC 06/6 1KG", currentStock:0, minStock:0, orderQty:1, unitPrice:281000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Oil", department:"AK", partNo:"H11022015", name:"Edwards 45 Fluid - 1L", currentStock:0, minStock:0, orderQty:1, unitPrice:135000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Oil", department:"AK", partNo:"H11032015", name:"Ultragrade EXTEND 110 - 5LT", currentStock:0, minStock:0, orderQty:1, unitPrice:193000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Oil", department:"AK", partNo:"H11032012", name:"Ultragrade Extend 110 - 4L", currentStock:0, minStock:0, orderQty:1, unitPrice:172000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Oil", department:"AK", partNo:"H11028016", name:"Ultragrade PERFORMANCE 70 - 5LT", currentStock:0, minStock:0, orderQty:1, unitPrice:120000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Oil", department:"AK", partNo:"H11026015", name:"Ultragrade Performance 15 - 1L", currentStock:0, minStock:0, orderQty:1, unitPrice:35000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Oil", department:"AK", partNo:"H11026013", name:"Ultragrade Performance 15 - 4L", currentStock:0, minStock:0, orderQty:1, unitPrice:119000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Oil", department:"AK", partNo:"H11025015", name:"Ultragrade Performance 19 - 1L", currentStock:1, minStock:0, orderQty:1, unitPrice:35000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Oil", department:"AK", partNo:"H11025013", name:"Ultragrade Performance 19 - 4L", currentStock:1, minStock:0, orderQty:1, unitPrice:119000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Oil", department:"AK", partNo:"H11024013", name:"Ultragrade Performance 20 - 4L", currentStock:0, minStock:0, orderQty:1, unitPrice:119000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Part", department:"AK", partNo:"AK-A73501809", name:"Gas Ballast Adaptor Kit nXDS (AK)", currentStock:0, minStock:0, orderQty:1, unitPrice:174000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Part", department:"AK", partNo:"A65201008", name:"Gas Ballast Control Assy RV", currentStock:0, minStock:0, orderQty:1, unitPrice:16000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Filter element", department:"AK", partNo:"A22304199", name:"Oil Mist Element EMF20", currentStock:0, minStock:0, orderQty:1, unitPrice:53000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Filter element", department:"AK", partNo:"A22304198", name:"Oil Mist Element EMF10", currentStock:0, minStock:0, orderQty:1, unitPrice:48000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Filter element", department:"AK", partNo:"A22304079", name:"Odour Removal Element EMF10 PK5", currentStock:0, minStock:0, orderQty:1, unitPrice:117000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Filter element", department:"AK", partNo:"A22304077", name:"Odour Removal Element EMF20 PK5", currentStock:0, minStock:0, orderQty:1, unitPrice:133000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Tip seal", department:"AK", partNo:"A73501801", name:"nXDS Tip Seal Service Kit", currentStock:0, minStock:0, orderQty:1, unitPrice:276000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Tip seal", department:"AK", partNo:"A73101801", name:"XDS46i Tip Seal and Exhaust Service Kit", currentStock:0, minStock:0, orderQty:1, unitPrice:409000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Tip seal", department:"AK", partNo:"A73001801", name:"Tip Seal and exhaust Kit XDS35i / XDS100", currentStock:0, minStock:0, orderQty:1, unitPrice:350000, leadTime:"4주", supplier:"에드워드코리아" },
  { category:"Tip seal", department:"AK", partNo:"A72601805", name:"Spares Kit Tip Seal XDS5-5C/10-10C", currentStock:0, minStock:0, orderQty:1, unitPrice:282000, leadTime:"4주", supplier:"에드워드코리아" },
];

async function main() {
  console.log(`총 ${ITEMS.length}개 품목 임포트 시작…\n`);
  let ok = 0, skip = 0;

  for (const item of ITEMS) {
    try {
      await prisma.inventoryItem.upsert({
        where: { partNo: item.partNo },
        update: {},
        create: item,
      });
      console.log(`  ✅ [${item.department}] ${item.partNo} — ${item.name.slice(0, 40)}`);
      ok++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`  ⏭  [${item.department}] ${item.partNo} — 건너뜀: ${msg.slice(0, 60)}`);
      skip++;
    }
  }

  console.log(`\n완료: 추가 ${ok}개 / 건너뜀 ${skip}개`);
  await prisma.$disconnect();
}

main();
