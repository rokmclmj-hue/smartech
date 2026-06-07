"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import QuotePanel from "./QuotePanel";
import QuotePreviewModal from "./QuotePreviewModal";

export default function QuoteBar() {
  const { status } = useSession();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);

  useEffect(() => {
    function readCount() {
      try {
        const stored = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
        setCount(Array.isArray(stored) ? stored.length : 0);
      } catch {
        setCount(0);
      }
    }
    function openFullscreen() {
      readCount();
      setFullscreenMode(true);
      setOpen(true);
    }
    readCount();
    window.addEventListener("quoteCartUpdated", readCount);
    window.addEventListener("storage", readCount);
    window.addEventListener("openScanQuote", openFullscreen);
    return () => {
      window.removeEventListener("quoteCartUpdated", readCount);
      window.removeEventListener("storage", readCount);
      window.removeEventListener("openScanQuote", openFullscreen);
    };
  }, []);

  // next-auth 초기화 중 깜빡임 방지
  if (status === "loading") return null;
  if (count === 0 && !open) return null;

  return (
    <>
      {/* 다크 견적서 미리보기 (fullscreen 시 전체화면) */}
      <QuotePreviewModal
        open={open}
        onClose={() => { setOpen(false); setFullscreenMode(false); }}
        fullscreen={fullscreenMode}
      />
      {/* 오른쪽 견적 카트 패널 (fullscreen 모드일 때 숨김) */}
      {!fullscreenMode && <QuotePanel open={open} onClose={() => setOpen(false)} />}

      {/* 하단 플로팅 버튼 */}
      {count > 0 && !open && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-60 pointer-events-none">
          <button
            onClick={() => setOpen(true)}
            className="pointer-events-auto flex items-center gap-3 bg-edred text-paper px-7 py-3.5 shadow-2xl hover:bg-ink transition-colors border border-white/10"
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
