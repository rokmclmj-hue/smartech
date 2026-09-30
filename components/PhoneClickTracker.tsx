"use client";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

// 전화번호(tel:) 링크 클릭을 한 곳에서 기록. 관리자 화면(직원이 고객에게 거는 전화)은 제외
export default function PhoneClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (window.location.pathname.startsWith("/admin")) return;
      const target = e.target as Element | null;
      if (target?.closest?.('a[href^="tel:"]')) trackEvent("phone_click");
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
