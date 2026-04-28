import { readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

// ── DB category → catalog key 매핑 ──────────────────────────
const CAT_TO_KEY = {
  "오일펌프(소형 RV)":        "RV",
  "오일펌프(소형 E2M)":       "E2M_small",
  "오일펌프(중대형 E2M)":     "E2M_large",
  "오일펌프(중대형 E2S)":     "E2M_large",   // E2S → E2M_large 키에 포함
  "오일펌프(nES)":             "nES",
  "부스터펌프(EH)":            "EH",
  "스크롤펌프(소형 nXDS)":    "nXDS",
  "스크롤펌프(중형 XDS)":     "XDS",
  "산업용드라이펌프(GXS)":    "GXS",
  "산업용드라이펌프(EXS)":    "EXS",
  "반도체드라이펌프(iXH)":    "iXH",
  "반도체드라이펌프(nXRi)":   "nXRi",
  "반도체드라이펌프(iXL)":    "nXL",
  "터보펌프(nEXT)":            "nEXT",
  "터보펌프(nEXT Station)":   "nEXT",
  "터보펌프(STP)":             "nEXT",
  "헬륨리크디텍터(ELD500)":   "ELD",
  "저진공게이지(APG200)":     "APG",
  "고진공게이지(AIM200)":     "AIM",
  "복합진공게이지(WRG200)":   "WRG",
  "디스플레이게이지(P4/P5)":  "P4P5",
  "컨트롤러(TIC)":             "TIC",
  "컨트롤러(ADC)":             "ADC",
  "미스트필터(EMF)":           "EM",
  "진공펌프오일(Ultra19)":    "OIL",
  "피팅/액세서리":             "FITTING",
  "기타":                      "FITTING",
};

// ── inferCategory (import-products.ts 와 동일) ───────────────
function inferCategory(partNo, description) {
  const desc = description.toLowerCase();
  const part = partNo.toLowerCase();
  const both = `${desc} ${part}`;

  if (/t-?station|tstation|pumping station/.test(desc)) return "터보펌프(nEXT Station)";
  if (/\bstp[- ]?\w*|stp\d/.test(both))                return "터보펌프(STP)";
  if (/\bnext\b|nexta|next\d|next turbo/.test(both))   return "터보펌프(nEXT)";
  // TIC/ADC: nEXT 모델명 다음, turbo 일반어 이전 (TIC Turbo Controller 오분류 방지)
  if (/\btic\b|tic \d|turbo.*controller|instrument controller/.test(both)) return "컨트롤러(TIC)";
  if (/\badc\b|adc \d|analog display|analogue display/.test(both)) return "컨트롤러(ADC)";
  if (/\bp0\d{2}\b|stator|rotor assy|turbo/.test(both)) return "터보펌프(nEXT)";
  if (/eld\d|leak detect|helium leak/.test(both))       return "헬륨리크디텍터(ELD500)";
  // AIGX 게이지: igx 패턴보다 먼저 (AIM 계열 게이지 오분류 방지)
  if (/\baigx/.test(both))                              return "고진공게이지(AIM200)";
  if (/ixh\d|ixh |ixm\d|\bixm\b/.test(both))           return "반도체드라이펌프(iXH)";
  if (/nxri|nxr\d|nxr /.test(both))                    return "반도체드라이펌프(nXRi)";
  if (/ixl\d|ixl |nxl\d|nxl /.test(both))              return "반도체드라이펌프(iXL)";
  if (/igx|ipx|ih\d|iq\d/.test(both))                  return "반도체드라이펌프(iXH)";
  // nGX는 GXS 계열 (EXS 패턴에서 제거)
  if (/gxs|\bgx\d|\bngx/.test(both))                   return "산업용드라이펌프(GXS)";
  if (/\bexs|\beos|\beds|\bedc|\bnedc|\binedc|\bedo\d/.test(both)) return "산업용드라이펌프(EXS)";
  // 오일/소모품은 booster 키워드보다 먼저 (Vapour Booster Pump Fluid 오분류 방지)
  if (/ultra\s?\d|ultragrade|pfpe|fomblin|krytox|vacuum oil|apiezon|wax/.test(desc)) return "진공펌프오일(Ultra19)";
  if (/silicone oil|lube|v lube|vapour.*fluid|diffusion.*fluid|booster.*fluid|pump fluid|\bfluid\b|grease|carbon pack|alumina|xtragrade|edwards 45|edwards 70\d/.test(desc)) return "진공펌프오일(Ultra19)";
  if (/\beh\d|\beh\s|booster|qmb/.test(both))          return "부스터펌프(EH)";
  if (/nxds|nxd\d/.test(both))                         return "스크롤펌프(소형 nXDS)";
  if (/\bxds\b|xds\d|scroll/.test(both))               return "스크롤펌프(중형 XDS)";
  if (/\bnes\b|nes\d/.test(both))                      return "오일펌프(nES)";
  if (/e2s\d|\be2s\b/.test(both))                      return "오일펌프(중대형 E2S)";
  // 미스트필터: E2M 패턴 이전 (MF30 Fits E2M28 오분류 방지)
  if (/\bemf\d|\bemf\b|mist filter|oil mist/.test(both)) return "미스트필터(EMF)";
  if (/e2m(0\.\d+|1[.\/]|1\.5|18|28|2\b|5\b|-1|-2|-5)/.test(both)) return "오일펌프(소형 E2M)";
  if (/\be2m\d|\be2m\b/.test(both))                    return "오일펌프(중대형 E2M)";
  if (/\brv\d|\brv\b/.test(both))                      return "오일펌프(소형 RV)";
  if (/apg\d|\bapg/.test(both))                        return "저진공게이지(APG200)";
  if (/aim\d|\baim/.test(both) || /active ion gauge/.test(desc)) return "고진공게이지(AIM200)";
  if (/wrg\d|\bwrg|wrh|wra/.test(both))                return "복합진공게이지(WRG200)";
  if (/\bp[45] gauge|p4-p5|p4\/p5|\bp[45]\b|\bp4\b|\bp5\b/.test(desc)) return "디스플레이게이지(P4/P5)";
  if (/capsule gauge|cg\d+k|pirani|penning|ion gauge|ionization gauge|tag controller|barocel|prg\d+|\bpra\d|\bpra-\d/.test(desc)) return "복합진공게이지(WRG200)";
  if (/\bgauge\b|vacuum.*switch|interlock switch|adjustable.*switch/.test(desc)) return "복합진공게이지(WRG200)";
  if (/valve|speedivalve|solenoid|pipeline valve|fitting|elbow|clamp|centering|nw\d+|kf\d+|iso\d+|dn\d+cf|tee |tee-|cross|flange|hose|gasket|o[- ]ring|o-ring\b|bellow|adapter|centring|spare tube|silencer|catchpot|trap|dust filter|chemical trap|cable|coupling|vibration pad/.test(desc)) return "피팅/액세서리";
  if (/spare|service kit|overhaul kit|blade kit|rotor|stator|shaft|bearing|oil seal|sight glass|gear|cooling|fan\b|heater|heatsink|impeller|o\/s|core plug|washer|dowty|bonded seal|back shell|terminal|connector|plug|strainer|cartridge|regulator|sensor|interface|module|display|itim|mcm|sim|controller|holster|bracket|head ?plate|manifold|pump display|filter element|pair of gears|vibration|micro.?tim|\btim\b|bus.?bar|conn.?kit|hook.?up.?kit|pipe.?assy|quick.?connect|\bqc[- ]sock|\bqc[- ]skt|\bmale.?conn|nozzle.?kit|torque.?limit|after.?cool|microswitch|flow.?indicat|dowel|locking.?ring|spring|dust.?thrower|oil.?thrower|swing.?prv|gas.?ballast|oil.?filter|taper.?lock|inner.?ring|oil.?pump.?blade|banjo.?bolt|ethercat|blanking|blnkn|drain.?end|end.?cap|side.?panel|panel.*e2m|oil.?tube|tube.?assy|\bassy\b|service.*box/.test(desc)) return "피팅/액세서리";
  if (/\bgv\d+/.test(both)) return "오일펌프(중대형 E2M)";
  if (/\bem\d{2,}/.test(both)) return "오일펌프(중대형 E2M)";
  if (/\beh\b/.test(both)) return "부스터펌프(EH)";
  if (/calibrated leak|cl-cal|cl-int/.test(desc)) return "헬륨리크디텍터(ELD500)";
  return "피팅/액세서리";
}

// ── 스페어 여부 판단 (정렬용) ────────────────────────────────
function isSpare(desc) {
  return /spare|kit|overhaul|rotor|stator|shaft|bearing|oil seal|gear|cooling coil|heater|fan|coupling|headplate|intercooler|fluid coupling|blade|seal|filter element|service|impeller/i.test(desc);
}

// ── 모델 번호 추출 (정렬용): 설명 앞부분 영문자 바로 뒤 숫자 ──
function modelSortKey(desc) {
  const m = desc.match(/^[A-Za-z]+(\d+)/);   // "EH250" → 250, "nXDS6i" → 6
  return m ? parseInt(m[1]) : 99999;
}

// ── 메인 ────────────────────────────────────────────────────
const wb = XLSX.readFile("C:/Users/Robin/Desktop/진공펌프_소개_자동화/제품아이템번호 및 단가/원본_2026_Price_IV_SV_VTS_통합.xlsx");
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "" });

