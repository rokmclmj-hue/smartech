"use client";
import { useEffect, useState } from "react";

type Props = {
  /** "date" | "time" | "full" — which part to render */
  mode?: "date" | "time" | "full";
  className?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function LiveClock({ mode = "full", className = "" }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    // SSR placeholder — keeps layout stable before hydration
    const placeholder = mode === "date" ? "----.--.--" : mode === "time" ? "--:--:--" : "----.--.--  --:--:--";
    return <span className={`tabular ${className}`} suppressHydrationWarning>{placeholder}</span>;
  }

  const date = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const text = mode === "date" ? date : mode === "time" ? time : `${date}  ${time}`;
  return <span className={`tabular ${className}`} suppressHydrationWarning>{text}</span>;
}
