import { FRAMING_SCALE, framingIndex } from "../utils/helpers";

export default function FramingScale({ value }) {
  const idx = framingIndex(value);
  if (idx === -1) {
    return <span className="framing-fallback">{value || "—"}</span>;
  }
  return (
    <span className="framing-scale" title={FRAMING_SCALE[idx]}>
      {FRAMING_SCALE.map((_, i) => (
        <span key={i} className={i === idx ? "framing-dot active" : "framing-dot"} />
      ))}
    </span>
  );
}
