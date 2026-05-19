"use client";
import { useState, useEffect } from "react";
import QuotePanel from "./QuotePanel";
import QuotePreviewModal from "./QuotePreviewModal";

export default function QuoteBar() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function readCount() {
      try {
        const stored = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
        setCount(Array.isArray(stored) ? stored.length : 0);
      } catch {
        setCount(0);
      }
    }
    readCount();
    window.addEventListener("quoteCartUpdated", readCount);
    window.addEventListener("storage", readCount);
    return () => {
      window.removeEventListener("quoteCartUpdated", readCount);
      window.removeEventListener("storage", readCount);
    };
  }, []);

  if (count === 0 && !open) return null;

  return (
    <>
      {/* 왼쪽: 화이트모드 견적서 미리보기 */}
      <QuotePreviewModal open={open} onClose={() => setOpen(false)} />
      {/* 오른쪽: 견적 카트 패널 */}
      <QuotePanel open={open} onClose={() => setOpen(false)} />

      {/* 하단 플로팅 버튼 */}
      {count > 0 && !open && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-60 pointer-events-none">
          <button
            onClick={() => setOpen(true)}
            className="pointer-events-auto flex items-center gap-3 bg-ink text-paper px-7 py-3.5 shadow-2xl hover:bg-edred transition-colors border border-white/10"
          >
            <span className="text-[13px] font-medium tracking-tight">견적서 미리보기</span>
            <span className="w-px h-3.5 bg-white/30" aria-hidden="true" />
            <span className="mono text-[13px] font-semibold">{count}종</span>
            <span className="text-[11px] opacity-60 ml-1">→</span>
          </button>
        </div>
      )}
    </>
  );
}
