// 발주서 번호: SMT-YYMMDD-P-NNNNNN (발주일 한국 날짜 + 발주서 id)
// 2026-09-28 이전 발주서는 SMT-YYYY-P-NNNNNN 형식으로 저장돼 있어 그대로 둔다.
export function makePurchaseOrderNo(orderDate: Date, id: number): string {
  const ymd = orderDate
    .toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }) // 2026-06-10
    .replace(/-/g, "")
    .slice(2); // 260610
  return `SMT-${ymd}-P-${String(id).padStart(6, "0")}`;
}

// 옛 형식(연도 4자리)과 새 형식(날짜 6자리)을 모두 스마텍 발주서 번호로 인식
export const PURCHASE_ORDER_NO_PATTERN = /^SMT-(\d{4}|\d{6})-P-\d+$/;
