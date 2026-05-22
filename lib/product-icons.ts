// 제품 partNo / description 으로 적합한 SVG 아이콘 파일 결정
// 아이콘 파일 위치: /public/images/products/icons/{name}.svg

const ICON_BASE = "/images/products/icons";

// 우선순위 순서대로 매칭 (긴 키워드부터 — 부분 매칭 충돌 방지)
// 후행 \b 제거: 모델명 뒤에 숫자가 바로 붙는 경우(E2S45, XDS35iE 등) 매칭 실패 방지
const ICON_RULES: Array<[RegExp, string]> = [
  [/\bT[-\s]?Station\b/i, "t-station"],
  [/\bnXRi?/i,            "nxri"],
  [/\bnXDS/i,             "nxds"],
  [/\biXH/i,              "ixh"],
  [/\biXL/i,              "ixl"],
  [/\bnEXT/i,             "next"],
  [/\bnES/i,              "nes"],
  [/\bGXS/i,              "gxs"],
  [/\bEXS/i,              "exs"],
  [/\bELD\s*500\b/i,      "eld500"],
  [/\bAIM/i,              "aim200"],
  [/\bAPG/i,              "apg200"],
  [/\bWRG/i,              "wrg200"],
  [/\bP[45]\b/i,          "p4p5"],
  [/\bTIC/i,              "tic"],
  [/\bADC/i,              "adc"],
  [/\bEMF/i,              "emf"],
  // Ultra 19 / Ultragrade 45 / Edwards 45 fluid 등 오일류
  [/\bUltra|\bfluid\b/i,  "ultra19"],
  [/\bKF\b|\bISO[-\s]?K\b|\bNW\b|fitting|accessor/i, "fittings"],
  [/\bSTP/i,              "stp"],
  // E2M40 / E2M80 / E2M175 / E2M275 → large
  [/\bE2M\s*(40|80|175|275)/i, "e2m-large"],
  // 그 외 E2M (E2M0.7, E2M1.5, E2M18, E2M28 등) → small
  [/\bE2M/i,              "e2m-small"],
  [/\bE2S/i,              "e2s"],
  [/\bEH\d*/i,            "eh"],
  [/\bRV\d*/i,            "rv"],
  [/\bXDS/i,              "xds"],
];

const FALLBACK_ICON = "fittings";

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

// ─── 실제 제품 사진 매핑 ────────────────────────────────────────
// 아이콘 파일 위치: /public/images/products/{name}
const PHOTO_BASE = "/images/products";

const PHOTO_RULES: Array<[RegExp, string]> = [
  [/\bT[-\s]?Station\b/i,          "t-station.jpeg"],
  [/\bnXRi?\b/i,                    "nxri.jpeg"],
  [/\bSTP[-\s]?i[XA]\b/i,          "stp-new.png"],   // STP iXA 계열
  [/\biXH\b/i,                      "ixh-ixl.jpeg"],
  [/\biXL\b/i,                      "ixl-new.png"],
  [/\bnEXT\b/i,                     "next.png"],
  [/\bnES\b/i,                      "nes.jpeg"],
  [/\bGXS\b/i,                      "gxs.jpeg"],
  [/\bEXS\b/i,                      "exs.jpeg"],
  [/\bELD\s*500\b/i,                "eld500.jpeg"],
  [/\bAIM\b/i,                      "aim-new.png"],
  [/\bAPG\b/i,                      "apg-new.png"],
  [/\bTIC\b/i,                      "tic-new.png"],
  [/\bSTP\b/i,                      "stp-new.png"],
  [/\bE2M\s*(40|80|175|275)\b/i,   "e2m-large-new.png"],
  [/\bE2M\b/i,                      "e2m-small-new.png"],
  [/\bE2S\b/i,                      "e2s.png"],
  [/\bnXDS\b/i,                     "xds.jpeg"],
  [/\bXDS\b/i,                      "xds.jpeg"],
  [/\bEH\d*\b/i,                    "eh.jpeg"],
  [/\bRV\d*\b/i,                    "rv.jpeg"],
];

const FALLBACK_PHOTO = "rv.jpeg";

// partNo + description → 실제 제품 사진 URL 반환
export function getProductPhotoUrl(partNo: string, description: string): string {
  const haystack = `${partNo} ${description}`;
  for (const [pattern, file] of PHOTO_RULES) {
    if (pattern.test(haystack)) return `${PHOTO_BASE}/${file}`;
  }
  return `${PHOTO_BASE}/${FALLBACK_PHOTO}`;
}
