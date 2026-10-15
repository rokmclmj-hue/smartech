// 수리 보증 기간 — 대표 확인(2026-10-16): 드라이펌프 6개월, 오일 로터리 펌프 3개월, 그 외 별도 안내.
// 모델 분류는 RepairKit.pumpFamily(dry / rotary_vane)와 같은 기준. 오프라인 수리접수는 pumpFamily가 없어 모델명으로 판별한다.

const DRY_MODEL = /^(iH|iXH|iXL|iXM|iGX|iQDP|GV|GXS)/i;
const ROTARY_MODEL = /^(RV|E1M|E2M|DUO|W2V)/i;

export function repairWarrantyText(pumpFamily?: string | null, pumpModel?: string | null): string {
  let family = pumpFamily && pumpFamily !== "other" ? pumpFamily : null;
  if (!family) {
    const model = (pumpModel ?? "").trim();
    if (DRY_MODEL.test(model)) family = "dry";
    else if (ROTARY_MODEL.test(model)) family = "rotary_vane";
  }
  if (family === "dry") return "수리 후 6개월 보증 (드라이펌프)";
  if (family === "rotary_vane") return "수리 후 3개월 보증 (오일 로터리 펌프)";
  return "보증 기간은 모델·작업 내용에 따라 별도 안내";
}
