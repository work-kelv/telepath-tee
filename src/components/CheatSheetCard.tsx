"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";
import { toPng } from "html-to-image";
import { BEHAVIOR, BEHAVIOR_KEYS, THINKING, type BehaviorKey, type ThinkingKey } from "@/lib/attributes";
import type { CheatSheet } from "@/lib/insights";
import { ThinkingMixBar } from "./ThinkingMixBar";

interface Props {
  code: string;
  name: string;
  title: string;
  percentages: Record<ThinkingKey, number>;
  preferences: ThinkingKey[];
  behaviorLabels: Record<BehaviorKey, string>;
  sheet: CheatSheet;
}

const SECTIONS: Array<{ key: keyof CheatSheet; label: string }> = [
  { key: "communicate", label: "Communicate with me" },
  { key: "motivate", label: "What motivates me" },
  { key: "collaborate", label: "Working together" },
  { key: "avoid", label: "Please avoid" },
];

export function CheatSheetCard({ code, name, title, percentages, preferences, behaviorLabels, sheet }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function download() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const url = await toPng(ref.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const filename = `how-to-work-with-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "me"}.png`;
      // Phones: hand the image to the share sheet, which offers "Save Image" and messaging apps.
      const file = new File([await (await fetch(url)).blob()], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: `How to work with ${name}` });
          return;
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
        }
      }
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <Link href={`/report/#${code}`} className="btn-ghost">
          <ArrowLeft className="h-4 w-4" /> Full report
        </Link>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </button>
          <button className="btn-primary" onClick={download} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Save as image
          </button>
        </div>
      </div>

      <div ref={ref} className="overflow-hidden rounded-3xl border border-line bg-white">
        <div className="flex h-2">
          {preferences.map((k) => (
            <div key={k} className="flex-1" style={{ background: THINKING[k].color }} />
          ))}
        </div>
        <div className="space-y-5 p-6">
          <div>
            <p className="eyebrow">How to work with</p>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-sm text-ink-soft">{title} thinker</p>
          </div>
          <ThinkingMixBar percentages={percentages} height={24} />
          <div className="flex flex-wrap gap-1.5">
            {BEHAVIOR_KEYS.map((k) => (
              <span key={k} className="rounded-full border border-behavior/30 bg-behavior/5 px-2.5 py-1 text-xs">
                <span className="text-ink-muted">{BEHAVIOR[k].name}:</span>{" "}
                <span className="font-medium">{behaviorLabels[k]}</span>
              </span>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {SECTIONS.map(({ key, label }) => (
              <div key={key}>
                <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</h2>
                <ul className="space-y-1 text-sm">
                  {sheet[key].map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
