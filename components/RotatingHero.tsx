"use client";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

type Slide = {
  line1: ReactNode;
  line2: ReactNode;
  accent?: 1 | 2;
  durationMs: number;
};

const SLIDES: Slide[] = [
  {
    line1: "세계 1등 진공을,",
    line2: "한국의 속도로.",
    accent: 2,
    durationMs: 8571,
  },
  {
    line1: "Trusted Partner,",
    line2: "Advanced Solution.",
    accent: 2,
    durationMs: 2857,
  },
];

export default function RotatingHero() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % SLIDES.length), SLIDES[idx].durationMs);
    return () => clearTimeout(t);
  }, [idx, paused]);

  const s = SLIDES[idx];
  const cls1 = s.accent === 1 ? "italic text-edred" : "";
  const cls2 = s.accent === 2 ? "italic text-edred" : "";

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h1 key={idx} className="hero-h1 display">
        <span className="mask-line">
          <span
            className={cls1}
            style={{ ["--md" as keyof CSSProperties]: "0.05s" } as CSSProperties}
          >
            {s.line1}
          </span>
        </span>
        <span className="mask-line">
          <span
            className={cls2}
            style={{ ["--md" as keyof CSSProperties]: "0.22s" } as CSSProperties}
          >
            {s.line2}
          </span>
        </span>
      </h1>

      <div className="mt-7 flex items-center gap-1.5" role="tablist" aria-label="메인 슬로건">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === idx}
            aria-label={`슬로건 ${i + 1}/${SLIDES.length}`}
            onClick={() => setIdx(i)}
            className={`h-[2px] transition-all duration-500 ease-out ${
              i === idx ? "w-10 bg-edred" : "w-3 bg-ink/25 hover:bg-ink/60"
            }`}
          />
        ))}
        <span className="ml-3 text-[10px] mono dim tabular">
          {String(idx + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
