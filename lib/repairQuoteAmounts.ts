import { VAT_RATE } from "./constants";

export interface RepairQuoteItemForAmount {
  quantity: number;
  unitPrice: number;
}

// repairCost가 직접 수정된 경우 그 값을 최종 견적금액으로 우선 사용, 없으면 품목 합계 (품목도 없으면 null="협의")
export function computeRepairQuoteAmounts(
  repairCost: number | null,
  items: RepairQuoteItemForAmount[]
): { supply: number | null; vat: number; total: number } {
  const itemsSum = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const supply = repairCost ?? (items.length > 0 ? itemsSum : null);
  const vat = supply != null ? Math.round(supply * VAT_RATE) : 0;
  const total = (supply ?? 0) + vat;
  return { supply, vat, total };
}
