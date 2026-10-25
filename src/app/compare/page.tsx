import Link from "next/link";
import { AlertTriangle, CheckCircle2, Handshake, Users, Zap } from "lucide-react";
import { getSubmissions } from "@/lib/db";
import { BEHAVIOR, BEHAVIOR_KEYS, THINKING, THINKING_KEYS } from "@/lib/attributes";
import { profileTitle, spectrumLabel } from "@/lib/insights";
import { analyzeTeam } from "@/lib/team";
import { ThinkingMixBar } from "@/components/ThinkingMixBar";
import { DotChart } from "@/components/DotChart";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function ComparePage({ searchParams }: { searchParams: { ids?: string } }) {
  const ids = (searchParams.ids ?? "").split(",").filter(Boolean).slice(0, 30);
  const subs = await getSubmissions(ids);

  if (subs.length < 2) {
    return (
      <div className="card mx-auto max-w-lg space-y-3 text-center">
        <Users className="mx-auto h-8 w-8 text-ink-muted" />
        <h1 className="text-xl font-semibold">Pick at least two profiles to compare</h1>
        <p className="text-sm text-ink-soft">
          Open the admin panel, tick the people you want to compare, and choose &ldquo;Compare selected&rdquo;.
        </p>
        <Link href="/admin" className="btn-primary">
          Go to admin
        </Link>
      </div>
    );
  }

  const members = subs.map((s) => ({ id: s.id, name: s.name, scores: s.scores }));
  const team = analyzeTeam(members);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Group comparison</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{members.length} people</h1>
          <p className="mt-1 text-ink-soft">{members.map((m) => m.name).join(", ")}</p>
        </div>
        <PrintButton />
      </header>

      <section className="card">
        <h2 className="mb-4 font-semibold">Side by side</h2>
        <div className="space-y-4">
          {members.map((m) => (
            <div key={m.id} className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center sm:gap-4">
              <div className="min-w-0">
                <Link href={`/report/${m.id}`} className="font-medium hover:underline">
                  {m.name}
                </Link>
                <p className="text-xs text-ink-muted">
                  {profileTitle(m.scores)} &middot; {m.scores.modality}
                </p>
              </div>
              <div className="space-y-1.5">
                <ThinkingMixBar percentages={m.scores.percentages} />
                <p className="text-xs text-ink-soft">
                  {BEHAVIOR_KEYS.map((k) => `${BEHAVIOR[k].name}: ${spectrumLabel(k, m.scores.percentiles[k])} (${m.scores.percentiles[k]})`).join(" · ")}
                </p>
              </div>
            </div>
          ))}
          <div className="grid gap-2 border-t border-line pt-4 sm:grid-cols-[180px_1fr] sm:items-center sm:gap-4">
            <div>
              <p className="font-semibold">Group average</p>
              <p className="text-xs text-ink-muted">Mean of everyone&rsquo;s percentages</p>
            </div>
            <ThinkingMixBar percentages={team.averagePercentages} />
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-1 font-semibold">Combined scores</h2>
        <p className="mb-4 text-sm text-ink-muted">
          Each dot is a person&rsquo;s percentile; the diamond is the group average. A middling average can hide two
          extremes. Hover a dot to see who it is.
        </p>
        <DotChart
          people={members.map((m) => ({ id: m.id, name: m.name, percentiles: m.scores.percentiles }))}
          averages={team.averagePercentiles}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-1 flex items-center gap-2 font-semibold">
            {team.isWETeam ? <CheckCircle2 className="h-4 w-4 text-structural" /> : <AlertTriangle className="h-4 w-4 text-conceptual" />}
            Thinking coverage
          </h2>
          <p className="mb-3 text-sm text-ink-muted">
            {team.isWETeam ? "A WE-Team: all four attributes are covered." : "Some thinking attributes have no one with a preference."}
          </p>
          <ul className="space-y-2">
            {THINKING_KEYS.map((k) => (
              <li key={k} className="flex items-start gap-3 text-sm">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: THINKING[k].color }} />
                <div>
                  <span className="font-medium">{THINKING[k].name}</span>{" "}
                  {team.coverage[k].length ? (
                    <span className="text-ink-soft">{team.coverage[k].join(", ")}</span>
                  ) : (
                    <span className="font-medium text-social">Gap: nobody</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="mb-3 font-semibold">What stands out</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-ink-soft">
            {team.observations.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <h2 className="mb-1 flex items-center gap-2 font-semibold">
          <Zap className="h-4 w-4" /> Potential communication clashes
        </h2>
        <p className="mb-4 text-sm text-ink-muted">
          Pairs whose preferences pull in opposite directions, or whose behaviors are 50+ percentile points apart. These
          aren&rsquo;t problems, just places to be deliberate.
        </p>
        {team.frictions.length === 0 ? (
          <p className="text-sm text-ink-soft">No strong opposites in this group.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {team.frictions.map((f) => (
              <div key={`${f.a}|${f.b}`} className="card space-y-3 p-4 sm:p-4">
                <p className="font-semibold">
                  {f.a} &harr; {f.b}
                </p>
                {f.tensions.map((t) => (
                  <div key={t.title} className="border-t border-line pt-3 first-of-type:border-0 first-of-type:pt-0">
                    <p className="text-sm font-medium">
                      {t.title}{" "}
                      <span className="text-xs font-normal uppercase tracking-wide text-ink-muted">{t.kind}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-soft">{t.detail}</p>
                    <p className="mt-1 text-sm">
                      <span className="font-medium">Try: </span>
                      {t.tip}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {team.synergies.length > 0 && (
        <section className="card">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Handshake className="h-4 w-4" /> Natural allies
          </h2>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {team.synergies.map((s, i) => (
              <li key={i} className="text-ink-soft">
                <span className="font-medium text-ink">
                  {s.a} &amp; {s.b}
                </span>{" "}
                share {s.shared.map((k) => THINKING[k].name).join(" + ")} thinking
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
