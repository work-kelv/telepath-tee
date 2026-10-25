"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { THINKING, THINKING_KEYS, type ThinkingKey } from "@/lib/attributes";
import { PREFERENCE_THRESHOLD } from "@/lib/scoring";

/** The "How you think: percentages" pie. Every slice is direct-labeled (colour is never the only cue). */
export function ThinkingPie({ percentages }: { percentages: Record<ThinkingKey, number> }) {
  const data = THINKING_KEYS.map((k) => ({ key: k, name: THINKING[k].name, value: percentages[k] }));

  return (
    <div className="grid items-center gap-5 sm:grid-cols-[200px_1fr] lg:grid-cols-1">
      <div className="mx-auto h-[200px] w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={54}
              outerRadius={96}
              startAngle={90}
              endAngle={-270}
              stroke="#ffffff"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={THINKING[d.key].color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number, n: string) => [`${v}%`, n]}
              contentStyle={{ borderRadius: 10, border: "1px solid #e4e4df", fontSize: 13 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid grid-cols-2 gap-3">
        {data.map((d) => {
          const preferred = d.value >= PREFERENCE_THRESHOLD;
          return (
            <li key={d.key} className="min-w-0 rounded-xl border border-line p-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: THINKING[d.key].color }} aria-hidden />
                <span className="truncate text-xs font-medium text-ink-soft">{d.name}</span>
              </div>
              <div className="mt-0.5">
                <div className="text-xl font-semibold tabular-nums">{d.value}%</div>
                <div className={`text-xs ${preferred ? "font-medium text-ink" : "text-ink-muted"}`}>
                  {preferred ? "Preference" : "Not preferred"}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
