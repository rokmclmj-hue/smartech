type Props = {
  /** true: show full "EDWARDS / Authorized Distributor" lockup */
  full?: boolean;
  /** CSS size override. For `full`, applies to height; for inline, applies to height (width auto-calculates from aspect ratio) */
  size?: string;
  className?: string;
};

/**
 * Edwards brand mark.
 * - Default (inline): tight-cropped EDWARDS wordmark sized to blend with surrounding text.
 *   Uses `/edwards-wordmark.png` (1529×322, ratio 4.748:1) via the `.ed-mark` class.
 * - `full`: full lockup (EDWARDS + Authorized Distributor). For hero / auth cards.
 */
export default function EdwardsMark({ full = false, size, className = "" }: Props) {
  if (full) {
    return (
      <img
        src="/edwards-logo.png"
        alt="Edwards — Authorized Distributor"
        className={`inline-block ${className}`}
        style={{ height: size || "3.2em", width: "auto" }}
      />
    );
  }
  return (
    <span
      aria-label="Edwards"
      role="img"
      className={`ed-mark ${className}`}
      style={size ? { height: size } : undefined}
    />
  );
}
