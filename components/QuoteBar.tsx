"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import QuotePanel from "./QuotePanel";
import QuotePreviewModal from "./QuotePreviewModal";

// 플로팅 버튼을 표시할 페이지 목록
const QUOTE_ALLOWED_PATHS = ["/products", "/"];

export default function QuoteBar() {
  const { status } = useSession();
  const pathname = usePathname();
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

  // 허용 페이지에서만 열림 상태 유지 (비허용 페이지에서는 파생값으로 자동 닫힘)
  const isAllowed = QUOTE_ALLOWED_PATHS.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  );
  const effectiveOpen = isAllowed ? open : false;
  const effectiveFullscreen = isAllowed ? fullscreenMode : false;

  // next-auth 초기화 중 깜빡임 방지
  if (status === "loading") return null;
  if (count === 0 && !effectiveOpen) return null;

  return (
    <>
      {/* 다크 견적서 미리보기 (fullscreen 시 전체화면) */}
      <QuotePreviewModal
        open={effectiveOpen}
        onClose={() => { setOpen(false); setFullscreenMode(false); }}
        fullscreen={effectiveFullscreen}
      />
      {/* 오른쪽 견적 카트 패널 (fullscreen 모드일 때 숨김) */}
      {!effectiveFullscreen && <QuotePanel open={effectiveOpen} onClose={() => setOpen(false)} />}

      {/* 하단 플로팅 버튼: 허용 페이지에서만 표시 */}
      {count > 0 && !effectiveOpen && isAllowed && (
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