const newCatalog = {};

// 각 카테고리 키 초기화
const KEYS = ["RV","E2M_small","E2M_large","nES","EH","nXDS","XDS","GXS","EXS","iXH","nXRi","nXL","nEXT","ELD","APG","AIM","WRG","P4P5","TIC","ADC","EM","OIL","FITTING"];
KEYS.forEach(k => newCatalog[k] = []);

let added = 0, skipped = 0;
const seen = new Set();

rows.slice(1).forEach(row => {
  const partNo = String(row[1] || "").trim();
  const desc   = String(row[2] || "").trim();
  const price  = typeof row[3] === "number" ? row[3] : parseFloat(String(row[3]).replace(/,/g, "")) || 0;

  if (!partNo || !desc) { skipped++; return; }
  if (seen.has(partNo)) { skipped++; return; }
  seen.add(partNo);

  const dbCat = inferCategory(partNo, desc);
  const key   = CAT_TO_KEY[dbCat] || "FITTING";
  const catalogPrice = Math.round(price * 1.35 / 100) * 100;  // 1.35배 후 100원 단위 반올림

  newCatalog[key].push({ partNo, desc, price: catalogPrice });
  added++;
});

// ── 각 카테고리 내 정렬: 본체 먼저, 스페어 뒤, 같은 그룹은 모델번호 순 ──
KEYS.forEach(key => {
  const items = newCatalog[key];
  const pumps = items.filter(x => !isSpare(x.desc));
  const spares = items.filter(x => isSpare(x.desc));
  pumps.sort((a, b) => modelSortKey(a.desc) - modelSortKey(b.desc) || a.desc.localeCompare(b.desc));
  spares.sort((a, b) => a.desc.localeCompare(b.desc));
  newCatalog[key] = [...pumps, ...spares];
});

// SPARE = 전체 카탈로그 통합 (재구매 탭 전체 검색용), 파트번호순 정렬
const allItems = KEYS.flatMap(k => newCatalog[k]);
allItems.sort((a, b) => a.desc.localeCompare(b.desc));
newCatalog.SPARE = allItems;

writeFileSync("lib/productCatalog.json", JSON.stringify(newCatalog, null, 2));

console.log(`완료: ${added}개 처리, ${skipped}개 건너뜀`);
KEYS.forEach(k => console.log(`  ${k}: ${newCatalog[k].length}개`));
console.log(`  SPARE(전체): ${newCatalog.SPARE.length}개`);
