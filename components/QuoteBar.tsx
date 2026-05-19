"use client";
import { useState, useEffect } from "react";
import QuotePanel from "./QuotePanel";

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
      <QuotePanel open={open} onClose={() => setOpen(false)} />
      {count > 0 && !open && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <button
            onClick={() => setOpen(true)}
            className="pointer-events-auto flex items-center gap-3 bg-ink text-paper px-7 py-3.5 shadow-2xl hover:bg-edred transition-colors border border-white/10"
          >
            <span className="text-[13px] font-medium tracking-tight">견적서 작성 중</span>
            <span className="w-px h-3.5 bg-white/30" aria-hidden="true" />
            <span className="mono text-[13px] font-semibold">{count}종</span>
            <span className="text-[11px] opacity-60 ml-1">→</span>
          </button>
        </div>
      )}
    </>
  );
}
