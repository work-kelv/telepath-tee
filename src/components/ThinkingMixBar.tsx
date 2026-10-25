import { THINKING, THINKING_KEYS, type ThinkingKey } from "@/lib/attributes";

/** A compact 100% stacked bar of the four thinking percentages, with 2px gaps and in-segment labels. */
export function ThinkingMixBar({
  percentages,
  height = 28,
  compact = false,
}: {
  percentages: Record<ThinkingKey, number>;
  height?: number;
  /** Narrow contexts (tables): numbers only, so labels never wrap. */
  compact?: boolean;
}) {
  const label = (k: ThinkingKey) => {
    const p = percentages[k];
    if (compact) return p >= 12 ? `${p}%` : "";
    return p >= 24 ? `${THINKING[k].short} ${p}%` : p >= 9 ? `${p}%` : "";
  };
  return (
    <div className="flex w-full gap-[2px] overflow-hidden rounded-lg" style={{ height }}>
      {THINKING_KEYS.filter((k) => percentages[k] > 0).map((k) => (
        <div
          key={k}
          className="flex items-center justify-center overflow-hidden whitespace-nowrap text-[11px] font-semibold"
          style={{ width: `${percentages[k]}%`, background: THINKING[k].color, color: k === "conceptual" ? "#1c1c1a" : "#fff" }}
          title={`${THINKING[k].name}: ${percentages[k]}%`}
        >
          {label(k)}
        </div>
      ))}
    </div>
  );
}
