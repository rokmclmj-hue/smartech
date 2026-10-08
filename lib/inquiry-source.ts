// 대행견적서 "문의 경로" 선택지 — 견적서 PDF에는 나가지 않는 내부 기록.
// 대행견적 작성 화면, 저장 API, 관리자 대시보드 집계가 함께 쓴다.
export const INQUIRY_SOURCES = [
  // 메일은 받은 주소로 나눈다 — 홈페이지에는 info@ 주소만 공개돼 있어, info 메일 건수가 홈페이지를 보고 온 문의의 지표가 된다.
  { value: "EMAIL_INFO", label: "info 메일" },
  { value: "EMAIL_DIRECT", label: "rokmclmj 메일" },
  { value: "PHONE", label: "전화" },
  { value: "WEB", label: "홈페이지" },
  { value: "EXISTING", label: "기존 거래" },
  { value: "OTHER", label: "기타" },
] as const;

export type InquirySource = (typeof INQUIRY_SOURCES)[number]["value"];

export function parseInquirySource(v: unknown): InquirySource | null {
  return INQUIRY_SOURCES.some((o) => o.value === v) ? (v as InquirySource) : null;
}
