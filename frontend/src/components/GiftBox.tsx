interface GiftBoxProps {
  open?: boolean;
  color?: string;
}

// El mismo diseño que el favicon.ico (caja + moño), pero como SVG en vivo
// para poder animar la tapa y el moño cuando se revela la caja.
export function GiftBox({ open = false, color }: GiftBoxProps) {
  const boxColor = color ?? "var(--stellar-gold)";

  return (
    <svg
      viewBox="0 0 200 200"
      width="120"
      height="120"
      className={`gift-box${open ? " gift-box--open" : ""}`}
      role="img"
      aria-label={open ? "Caja de regalo abierta" : "Caja de regalo cerrada"}
    >
      <rect
        className="gift-box__body"
        x="24"
        y="84"
        width="152"
        height="96"
        rx="11"
        fill={boxColor}
      />
      <rect
        className="gift-box__ribbon-v"
        x="88"
        y="84"
        width="24"
        height="96"
        fill="var(--stellar-black)"
      />
      <g className="gift-box__lid">
        <rect x="16" y="64" width="168" height="30" rx="9" fill={boxColor} />
        <rect x="16" y="74" width="168" height="10" fill="var(--stellar-black)" />
      </g>
      <g className="gift-box__bow">
        <polygon points="100,66 58,30 82,40 92,60" fill="var(--stellar-black)" />
        <polygon points="100,66 142,30 118,40 108,60" fill="var(--stellar-black)" />
        <circle cx="100" cy="60" r="11" fill="var(--stellar-black)" />
      </g>
    </svg>
  );
}
