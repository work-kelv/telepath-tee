import { Lightbulb, MessageCircle, Building2, Repeat, Route } from "lucide-react";
import { THINKING } from "@/lib/attributes";
import { buildReport } from "@/lib/insights";
import type { Profile } from "@/lib/share";
import { ThinkingPie } from "@/components/ThinkingPie";
import { PercentileBars } from "@/components/PercentileBars";
import { BehaviorSpectrum } from "@/components/BehaviorSpectrum";
import { ReportActions } from "@/components/ReportActions";
import { PrintLink } from "@/components/PrintLink";
import { AnimalCard } from "@/components/AnimalCard";
import { animalFor } from "@/lib/animals";

/** The full personal report for a profile decoded from its link. */
export function ReportView({ profile, code }: { profile: Profile; code: string }) {
  const s = profile.scores;
  const r = buildReport(profile.name, s);

  const tipRows: Array<[string, string]> = [
    ["What are they thinking?", r.tips.thinking],
    ["How best to reach them?", r.tips.reach],
    ["Decision-making process?", r.tips.decisions],
    ["Internal or external processor?", r.tips.processor],
    ["Need time for thought?", r.tips.needsTime],
    ["Embraces change?", r.tips.change],
    ["Driver?", r.tips.driver],
    ["Multi-tasker?", r.tips.multitask],
  ];

  return (
    <article className="space-y-6">
      <div className="no-print rounded-xl border border-structural/30 bg-structural/5 p-3 text-sm">
        Nothing about this report is saved anywhere. Its link is the only copy, so bookmark it or use <b>Copy link</b>{" "}
        (or <b>Share link</b>) to keep it. A saved PDF prints the full link at the top; don&rsquo;t copy the shortened
        address from the PDF&rsquo;s footer.
      </div>

      <header className="space-y-4">
        <div>
          <p className="eyebrow">Personal profile</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{profile.name}</h1>
          <p className="mt-1 text-lg text-ink-soft">
            {r.title} &middot; <span className="text-ink-muted">{s.modality}</span>
          </p>
        </div>
        <p className="max-w-3xl text-ink-soft">{r.headline}</p>
        <ReportActions code={code} />
      </header>

      <PrintLink />

      <AnimalCard animal={animalFor(s.preferences)} code={code} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-1 font-semibold">How you think</h2>
          <p className="mb-4 text-sm text-ink-muted">
            Your own mix of thinking energy. 23% or more counts as a preference.
          </p>
          <ThinkingPie percentages={s.percentages} />
        </section>
        <section className="card">
          <h2 className="mb-1 font-semibold">How you compare</h2>
          <p className="mb-4 text-sm text-ink-muted">How strongly each attribute shows up compared with other people.</p>
          <PercentileBars percentiles={s.percentiles} />
        </section>
      </div>

      <section className="card space-y-6">
        <div>
          <h2 className="font-semibold">How you behave</h2>
          <p className="text-sm text-ink-muted">
            Each behavior is a spectrum, split into thirds. The middle third is the &ldquo;It Depends&rdquo; group.
          </p>
        </div>
        {r.behaviors.map((b) => (
          <div key={b.key} className="space-y-2">
            <BehaviorSpectrum attr={b.key} percentile={b.percentile} third={b.third} />
            <p className="text-sm text-ink-soft">{b.sentence}</p>
          </div>
        ))}
      </section>

      <section className="card space-y-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <Lightbulb className="h-4 w-4" /> Your profile in brief
        </h2>
        {r.summary.map((p, i) => (
          <p key={i} className="text-ink-soft">
            {p}
          </p>
        ))}
        {r.combination && <p className="rounded-xl bg-surface-sunken p-4 text-sm text-ink-soft">{r.combination}</p>}
      </section>

      <section className="print-break space-y-3">
        <h2 className="text-xl font-semibold">Your thinking preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {r.strengths.map((k) => {
            const t = THINKING[k];
            return (
              <div key={k} className="card border-l-4" style={{ borderLeftColor: t.color }}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h3 className="font-semibold">{t.name}</h3>
                  <span className="text-sm tabular-nums text-ink-muted">
                    {s.percentages[k]}% &middot; asks &ldquo;{t.question}&rdquo;
                  </span>
                </div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {t.traits.map((tr) => (
                    <span key={tr} className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs">
                      {tr}
                    </span>
                  ))}
                </div>
                <dl className="space-y-1.5 text-sm">
                  <div>
                    <dt className="inline font-medium">Problem solving: </dt>
                    <dd className="inline text-ink-soft">{t.problemSolving}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Creative gift: </dt>
                    <dd className="inline text-ink-soft">{t.creativeGift}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Energized by: </dt>
                    <dd className="inline text-ink-soft">{t.energizers.join("; ")}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
        <p className="text-sm text-ink-muted">
          Least preferred: <span className="font-medium text-ink">{THINKING[r.leastPreferred].name}</span> (
          {s.percentages[r.leastPreferred]}%). People who prefer it make great &ldquo;off-line coaches&rdquo; when you need
          that kind of thinking.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <MessageCircle className="h-4 w-4" /> Communication preferences
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
            {r.communication.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Building2 className="h-4 w-4" /> Ideal work environment
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
            {r.environment.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <Route className="h-4 w-4" /> Interaction strategies
        </h2>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {tipRows.map(([q, a]) => (
            <div key={q} className="border-b border-line pb-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{q}</dt>
              <dd className="text-sm">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card">
        <h2 className="mb-1 flex items-center gap-2 font-semibold">
          <Repeat className="h-4 w-4" /> How others can flex toward you
        </h2>
        <p className="mb-3 text-sm text-ink-muted">
          The Platinum Rule: &ldquo;Treat others the way <em>they</em> want to be treated.&rdquo;
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          {r.flexToward.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

    </article>
  );
}
