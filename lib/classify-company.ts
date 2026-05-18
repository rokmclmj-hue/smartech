import { prisma } from "./db";

export type AutoTier = "DEALER" | "OEM" | "ENDUSER";

// ─── 딜러 판별 키워드 ──────────────────────────────────────────────────────────
// 유통·판매 대리점에 주로 나타나는 단어
const DEALER_KEYWORDS = [
  "사이언스", "싸이언스", "사이언", "씨이엔",
  "랩테크", "랩컴퍼니", "랩",
  "베큠", "바큠", "백큠", "베큐",
  "상사", "과학상사", "과학항사",
  "테크서비스", "테크 서비스",
  "인스트루먼트", "인스트루",
  "코퍼레이션", "인터내셔널",
  "솔루션즈", "솔루션", "솔루숀",
  "기계상사", "기계상",
];

// ─── 딜러 제외 키워드 (연구기관·제조업체 등) ──────────────────────────────────
// 아래 단어가 있으면 딜러 키워드가 있어도 딜러로 분류하지 않음
const DEALER_EXCLUDE_KEYWORDS = [
  "연구소", "연구원", "연구실",
  "대학교", "대학원", "대학",
  "제약", "바이오", "메디칼", "의료",
  "반도체", "디스플레이",
  "기관", "공공", "정부",
  "재단", "협회", "조합",
];

// ─── 핵심 함수: 회사명만으로 등급 추정 ────────────────────────────────────────
export function guessNewTierByName(companyName: string): AutoTier {
  const name = companyName.toLowerCase().replace(/[㈜㈔(주)(사)]/g, "").trim();

  const hasExclusion = DEALER_EXCLUDE_KEYWORDS.some((kw) => name.includes(kw));
  if (!hasExclusion) {
    const isDealer = DEALER_KEYWORDS.some((kw) => name.includes(kw.toLowerCase()));
    if (isDealer) return "DEALER";
  }

  return "ENDUSER";
}

// ─── 핵심 함수: DB 화이트리스트 + 키워드 규칙 종합 분류 ──────────────────────
// 반환값:
//   { tier, source: "whitelist" }  — 100% 확실, 즉시 해당 등급
//   { tier, source: "keyword" }    — 추정, PENDING으로 보내고 adminEstimate에 기록
//   { tier: "ENDUSER", source: "default" } — 기본값
export async function classifyCompany(opts: {
  phone?: string | null;
  email?: string | null;
  companyName?: string | null;
}): Promise<{ tier: AutoTier; source: "whitelist" | "keyword" | "default" }> {
  const { phone, email, companyName } = opts;

  // 1단계: 전화번호로 화이트리스트 조회 (가장 정확)
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 9) {
      const known = await prisma.knownCompany.findFirst({
        where: { phone: digits },
      });
      if (known) return { tier: known.tier as AutoTier, source: "whitelist" };
    }
  }

  // 2단계: 이메일로 화이트리스트 조회
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    const known = await prisma.knownCompany.findFirst({
      where: { email: normalizedEmail },
    });
    if (known) return { tier: known.tier as AutoTier, source: "whitelist" };
  }

  // 3단계: 회사명 키워드 규칙
  if (companyName) {
    const guessed = guessNewTierByName(companyName);
    if (guessed === "DEALER") return { tier: "DEALER", source: "keyword" };
  }

  // 기본값: ENDUSER (안전한 공개 가격 적용)
  return { tier: "ENDUSER", source: "default" };
}
