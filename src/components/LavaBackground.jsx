import { useEffect, useRef } from "react";

const LIGHT_BLOB_COUNT = 3;

export default function LavaBackground() {
  const gooLayerRef = useRef(null);

  useEffect(() => {
    const layer = gooLayerRef.current;
    if (!layer) return;

    const blobs = Array.from(layer.querySelectorAll(".blob"));

    const centerX = window.innerWidth * 0.5;
    const centerY = window.innerHeight * 0.5;

    // Each blob carries its own physics state, starting spread out
    // around the center so the first frame doesn't look like a pile-up.
    const state = blobs.map((el, i) => {
      const angle = (i / blobs.length) * Math.PI * 2;
      const radius = 200 + Math.random() * 150;
      return {
        el,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        mass: 1 + i * 0.25,
        phase: Math.random() * Math.PI * 2,
      };
    });

    // Cursor position for repulsion
    let cursorX = window.innerWidth * 0.5;
    let cursorY = window.innerHeight * 0.5;

    function handlePointerMove(e) {
      cursorX = e.clientX;
      cursorY = e.clientY;
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Each blob drifts toward its own random target, reassigned every
    // few seconds, with a gentle orbit layered on top for organic motion.
    const generateRandomTarget = () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    });
    const targets = state.map(() => generateRandomTarget());
    const targetChangeInterval = 3000; // ms
    let lastTargetChange = 0;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rafId;
    function tick(t) {
      const time = t * 0.001;

      if (t - lastTargetChange > targetChangeInterval) {
        state.forEach((_, i) => {
          targets[i] = generateRandomTarget();
        });
        lastTargetChange = t;
      }

      state.forEach((b, i) => {
        const target = targets[i];

        const angle = b.phase + time * (0.2 + i * 0.03);
        const orbitalX = Math.cos(angle) * 80;
        const orbitalY = Math.sin(angle) * 80;

        const targetX = target.x + orbitalX;
        const targetY = target.y + orbitalY;

        // Soft spring toward the wandering target — heavier blobs (higher
        // mass) accelerate more sluggishly, which reads as "thicker" fluid.
        const stiffness = 0.008;
        const damping = 0.92;
        let ax = (targetX - b.x) * (stiffness / b.mass);
        let ay = (targetY - b.y) * (stiffness / b.mass);

        // Repulsion from the cursor — only ever pushes away, never pulls in.
        const dx = b.x - cursorX;
        const dy = b.y - cursorY;
        const distToCursor = Math.sqrt(dx * dx + dy * dy) || 1;
        const repelRadius = 300;
        if (distToCursor < repelRadius) {
          const repelStrength = (1 - distToCursor / repelRadius) * 15;
          ax += (dx / distToCursor) * repelStrength;
          ay += (dy / distToCursor) * repelStrength;
        }

        b.vx = (b.vx + ax) * damping;
        b.vy = (b.vy + ay) * damping;
        b.x += b.vx;
        b.y += b.vy;

        b.el.style.transform = `translate(${b.x}px, ${b.y}px) translate(-50%, -50%)`;
      });

      if (!reducedMotion) rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="lava-bg" aria-hidden="true">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="lava-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        ref={gooLayerRef}
        className="lava-blobs"
        style={{
          filter: "url(#lava-goo) blur(18px) saturate(1.3) contrast(1.1)",
          transform: "scale(1.1)",
        }}
      >
        {/* Shadow blob — sits underneath for depth */}
        <div
          className="blob"
          style={{
            width: "760px",
            height: "760px",
            borderRadius: "999px",
            position: "absolute",
            top: 0,
            left: 0,
            willChange: "transform",
            background:
              "radial-gradient(circle at 35% 35%, rgba(120,20,0,0.95), rgba(30,8,6,0.95) 40%, rgba(0,0,0,0) 70%)",
            mixBlendMode: "multiply",
            opacity: 0.9,
          }}
        />
        {/* Light blobs — the molten cores */}
        {Array.from({ length: LIGHT_BLOB_COUNT }).map((_, i) => (
          <div
            key={i}
            className="blob"
            style={{
              width: "520px",
              height: "520px",
              borderRadius: "999px",
              position: "absolute",
              top: 0,
              left: 0,
              willChange: "transform",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,250,220,0.95), rgba(255,170,70,0.75) 35%, rgba(255,90,0,0.45) 60%, rgba(0,0,0,0) 72%)",
              mixBlendMode: "screen",
              opacity: 0.95,
            }}
          />
        ))}
      </div>

      <div className="lava-grain-overlay" />
    </div>
  );
}