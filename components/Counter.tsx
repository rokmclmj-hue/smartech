"use client";
import CountUp from "react-countup";

type Props = {
  to: number;
  /** starting value (default 0). For count-down, set from > to. */
  from?: number;
  /** duration — ms if >= 100, otherwise treated as seconds. Default 3.6s. */
  duration?: number;
  /** delay — ms if >= 100, otherwise treated as seconds. Default 0.9s. */
  delay?: number;
  decimals?: number;
  format?: (n: number) => string;
  /** thousands separator — default ",". Set "" for years/IDs. */
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
