"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  to: number;
  duration?: number;
  decimals?: number;
  format?: (n: number) => string;
  className?: string;
};

export default function Counter({ to, duration = 1500, decimals, format, className = "" }: Props) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = () => {
      if (started.current) return;
      started.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setVal(to * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) start(); }),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  const text = format
    ? format(val)
    : typeof decimals === "number"
      ? val.toFixed(decimals)
      : Math.round(val).toLocaleString();
  return <span ref={ref} className={`tabular ${className}`}>{text}</span>;
}
