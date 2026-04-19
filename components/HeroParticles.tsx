"use client";
import { useEffect, useState, type CSSProperties } from "react";

type Dot = {
  top: string;
  left: string;
  fx: string;
  fy: string;
  dur: number;
  delay: number;
};

export default function HeroParticles({ count = 16 }: { count?: number }) {
  const [dots, setDots] = useState<Dot[]>([]);
  useEffect(() => {
    setDots(
      Array.from({ length: count }).map(() => ({
        top: `${5 + Math.random() * 85}%`,
        left: `${3 + Math.random() * 92}%`,
        fx: `${(Math.random() - 0.5) * 110}px`,
        fy: `${(Math.random() - 0.5) * 110}px`,
        dur: 6 + Math.random() * 9,
        delay: Math.random() * 5,
      }))
    );
  }, [count]);

  if (dots.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {dots.map((d, i) => (
        <span
          key={i}
          className="float-dot"
          style={{
            top: d.top,
            left: d.left,
            ["--fx" as keyof CSSProperties]: d.fx,
            ["--fy" as keyof CSSProperties]: d.fy,
            ["--fdur" as keyof CSSProperties]: `${d.dur}s`,
            ["--fd" as keyof CSSProperties]: `${d.delay}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
