// GA4 문의 이벤트 기록 — 손님 화면 동작은 바꾸지 않고 횟수만 보낸다 (개인정보 금지)
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type InquiryEvent = "phone_click" | "quote_request" | "repair_submit" | "chat_start";

export function trackEvent(name: InquiryEvent) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, { page_path: window.location.pathname });
  } catch {
    // 분석 실패가 손님 화면에 영향을 주지 않도록 무시
  }
}
