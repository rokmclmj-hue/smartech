"use client";
import { useEffect } from "react";

// 견적 카트를 홈 카트 하나로 합침(2026-10-20 대표님 승인) — 옛 /quote 주소·즐겨찾기는 홈 카트를 연다.
// 주문 요청(회원: /api/quote/request, 비회원: /api/quote/guest-request)은 components/QuotePanel.tsx에서 한다.
export default function QuotePage() {
  useEffect(() => {
    window.location.replace("/#cart");
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center text-dim">
      견적서로 이동 중입니다…
    </div>
  );
}
