"use client";

import { useState } from "react";
import {
  ATTRIBUTE_KEYS,
  BEHAVIOR_COLOR,
  THINKING,
  attributeName,
  type AttributeKey,
  type ThinkingKey,
} from "@/lib/attributes";

interface Person {
  id: string;
  name: string;
  percentiles: Record<AttributeKey, number>;
}

const colorOf = (k: AttributeKey) => (k in THINKING ? THINKING[k as ThinkingKey].color : BEHAVIOR_COLOR);

/**
 * Combined-scores dot chart: one dot per person on each attribute's 0-100 percentile line,
 * plus a group-average marker. Shows how an average is made up, e.g. two extremes vs. a cluster.
 */
export function DotChart({ people, averages }: { people: Person[]; averages: Record<AttributeKey, number> }) {
  const [hover, setHover] = useState<{ id: string; attr: AttributeKey } | null>(null);
  const hoveredPerson = hover ? people.find((p) => p.id === hover.id) : null;

  return (
    <div>
      <div className="mb-3 flex min-h-[20px] flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-muted/60" /> One person
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rotate-45 border-2 border-white bg-ink shadow-sm" /> Group average
        </span>
        {hoveredPerson && hover && (
          <span className="ml-auto font-medium text-ink">
            {hoveredPerson.name}: {attributeName(hover.attr)} {hoveredPerson.percentiles[hover.attr]}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {ATTRIBUTE_KEYS.map((k) => (
          <div key={k} className="grid grid-cols-[100px_1fr_32px] items-center gap-3 sm:grid-cols-[120px_1fr_36px]">
            <span className="truncate text-sm text-ink-soft">{attributeName(k)}</span>
            <div className="relative h-8">
              <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
              {[33, 67].map((t) => (
                <div key={t} className="absolute top-1.5 h-5 w-px bg-line" style={{ left: `${t}%` }} />
              ))}
              {people.map((p) => {
                const active = hover?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className="absolute top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                    style={{ left: `${p.percentiles[k]}%` }}
                    onMouseEnter={() => setHover({ id: p.id, attr: k })}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover({ id: p.id, attr: k })}
                    onBlur={() => setHover(null)}
                    aria-label={`${p.name}, ${attributeName(k)}: ${p.percentiles[k]}`}
                  >
                    <span
                      className="block rounded-full border-2 border-white transition-all"
                      style={{
                        width: active ? 14 : 10,
                        height: active ? 14 : 10,
                        background: colorOf(k),
                        opacity: hover && !active ? 0.35 : 0.85,
                      }}
                    />
                  </button>
                );
              })}
              <div
                className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-white bg-ink shadow-sm"
                style={{ left: `${averages[k]}%` }}
                aria-hidden
              />
            </div>
            <span className="text-right text-sm font-semibold tabular-nums" title="Group average">
              {averages[k]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-[100px_1fr_32px] gap-3 sm:grid-cols-[120px_1fr_36px]" aria-hidden>
        <span />
        <div className="relative h-4 text-[11px] text-ink-muted">
          {[0, 33, 67, 100].map((t) => (
            <span key={t} className="absolute -translate-x-1/2 tabular-nums" style={{ left: `${t}%` }}>
              {t}
            </span>
          ))}
        </div>
        <span />
      </div>
    </div>
  );
}
