"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";

type Dot = {
  top: string;
  left: string;
  size: number; // px, varied 5~16
  fx: string;   // ambient drift offset x
  fy: string;   // ambient drift offset y
  tx: string;   // collection target x (toward logo)
  ty: string;   // collection target y (toward logo)
  delay: number;
};

export default function HeroParticles({ count = 16 }: { count?: number }) {
  const [dots, setDots] = useState<Dot[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find the impeller logo's screen position (sticky in navbar)
    const measure = () => {
      const heroBox = container.getBoundingClientRect();
      const logoEl = document.querySelector(".impeller-svg");
      // Fallback target if logo not found: top-left area
      let logoCx = heroBox.left + 60;
      let logoCy = heroBox.top - 30;
      if (logoEl) {
        const logoBox = logoEl.getBoundingClientRect();
        logoCx = logoBox.left + logoBox.width / 2;
        logoCy = logoBox.top + logoBox.height / 2;
      }

      // Constrain particles to area ABOVE the product strip (the rectangular box at hero bottom)
      const stripEl = document.querySelector(".mrqw");
      let maxTopPct = 88;
      if (stripEl) {
        const stripBox = stripEl.getBoundingClientRect();
        const availableHeight = Math.max(60, stripBox.top - heroBox.top - 24);
        maxTopPct = Math.max(20, (availableHeight / heroBox.height) * 100);
      }

      // Mobile: smaller dots + fewer particles
      const isMobile = window.innerWidth < 768;
      const effectiveCount = isMobile ? Math.round(count * 0.7) : count;
      const sizeScale = isMobile ? 0.5 : 1;

      setDots(
        Array.from({ length: effectiveCount }).map(() => {
          const topPct = 4 + Math.random() * (maxTopPct - 4);
          const leftPct = 3 + Math.random() * 92;
          const xPx = (leftPct / 100) * heroBox.width;
          const yPx = (topPct / 100) * heroBox.height;
          const xScreen = heroBox.left + xPx;
          const yScreen = heroBox.top + yPx;
          // ambient float drift: random ±75px in any direction (bigger drift)
          const fx = (Math.random() - 0.5) * 150;
          const fy = (Math.random() - 0.5) * 150;
          // varied size: 5px (small) ~ 16px (large), weighted toward smaller; mobile halves
          // 10% of particles get a 1.3× size boost (larger accent dots)
          const sizeRand = Math.random();
          const sizeBoost = Math.random() < 0.1 ? 1.3 : 1;
          const size = Math.max(3, Math.round((5 + Math.pow(sizeRand, 1.5) * 11) * sizeScale * sizeBoost));
          return {
            top: `${topPct}%`,
            left: `${leftPct}%`,
            size,
            fx: `${fx.toFixed(0)}px`,
            fy: `${fy.toFixed(0)}px`,
            tx: `${(logoCx - xScreen).toFixed(0)}px`,
            ty: `${(logoCy - yScreen).toFixed(0)}px`,
            // very tight stagger — all particles start within 0.8s
            delay: Math.random() * 0.8,
          };
        })
      );
    };

    // Defer measurement until layout is stable
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-visible z-0"
      aria-hidden
    >
      {dots.map((d, i) => (
        <span
          key={i}
          className="float-dot"
          style={{
            top: d.top,
            left: d.left,
            width: `${d.size}px`,
            height: `${d.size}px`,
            ["--fx" as keyof CSSProperties]: d.fx,
            ["--fy" as keyof CSSProperties]: d.fy,
            ["--tx" as keyof CSSProperties]: d.tx,
            ["--ty" as keyof CSSProperties]: d.ty,
            ["--fd" as keyof CSSProperties]: `${d.delay}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
