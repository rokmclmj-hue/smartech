type Props = { className?: string };

export default function ImpellerLogo({ className = "" }: Props) {
  // 6 swept blades evenly spaced (60° apart)
  const blades = [0, 60, 120, 180, 240, 300];
  return (
    <svg
      viewBox="0 0 40 40"
      className={`impeller-svg shrink-0 ${className}`}
      aria-label="Smartech impeller mark"
      role="img"
    >
      {/* outer housing ring (static) */}
      <circle
        cx="20"
        cy="20"
        r="18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
      />
      {/* tiny tick marks at cardinal points */}
      {[0, 90, 180, 270].map((a) => (
        <line
          key={a}
          x1="20"
          y1="2"
          x2="20"
          y2="4.5"
          stroke="currentColor"
          strokeWidth="0.9"
          opacity="0.45"
          transform={`rotate(${a} 20 20)`}
        />
      ))}

      {/* rotating impeller (blades + hub) */}
      <g className="impeller-rotor">
        {blades.map((a) => (
          <path
            key={a}
            d="M 20 20 Q 25 11 20 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            transform={`rotate(${a} 20 20)`}
          />
        ))}
        {/* hub — brand red */}
        <circle cx="20" cy="20" r="3.2" fill="#c00020" />
        <circle cx="20" cy="20" r="1.1" fill="#F6F4EF" />
      </g>

    </svg>
  );
}
