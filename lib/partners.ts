// 스마텍 거래처 회사명 데이터 (출처: 스마텍_업체분류_20260502.xlsx)
// 81개사 — 회사명만 (개인정보 제외)
// 회원가입 회사명과 매칭하여 신규 거래처 후보를 식별하는 용도

export type PartnerType = "DEALER" | "OEM" | "ENDUSER";

const DEALERS: readonly string[] = [
  "더베큠",
  "랩컴퍼니",
  "리더스베큠",
  "맑음과학",
  "모닝사이언",
  "㈜무진씨에스",
  "미르테크",
  "㈜바이오닉스",
  "베스트랩",
  "VACUUM ALL",
  "㈜보아테크놀로지",
  "브릿지오버",
  "브이티아이",
  "삼성랩",
  "새진하이테크",
  "서울테크",
  "성우인스트루먼츠",
  "성진이앤에이",
  "성호시그마",
  "㈜소일테크",
  "솔버그코리아",
  "신영에스티",
  "신일테크",
  "㈜신흥계기",
  "싸이엔텍",
  "㈜씨엘케이",
  "에스케이이화학",
  "에이스시스템즈",
  "엠제이솔루션",
  "이에스아이시",
  "코리아사이언스",
  "㈜크로마테크서비스",
  "퍼블",
  "프라임텍",
  "한동산업",
];

const OEMS: readonly string[] = [
  "㈜썸백ENG",
  "㈜이젠테크",
  "그린리소스",
  "㈜와이지엔지니어링",
  "알파플러스",
  "㈜오방테크놀로지",
  "오토클레이브테크",
  "오페론",
  "제릭스",
  "제이와이테크놀로지",
  "제일이엔지",
  "하나솔루션",
  "한국전자기계융합기술원",
  "㈜나노솔루션테크",
  "아이엠에스㈜",
];

const ENDUSERS: readonly string[] = [
  "국방과학연구소",
  "기초과학연구원",
  "대구수질연구소",
  "덕산네오룩스",
  "동국제약㈜",
  "동광제약",
  "미코하이테크",
  "비츠로넥스텍",
  "비츠로브이엠",
  "비츠로셀",
  "서울대학교 (박민혁교수연구실)",
  "서울대 물리학과 (이규철교수연구실)",
  "서울대 자연과학대 (장준호교수연구실)",
  "쎌바이오텍",
  "에어프로덕츠",
  "율촌화학",
  "유니스트 (울산과학기술원)",
  "포항가속기연구소 (빔라인과학팀)",
  "한국가스공사",
  "한국고분자시험연구소㈜",
  "한국과학기술연구원",
  "한국메티슨특수가스",
  "한국재료연구원",
  "한국항공대학교",
  "한국항공우주연구원 (항우연)",
  "한국화학연구원 (바이오화학센터)",
  "한양대학교",
  "한화큐셀",
  "희성촉매㈜",
  "㈜시스템알앤디",
  "㈜씨브이",
];

// 회사명 정규화: 법인 표기·괄호 부서·공백·대소문자 제거
function normalize(s: string): string {
  return (s || "")
    .replace(/㈜/g, "")
    .replace(/\(주\)/g, "")
    .replace(/주식회사/g, "")
    .replace(/\([^)]*\)/g, "") // 괄호 안 부서/연구실 명 제거
    .replace(/\s+/g, "")
    .toLowerCase();
}

// 정규화된 회사명 → 거래처 유형 룩업 맵
const PARTNER_MAP = new Map<string, PartnerType>();
for (const name of DEALERS) PARTNER_MAP.set(normalize(name), "DEALER");
for (const name of OEMS) PARTNER_MAP.set(normalize(name), "OEM");
for (const name of ENDUSERS) PARTNER_MAP.set(normalize(name), "ENDUSER");

export interface PartnerMatch {
  type: PartnerType;
  matchedName: string; // 거래처 리스트의 원본 회사명
  matchType: "exact" | "partial";
}

// 회사명 매칭. 정확 매칭 우선, 실패 시 부분 매칭(최소 4자) 시도
export function matchPartner(companyName: string): PartnerMatch | null {
  const key = normalize(companyName);
  if (!key) return null;

  // 1. 정확 매칭
  const direct = PARTNER_MAP.get(key);
  if (direct) {
    return {
      type: direct,
      matchedName: companyName,
      matchType: "exact",
    };
  }

  // 2. 부분 매칭 (4자 이상에서만 — 짧은 키워드 오매칭 방지)
  if (key.length < 4) return null;
  for (const [registeredKey, type] of PARTNER_MAP) {
    if (registeredKey.length < 4) continue;
    if (key.includes(registeredKey) || registeredKey.includes(key)) {
      return {
        type,
        matchedName: registeredKey,
        matchType: "partial",
      };
    }
  }

  return null;
}

// 사용자가 등록한 회사명이 거래처 리스트에 없으면 true
export function isUnregisteredCompany(companyName: string): boolean {
  return matchPartner(companyName) === null;
}

// 통계용
export const PARTNER_COUNTS = {
  DEALER: DEALERS.length,
  OEM: OEMS.length,
  ENDUSER: ENDUSERS.length,
  TOTAL: DEALERS.length + OEMS.length + ENDUSERS.length,
} as const;
