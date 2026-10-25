import {
  BEHAVIOR,
  BEHAVIOR_COLOR,
  BEHAVIOR_KEYS,
  THINKING,
  THINKING_KEYS,
  type AttributeKey,
} from "@/lib/attributes";

const TICKS = [0, 25, 50, 75, 100];

/** "How you compare to the general population": one 0-100 bar per attribute, value labeled at the end. */
export function PercentileBars({
  percentiles,
  keys = [...THINKING_KEYS, ...BEHAVIOR_KEYS],
}: {
  percentiles: Record<AttributeKey, number>;
  keys?: AttributeKey[];
}) {
  return (
    <div>
      <div className="space-y-2.5">
        {keys.map((k) => {
          const isThinking = k in THINKING;
          const name = isThinking ? THINKING[k as keyof typeof THINKING].name : BEHAVIOR[k as keyof typeof BEHAVIOR].name;
          const color = isThinking ? THINKING[k as keyof typeof THINKING].color : BEHAVIOR_COLOR;
          const p = percentiles[k];
          return (
            <div
              key={k}
              className="group grid grid-cols-[110px_1fr_36px] items-center gap-3 sm:grid-cols-[130px_1fr_40px]"
              title={`${name}: ${p}th percentile`}
            >
              <span className="truncate text-sm text-ink-soft">{name}</span>
              <div className="relative h-3 rounded-full bg-surface-sunken">
                {[25, 50, 75].map((t) => (
                  <span key={t} className="absolute inset-y-0 w-px bg-white" style={{ left: `${t}%` }} aria-hidden />
                ))}
                <div
                  className="relative h-full rounded-full transition-[filter] group-hover:brightness-110"
                  style={{ width: `${p}%`, background: color }}
                />
              </div>
              <span className="text-right text-sm font-semibold tabular-nums">{p}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-[110px_1fr_36px] gap-3 sm:grid-cols-[130px_1fr_40px]" aria-hidden>
        <span />
        <div className="relative h-4 text-[11px] text-ink-muted">
          {TICKS.map((t) => (
            <span key={t} className="absolute -translate-x-1/2 tabular-nums" style={{ left: `${t}%` }}>
              {t}
            </span>
          ))}
        </div>
        <span />
      </div>
      <p className="mt-1 text-center text-xs text-ink-muted">Percentile vs. general population</p>
    </div>
  );
}
