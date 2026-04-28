"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  duration?: number;
};

export default function HeroVideoIntro({ children, duration = 7000 }: Props) {
  const [showVideo, setShowVideo] = useState(true);
  const [progress, setProgress] = useState(0);
  const [cardsIn, setCardsIn] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setProgress(100));
    const timer = setTimeout(() => setShowVideo(false), duration);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [duration]);

  useEffect(() => {
    if (!showVideo) {
      const raf = requestAnimationFrame(() => setCardsIn(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [showVideo]);

  if (showVideo) {
    return (
      <div className="relative aspect-square w-full bg-gradient-to-br from-ink/[0.03] via-paper to-edred/[0.05] border-2 border-dashed border-edred/30 overflow-hidden">
        <span className="absolute inset-0 bg-[linear-gradient(transparent_0,transparent_3px,rgba(0,0,0,0.025)_4px)] bg-[length:100%_4px] pointer-events-none" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="text-[56px] md:text-[80px] leading-none mb-2">🎬</div>
          <div className="display text-[22px] md:text-[28px] tracking-tight">7초 영상 자리</div>
          <div className="mono text-[11px] md:text-[12px] mt-3 dim tracking-widest">1080 × 1080 · 1:1</div>
          <div className="mono text-[10px] md:text-[11px] mt-1 dim">영상 끝나면 카드 등장</div>
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] mono opacity-55 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-edred animate-pulse" />
          <span>preview · {Math.ceil(duration / 1000)}s</span>
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] mono opacity-55 tracking-widest uppercase">placeholder</div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-ink/10">
          <div
            className="h-full bg-edred"
            style={{ width: `${progress}%`, transition: `width ${duration}ms linear` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        opacity: cardsIn ? 1 : 0,
        transform: cardsIn ? "translateY(0)" : "translateY(10px)",
        transition: "opacity .7s ease-out, transform .7s ease-out",
      }}
    >
      {children}
    </div>
  );
}
