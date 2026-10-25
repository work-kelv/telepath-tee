import { BEHAVIOR, BEHAVIOR_COLOR, type BehaviorKey, type Third } from "@/lib/attributes";
import { spectrumLabel, thirdLabel } from "@/lib/insights";

/** One behavioral continuum, split into thirds (0-33 / 34-66 / 67-100) with a marker at the percentile. */
export function BehaviorSpectrum({ attr, percentile, third }: { attr: BehaviorKey; percentile: number; third: Third }) {
  const b = BEHAVIOR[attr];
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
        <h4 className="font-semibold">{b.name}</h4>
        <span className="text-sm text-ink-soft">
          <span className="font-semibold tabular-nums text-ink">{percentile}</span>th percentile &middot;{" "}
          {spectrumLabel(attr, percentile)} &middot; {thirdLabel(third)}
        </span>
      </div>
      <div className="relative h-3" title={`${b.name}: ${percentile}th percentile`}>
        <div className="absolute inset-0 flex gap-[2px] overflow-hidden rounded-full">
          {[1, 2, 3].map((t) => (
            <div
              key={t}
              className="h-full flex-1"
              style={{ background: BEHAVIOR_COLOR, opacity: t === third ? 0.85 : 0.18 }}
            />
          ))}
        </div>
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow"
          style={{ left: `${Math.min(97, Math.max(3, percentile))}%`, background: BEHAVIOR_COLOR }}
          aria-hidden
        />
      </div>
      <div className="mt-1.5 grid grid-cols-5 text-center text-[11px] text-ink-muted">
        {b.spectrum.map((l) => (
          <span key={l} className="truncate">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
