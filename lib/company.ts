// ─── 스마텍 회사 정보 (단일 출처) ───────────────────────────
// 견적서·거래명세표·메일·관리자 페이지 모두 이 파일에서 import해서 사용
// 정보 변경 시 이 파일만 수정하면 모든 곳 자동 반영
// 출처: 대표 명함 + 사업자등록증 (2026-05 확인)

export const SMARTECH_COMPANY = {
  // 기본
  name: "(주)스마텍",
  legalName: "주식회사 스마텍",
  english: "SMARTECH",
  englishLong: "Smartech Co., Ltd.",
  slogan: "Vacuum Components & Lines",
  role: "Edwards Vacuum Korea Authorized Distributor",
  roleKo: "Edwards Vacuum 한국 공식 대리점",
  since: 2011,

  // 등록 정보 (사업자등록증 기준)
  bizNo: "270-88-00854",
  corpNo: "135811-0333947",
  ceo: "이명재",
  establishedDate: "2018-01-25",
  businessType: "도소매, 제조업",
  businessItem: "반도체장비부품, 반도체배관라인",

  // 연락처 (명함 기준)
  officeTel: "031-204-7170",
  mobileTel: "010-3194-7170",
  fax: "031-206-7178",
  email: "rokmclmj@gmail.com",
  hotline24h: true,

  // 영업 본사 (명함 — 수원)
  headOfficeKo: "경기 수원시 영통구 신원로 55 영통테크트리 907호",
  headOfficeEn: "#907, 55 Sinwon-ro, Yeongtong-gu, Suwon-si, Gyeonggi-do, Korea",
  headOfficeShort: "SUWON, KR",

  // 사업자등록 본점 = 천안 A/S 센터
  registeredAddressKo: "충청남도 천안시 서북구 두정공원2길 49",
  cheonanCenterKo: "충남 천안시 서북구 두정공원2길 49",
  cheonanCenterEn: "49, Dujeonggongwon 2-gil, Seobuk-gu, Cheonan-si, Chungnam, Korea",
  cheonanCenterShort: "CHEONAN, KR",

  // 웹
  website: "www.smartechvacuum.com",
} as const;

// 자주 쓰이는 조합형 라벨
export const SMARTECH_DISPLAY = {
  // "(주)스마텍 · SMARTECH"
  fullName: `${SMARTECH_COMPANY.name} · ${SMARTECH_COMPANY.english}`,
  // 한 줄 풋터용
  footer: `© 2026 SMARTECH CO., LTD. · ${SMARTECH_COMPANY.role} · Since ${SMARTECH_COMPANY.since}`,
  // 한 줄 대표 연락처
  oneLineContact: `${SMARTECH_COMPANY.ceo} · ${SMARTECH_COMPANY.officeTel} · ${SMARTECH_COMPANY.email}`,
} as const;
