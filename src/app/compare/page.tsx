"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Handshake, Link2, Plus, Share2, Users, X, Zap } from "lucide-react";
import { BEHAVIOR, BEHAVIOR_KEYS, THINKING, THINKING_KEYS } from "@/lib/attributes";
import { profileTitle, spectrumLabel } from "@/lib/insights";
import { codesFromText, decodeGroup, decodeProfile, encodeGroup } from "@/lib/share";
import { analyzeTeam } from "@/lib/team";
import { useHash } from "@/lib/useHash";
import { ThinkingMixBar } from "@/components/ThinkingMixBar";
import { DotChart } from "@/components/DotChart";
import { PrintButton } from "@/components/PrintButton";

const MAX_PEOPLE = 12;

/** Builds a group from pasted report links. The group lives in this page's own link; nothing is stored. */
export default function ComparePage() {
  const hash = useHash();
  const [codes, setCodes] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (hash !== null) setCodes(decodeGroup(hash));
  }, [hash]);

  useEffect(() => setCanShare(typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches), []);

  function update(next: string[]) {
    setCodes(next);
    window.history.replaceState(null, "", `${window.location.pathname}#${encodeGroup(next)}`);
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    const found = codesFromText(input);
    if (!found.length) {
      setError("That doesn't look like a complete report link. Paste the whole link, including the part after #.");
      return;
    }
    const fresh = found.filter((c, i) => !codes.includes(c) && found.indexOf(c) === i);
    if (!fresh.length) {
      setError("That person is already in the comparison.");
      return;
    }
    const room = MAX_PEOPLE - codes.length;
    update([...codes, ...fresh.slice(0, room)]);
    setInput("");
    setError(fresh.length > room ? `Only ${MAX_PEOPLE} people fit in one comparison.` : "");
  }

  async function shareLink() {
    const url = window.location.href;
    try {
      if (canShare) {
        await navigator.share({ title: "Our profiles compared", url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      window.prompt("Copy this link:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (hash === null) return <div className="h-64" />;

  const members = codes.map((code) => ({ id: code, ...decodeProfile(code)! }));
  const team = members.length >= 2 ? analyzeTeam(members) : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Group comparison</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {members.length >= 2 ? `${members.length} people` : "Compare profiles"}
          </h1>
        </div>
        {team && (
          <div className="no-print flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={shareLink}>
              {copied ? <Check className="h-4 w-4" /> : canShare ? <Share2 className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copied ? "Copied" : canShare ? "Share comparison" : "Copy comparison link"}
            </button>
            <PrintButton />
          </div>
        )}
      </header>

      <section className="card no-print space-y-4">
        <div>
          <h2 className="font-semibold">Who&rsquo;s in the group</h2>
          <p className="text-sm text-ink-muted">
            Ask each person for their report link and paste it here. Nothing is uploaded or saved: the group lives in this
            page&rsquo;s link. Anyone you send it to can also open each person&rsquo;s report.
          </p>
        </div>
        {members.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-1 rounded-full border border-line bg-surface-sunken py-1 pl-3 pr-1 text-sm">
                <span className="max-w-[12rem] truncate">{m.name}</span>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white"
                  onClick={() => update(codes.filter((c) => c !== m.id))}
                  aria-label={`Remove ${m.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {members.length < MAX_PEOPLE && (
          <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="add-link" className="sr-only">
              Report link
            </label>
            <input
              id="add-link"
              className="input"
              placeholder="Paste a report link"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              inputMode="url"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button className="btn-primary shrink-0">
              <Plus className="h-4 w-4" /> Add person
            </button>
          </form>
        )}
        {error && (
          <p className="text-sm text-social" role="alert">
            {error}
          </p>
        )}
      </section>

      {!team ? (
        <div className="card space-y-2 text-center">
          <Users className="mx-auto h-8 w-8 text-ink-muted" aria-hidden />
          <p className="font-medium">
            {members.length === 1 ? "Add one more person" : "Add at least two people"} to see how the group fits together.
          </p>
          <p className="text-sm text-ink-muted">
            No link yet?{" "}
            <Link href="/assessment/" className="underline">
              Take the questionnaire
            </Link>{" "}
            and come back with your report.
          </p>
        </div>
      ) : (
        <>
          <section className="card">
            <h2 className="mb-4 font-semibold">Side by side</h2>
            <div className="space-y-4">
              {members.map((m) => (
                <div key={m.id} className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center sm:gap-4">
                  <div className="min-w-0">
                    <Link href={`/report/#${m.id}`} className="font-medium hover:underline">
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
              extremes. Tap or hover over a dot to see who it is.
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
        </>
      )}
    </div>
  );
}
