"use client";

type Props = {
  to: number;
  /** starting value — kept for API compatibility, no longer used (no count-up). */
  from?: number;
  /** duration — kept for API compatibility, no longer used. */
  duration?: number;
  /** delay — kept for API compatibility, no longer used. */
  delay?: number;
  decimals?: number;
  format?: (n: number) => string;
  /** thousands separator — default ",". Set "" for years/IDs. */
  separator?: string;
  className?: string;
};

function formatValue(n: number, decimals: number, separator: string, format?: (n: number) => string) {
  if (format) return format(n);
  const fixed = n.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return decPart !== undefined ? `${grouped}.${decPart}` : grouped;
}

export default function Counter({
  to,
  decimals = 0,
  format,
  separator = ",",
  className = "",
}: Props) {
  return <span className={`tabular ${className}`}>{formatValue(to, decimals, separator, format)}</span>;
}
