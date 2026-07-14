// 수리 견적 마진 — 온라인(app/repair)·오프라인(app/admin/offline-repairs) 공통 사용

export const REPAIR_EXTRA_MARGIN = 1.2; // 추가항목(RepairKitExtra) 마진

// 모델별 기본수리 마진 (nXDS·XDS35 계열 1.5, 그 외 1.8)
export function getRepairBaseMargin(pumpModel: string): number {
  const m = pumpModel.toLowerCase();
  if (m.startsWith("nxds") || m.startsWith("xds35")) return 1.5;
  return 1.8;
}
