// 제품 종류별 통상 납기 (재고 없을 때 견적 문의 검색 결과에 표시)
// 값은 대표님 안내 기준 (2026-10-19). 바뀌면 이 표만 고친다. null = "납기 문의"
// 키는 DB Product.category 그대로.

const PUMP_BODY_LEAD: Record<string, string | null> = {
  "오일펌프(소형 RV)": "4주",
  "오일펌프(소형 E2M)": "8주",
  "오일펌프(중대형 E2M)": "8주",
  "오일펌프(중대형 E2S)": "10주",
  "오일펌프(nES)": "12주",
  "부스터펌프(EH)": "10주",
  "스크롤펌프(소형 nXDS)": "8주",
  "스크롤펌프(중형 XDS)": "8주",
  "산업용드라이펌프(GXS)": "12주",
  "산업용드라이펌프(EXS)": "12주",
  "반도체드라이펌프(iXH)": null, // 현재 1년 이상 — 문의 후 안내
  "반도체드라이펌프(iXL)": null, // 현재 1년 이상 — 문의 후 안내
  "반도체드라이펌프(nXRi)": "8주",
  "터보펌프(nEXT)": "12주",
  "터보펌프": "12주",
  "터보펌핑스테이션(T-Station)": "12주",
  "펌프": "12주", // T-station85H + mXDS3S 1건
};

// 펌프가 아닌 분류는 품목 전체에 같은 납기
const CATEGORY_LEAD: Record<string, string | null> = {
  "저진공게이지(APG200)": "6주",
  "고진공게이지(AIM200)": "6주",
  "복합진공게이지(WRG200)": "6주",
  "디스플레이게이지(P4/P5)": "6주",
  "게이지": "6주",
  "컨트롤러(TIC)": "12주",
  "컨트롤러(ADC)": "8주",
  "헬륨리크디텍터(ELD500)": null,
  "미스트필터(EMF)": "1주", // 완제품 기준 — 부속은 specialLead에서 4주·납기 문의
  "진공펌프오일(Ultra19)": "2주",
  "피팅/액세서리": "4주",
  "악세사리": "4주",
  "오링": "4주",
  "캡": "4주",
  "케이블": "4주",
  "밸브": "4주",
  "기타": "4주", // 스테이터 등 부품
};

const PARTS_LEAD = "4주";

// 2026-10-24 대표님 기준
// - 소형 RV 본체: 기본 사양 4주, 특수 사양(FX·3상)은 12주
// - 미스트필터: 필터 완제품(EMF3·10·20, MF30)만 1주, 엘리먼트·키트 등 부속은 4주, 판매 이력 없는 씰은 "납기 문의"
const RV_SPECIAL = /^RV\d+FX\b|\b3ph\b/i;
const MIST_FILTER_BODY = /^E?MF\d+\b.*\bMist Filter\b/i;
const MIST_FILTER_UNKNOWN = /^Seal\b/i;

function specialLead(category: string, desc: string): string | null | undefined {
  const d = desc.trim();
  if (category === "오일펌프(소형 RV)" && !isPumpPart(d) && RV_SPECIAL.test(d)) return "12주";
  if (category === "미스트필터(EMF)") {
    if (MIST_FILTER_BODY.test(d)) return "1주";
    return MIST_FILTER_UNKNOWN.test(d) ? null : PARTS_LEAD;
  }
  return undefined; // 아래 기본 표를 따른다
}

// 펌프 분류 안의 부품·키트 구분. 키트 단어, 부품 이름, 또는 첫 단어에 숫자가 없는 품명(Rotor E2M18, Side Panel …)
// 예외: T-Station·EOS는 첫 단어에 숫자가 없어도 본체
const KIT_WORDS = /\b(kit|spares?|parts?)\b/i;
const PART_WORDS = /\b(rotor|stator|bearing|coupling|silencer|valve|vlv|filter|gasket|plug|coil|gears?|panel|flange|tooling|scroll|return|bellows|inverter|isolators?|clamp|cover|sight|ducting|cowl|connect|conn|harting|matng)\b/i;
const BODY_PREFIX_NO_DIGIT = /^(t-station|eos)\b/i;

// 검색 결과 정렬(PumpSelector)도 같은 기준을 쓴다 — 본체/부품 판단이 두 곳에서 어긋나지 않게
// 키트·부품 단어가 들어 있는지만 본다 — "nEXT300D … with Air Cooler, Vent Valve, TIC Controller" 같은 구성품 목록은 본체 이름 부분만
export function hasPartWord(desc: string): boolean {
  const head = desc.split(/\s+with\s+|;/i)[0];
  return KIT_WORDS.test(head) || PART_WORDS.test(head);
}

export function isPumpPart(desc: string): boolean {
  if (hasPartWord(desc)) return true;
  const firstWord = desc.trim().split(/\s+/)[0] ?? "";
  return !/\d/.test(firstWord) && !BODY_PREFIX_NO_DIGIT.test(desc.trim());
}

// 표시 문구: "통상 4주" | "납기 문의"
export function leadTimeLabel(category: string | null | undefined, desc: string): string {
  if (!category) return "납기 문의";
  const special = specialLead(category, desc);
  if (special !== undefined) return special ? `통상 ${special}` : "납기 문의";
  if (category in PUMP_BODY_LEAD) {
    const lead = isPumpPart(desc) ? PARTS_LEAD : PUMP_BODY_LEAD[category];
    return lead ? `통상 ${lead}` : "납기 문의";
  }
  if (category in CATEGORY_LEAD) {
    const lead = CATEGORY_LEAD[category];
    return lead ? `통상 ${lead}` : "납기 문의";
  }
  return "납기 문의";
}
