import { THINKING, THINKING_KEYS, type ThinkingKey } from "@/lib/attributes";
import { animalImage, type Animal } from "@/lib/animals";

// An animal in a round frame whose border is a ring in the thinking colors.
//  - Type ring (no percentages): four equal arcs in the model's positions (Conceptual
//    top-right, Social bottom-right, Structural bottom-left, Analytical top-left); the
//    animal's preferred colors are filled, the rest pale.
//  - Person ring (with percentages): arcs sized by that person's thinking mix, in the
//    same clockwise order from the top, like the profile pie.

const ORDER: ThinkingKey[] = ["conceptual", "social", "structural", "analytical"];
const PALE = "#e8e6df";

function arc(cx: number, cy: number, r: number, from: number, to: number): string {
  const p = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(rad)).toFixed(2)} ${(cy + r * Math.sin(rad)).toFixed(2)}`;
  };
  return `M ${p(from)} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${p(to)}`;
}

export function AnimalPortrait({
  animal,
  percentages,
  size = 160,
  label,
}: {
  animal: Animal;
  percentages?: Record<ThinkingKey, number>;
  size?: number;
  /** Small pill over the bottom of the ring, e.g. "1% of people". */
  label?: string;
}) {
  const c = 100;
  const ringR = 92;
  const ring = 10;
  const gap = 2.5; // degrees of white between arcs
  const clipId = `clip-${animal.image.replace(/\W/g, "")}-${percentages ? "p" : "t"}`;

  const segments: Array<{ key: ThinkingKey; from: number; to: number; on: boolean }> = [];
  if (percentages) {
    let a = 0;
    for (const k of ORDER) {
      const sweep = (percentages[k] / 100) * 360;
      if (sweep > gap * 1.5) segments.push({ key: k, from: a + gap / 2, to: a + sweep - gap / 2, on: true });
      a += sweep;
    }
  } else {
    ORDER.forEach((k, i) =>
      segments.push({ key: k, from: i * 90 + gap / 2, to: (i + 1) * 90 - gap / 2, on: animal.colors.includes(k) }),
    );
  }

  // Pill width follows the label (about 6.6 units per character at this font size).
  const pill = label ? Math.round(label.length * 6.6 + 16) : 0;

  const described = percentages
    ? THINKING_KEYS.map((k) => `${THINKING[k].name} ${percentages[k]}%`).join(", ")
    : animal.colors.map((k) => THINKING[k].name).join(", ");

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={`${animal.name}. ${described}`} className="shrink-0">
      <defs>
        <clipPath id={clipId}>
          <circle cx={c} cy={c} r={ringR - ring / 2 - 3} />
        </clipPath>
      </defs>
      <circle cx={c} cy={c} r={ringR - ring / 2 - 3} fill="#fbeedb" />
      <image
        href={animalImage(animal)}
        x={-42}
        y={-6}
        width={284}
        height={213}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
      {segments.map((s) => (
        <path
          key={s.key}
          d={arc(c, c, ringR, s.from, s.to)}
          fill="none"
          stroke={s.on ? THINKING[s.key].color : PALE}
          strokeWidth={ring}
          strokeLinecap="butt"
        />
      ))}
      {label && (
        <g>
          <rect x={c - pill / 2} y={c + ringR - 14} width={pill} height={22} rx={11} fill="#1c1c1a" />
          <text x={c} y={c + ringR + 1.5} textAnchor="middle" fontSize="11.5" fontWeight={700} fill="#ffffff">
            {label}
          </text>
        </g>
      )}
    </svg>
  );
}
