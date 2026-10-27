import { THINKING, type ThinkingKey } from "@/lib/attributes";

// A thinking-mix pie drawn the way Emergenetics profiles draw it: slices run clockwise from
// the top as Conceptual, Social, Structural, Analytical, so Analytical sits top-left,
// Conceptual top-right, Social bottom-right and Structural bottom-left. Every color has a
// slice, sized by its share; preferences (23% or more) are labeled. The purple ring stands
// for the three behaviors that sit around the thinking attributes.

const ORDER: ThinkingKey[] = ["conceptual", "social", "structural", "analytical"];
const PREFERENCE = 23;

function point(deg: number, r: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [60 + r * Math.cos(rad), 60 + r * Math.sin(rad)];
}

export function ModelCircle({ mix, size = 120 }: { mix: Record<ThinkingKey, number>; size?: number }) {
  const label = `Thinking mix: ${ORDER.map((k) => `${THINKING[k].name} ${mix[k]}%`).join(", ")}`;
  let start = 0;
  const slices = ORDER.map((k) => {
    const sweep = (mix[k] / 100) * 360;
    const s = { key: k, from: start, to: start + sweep };
    start += sweep;
    return s;
  });
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={label} className="shrink-0">
      <title>{label}</title>
      <circle cx="60" cy="60" r="57.5" fill="none" stroke="#7C4DCC" strokeOpacity="0.35" strokeWidth="3" />
      {slices.map((s) => {
        const [x1, y1] = point(s.from, 52);
        const [x2, y2] = point(s.to, 52);
        const large = s.to - s.from > 180 ? 1 : 0;
        return (
          <path
            key={s.key}
            d={`M60 60 L${x1.toFixed(2)} ${y1.toFixed(2)} A52 52 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`}
            fill={THINKING[s.key].color}
            stroke="#ffffff"
            strokeWidth="2"
          />
        );
      })}
      {slices
        .filter((s) => mix[s.key] >= PREFERENCE)
        .map((s) => {
          // Conceptual and Analytical slices start at the top, where the pie is narrowest, so unless they
          // fill half the pie their labels sit just above the centre line, where there is room for them.
          const nearTop = (s.key === "conceptual" || s.key === "analytical") && mix[s.key] < 50;
          const [x, y] = nearTop
            ? [s.key === "conceptual" ? 85 : 35, 47]
            : point((s.from + s.to) / 2, mix[s.key] >= 50 ? 24 : 31);
          return (
            <text
              key={s.key}
              x={x}
              y={y + 3}
              textAnchor="middle"
              fontSize="8"
              fontWeight={700}
              fill={s.key === "conceptual" ? "#1c1c1a" : "#ffffff"}
            >
              {THINKING[s.key].name}
            </text>
          );
        })}
    </svg>
  );
}
