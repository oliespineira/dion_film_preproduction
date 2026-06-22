import { FIXTURE_TYPES } from "../utils/helpers";

export default function FixtureIcon({ type, rotation }) {
  const meta = FIXTURE_TYPES.find((f) => f.key === type) || FIXTURE_TYPES[0];

  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <g transform={`rotate(${rotation} 20 20)`}>
        {meta.hasBeam && (
          <polygon
            points="20,20 11,-6 29,-6"
            fill={type === "camera" ? "#9a9a9a" : type === "reflector" ? "#d8d8d8" : "#f3d34a"}
            opacity="0.45"
          />
        )}

        {type === "fresnel" && <circle cx="20" cy="20" r="9" fill={meta.color} stroke="#2b2420" strokeWidth="1.5" />}

        {type === "softbox" && <rect x="11" y="11" width="18" height="18" fill={meta.color} stroke="#2b2420" strokeWidth="1.5" />}

        {type === "led_panel" && <rect x="6" y="16" width="28" height="8" fill={meta.color} stroke="#2b2420" strokeWidth="1.2" />}

        {type === "par" && <circle cx="20" cy="20" r="6" fill={meta.color} stroke="#2b2420" strokeWidth="1.5" />}

        {type === "practical" && (
          <>
            <circle cx="20" cy="20" r="6" fill={meta.color} stroke="#2b2420" strokeWidth="1.2" />
            <line x1="20" y1="11" x2="20" y2="7" stroke="#2b2420" strokeWidth="1.2" />
            <line x1="13" y1="14" x2="10" y2="11" stroke="#2b2420" strokeWidth="1.2" />
            <line x1="27" y1="14" x2="30" y2="11" stroke="#2b2420" strokeWidth="1.2" />
          </>
        )}

        {type === "reflector" && <circle cx="20" cy="20" r="9" fill={meta.color} stroke="#2b2420" strokeWidth="1.5" />}

        {type === "flag" && <rect x="6" y="17" width="28" height="6" fill={meta.color} />}

        {type === "camera" && (
          <>
            <rect x="11" y="15" width="14" height="10" fill={meta.color} />
            <polygon points="25,17 32,14 32,26 25,23" fill={meta.color} />
          </>
        )}

        {type === "actor" && (
          <>
            <circle cx="20" cy="14" r="5" fill={meta.color} />
            <path d="M12 30 Q20 18 28 30" stroke={meta.color} strokeWidth="3" fill="none" />
          </>
        )}
      </g>
    </svg>
  );
}
