import { THINKING, type ThinkingKey } from "@/lib/attributes";

// The Emergenetics model as drawn in the workshop: a circle in four quadrants, Analytical
// top-left, Conceptual top-right, Structural bottom-left and Social bottom-right. Preferred
// quadrants are filled in their color; the rest stay pale. The purple ring stands for the
// three behaviors that sit around the thinking attributes.

const QUADRANTS: Array<{ key: ThinkingKey; path: string; x: number; y: number }> = [
  { key: "analytical", path: "M60 60 L8 60 A52 52 0 0 1 60 8 Z", x: 35, y: 50 },
  { key: "conceptual", path: "M60 60 L60 8 A52 52 0 0 1 112 60 Z", x: 85, y: 50 },
  { key: "social", path: "M60 60 L112 60 A52 52 0 0 1 60 112 Z", x: 85, y: 76 },
  { key: "structural", path: "M60 60 L60 112 A52 52 0 0 1 8 60 Z", x: 35, y: 76 },
];

const PALE = "#ecebe6";
const PALE_TEXT = "#9a9a92";

export function ModelCircle({ colors, size = 120 }: { colors: ThinkingKey[]; size?: number }) {
  const preferred = new Set(colors);
  const label = `Thinking preferences: ${colors.map((k) => THINKING[k].name).join(", ")}`;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={label} className="shrink-0">
      <title>{label}</title>
      <circle cx="60" cy="60" r="57.5" fill="none" stroke="#7C4DCC" strokeOpacity="0.35" strokeWidth="3" />
      {QUADRANTS.map((q) => {
        const on = preferred.has(q.key);
        return (
          <g key={q.key}>
            <path d={q.path} fill={on ? THINKING[q.key].color : PALE} stroke="#ffffff" strokeWidth="2.5" />
            <text
              x={q.x}
              y={q.y}
              textAnchor="middle"
              fontSize="8"
              fontWeight={on ? 700 : 500}
              fill={on ? (q.key === "conceptual" ? "#1c1c1a" : "#ffffff") : PALE_TEXT}
            >
              {THINKING[q.key].name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
