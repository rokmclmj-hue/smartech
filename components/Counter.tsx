"use client";
import { useEffect, useState } from "react";
import CountUp from "react-countup";

type Props = {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  format?: (n: number) => string;
  separator?: string;
  className?: string;
};

function toSeconds(v: number) {
  return v >= 100 ? v / 1000 : v;
}

export default function Counter({
  to,
  from = 0,
  duration = 3.6,
  delay = 0.9,
  decimals,
  format,
  separator = ",",
  className = "",
}: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("intro-playing")) {
      const handler = () => setReady(true);
      window.addEventListener("intro:done", handler, { once: true });
      return () => window.removeEventListener("intro:done", handler);
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return <span className={`tabular ${className}`}>0</span>;
  }

  return (
    <CountUp
      start={from}
      end={to}
      duration={toSeconds(duration)}
      delay={toSeconds(delay)}
      decimals={decimals ?? 0}
      formattingFn={format}
      preserveValue
      useEasing
      separator={separator}
      className={`tabular ${className}`}
    />
  );
}
