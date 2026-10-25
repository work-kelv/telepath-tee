"use client";

import { LIKERT } from "@/lib/questions";

/** A 7-point agree/disagree scale built on native radios, so keyboard and screen readers work out of the box. */
export function LikertScale({
  name,
  value,
  onChange,
  invalid,
}: {
  name: string;
  value?: number;
  onChange: (v: number) => void;
  invalid?: boolean;
}) {
  return (
    <fieldset>
      <legend className="sr-only">How much do you agree?</legend>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {LIKERT.map((opt) => {
          const selected = value === opt.value;
          const intensity = Math.abs(opt.value - 4);
          return (
            <label key={opt.value} className="group cursor-pointer" title={opt.label}>
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="peer sr-only"
              />
              <span
                className={[
                  "flex aspect-square w-full items-center justify-center rounded-full border-2 text-sm font-semibold transition",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2",
                  selected
                    ? "border-ink bg-ink text-white"
                    : invalid
                      ? "border-social/60 bg-white text-ink-soft group-hover:border-ink"
                      : "border-line bg-white text-ink-soft group-hover:border-ink",
                ].join(" ")}
                style={{ transform: `scale(${0.8 + intensity * 0.067})` }}
              >
                {opt.value}
              </span>
            </label>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-ink-muted">
        <span>Strongly disagree</span>
        <span className="hidden sm:inline">Neutral</span>
        <span>Strongly agree</span>
      </div>
    </fieldset>
  );
}
