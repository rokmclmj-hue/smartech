// 제품 partNo / description 으로 적합한 SVG 아이콘 파일 결정
// 아이콘 파일 위치: /public/images/products/icons/{name}.svg

const ICON_BASE = "/images/products/icons";

// 우선순위 순서대로 매칭 (긴 키워드부터 — 부분 매칭 충돌 방지)
const ICON_RULES: Array<[RegExp, string]> = [
  [/\bT[-\s]?Station\b/i, "t-station"],
  [/\bnXRi?\b/i, "nxri"],
  [/\bnXDS\b/i, "nxds"],
  [/\biXH\b/i, "ixh"],
  [/\biXL\b/i, "ixl"],
  [/\bnEXT\b/i, "next"],
  [/\bnES\b/i, "nes"],
  [/\bGXS\b/i, "gxs"],
  [/\bEXS\b/i, "exs"],
  [/\bELD\s*500\b/i, "eld500"],
  [/\bAIM\b/i, "aim200"],
  [/\bAPG\b/i, "apg200"],
  [/\bWRG\b/i, "wrg200"],
  [/\bSTP\b/i, "stp"],
  // E2M40 / E2M80 / E2M175 / E2M275 → large
  [/\bE2M\s*(40|80|175|275)\b/i, "e2m-large"],
  // 그 외 E2M (E2M0.7, E2M1.5, E2M18, E2M28 등) → small
  [/\bE2M\b/i, "e2m-small"],
  [/\bE2S\b/i, "e2s"],
  [/\bEH\d*\b/i, "eh"],
  [/\bRV\d*\b/i, "rv"],
  [/\bXDS\b/i, "xds"],
];

const FALLBACK_ICON = "rv";

// partNo + description 합쳐서 매칭 → 아이콘 파일 URL 반환
export function getProductIconUrl(partNo: string, description: string): string {
  const haystack = `${partNo} ${description}`;
  for (const [pattern, name] of ICON_RULES) {
    if (pattern.test(haystack)) return `${ICON_BASE}/${name}.svg`;
  }
  return `${ICON_BASE}/${FALLBACK_ICON}.svg`;
}

// 매칭된 아이콘 이름만 반환 (디버깅·라벨용)
export function getProductIconName(partNo: string, description: string): string {
  const haystack = `${partNo} ${description}`;
  for (const [pattern, name] of ICON_RULES) {
    if (pattern.test(haystack)) return name;
  }
  return FALLBACK_ICON;
}
