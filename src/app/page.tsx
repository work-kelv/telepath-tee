import Link from "next/link";
import { ArrowRight, Clock, Lock, Users } from "lucide-react";
import { BEHAVIOR, BEHAVIOR_KEYS, THINKING, THINKING_KEYS } from "@/lib/attributes";
import { QUESTIONS } from "@/lib/questions";
import { ANIMALS, animalImage } from "@/lib/animals";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <p className="eyebrow">Thinking &amp; Behavior Profile</p>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Discover how you prefer to think, and how you show up with others.
        </h1>
        <p className="max-w-2xl text-ink-soft">
          Answer {QUESTIONS.length} quick statements and get an instant personal report: your mix of four thinking
          preferences, where you sit on three behavioral spectrums, and a shareable &ldquo;How to work with me&rdquo;
          card. Preferences aren&rsquo;t abilities. There are no good or bad profiles.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/assessment/" className="btn-primary">
            Start the questionnaire <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Clock className="h-4 w-4" /> About 8 minutes
          </span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-semibold">Four thinking attributes</h2>
          <ul className="space-y-2.5">
            {THINKING_KEYS.map((k) => (
              <li key={k} className="flex gap-3">
                <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: THINKING[k].color }} />
                <div className="text-sm">
                  <span className="font-medium">{THINKING[k].name}</span>{" "}
                  <span className="text-ink-muted">&ldquo;{THINKING[k].question}&rdquo;</span>
                  <p className="text-ink-soft">{THINKING[k].definition}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="mb-3 font-semibold">Three behavioral attributes</h2>
          <ul className="space-y-2.5">
            {BEHAVIOR_KEYS.map((k) => (
              <li key={k} className="text-sm">
                <span className="font-medium">{BEHAVIOR[k].name}</span>
                <p className="text-ink-soft">{BEHAVIOR[k].definition}</p>
                <p className="text-xs text-ink-muted">
                  {BEHAVIOR[k].spectrum[0]} &larr;&rarr; {BEHAVIOR[k].spectrum[4]}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-muted">
            Behaviors are measured separately from thinking: knowing one doesn&rsquo;t predict the other.
          </p>
        </div>
      </section>

      <section className="card space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">Which animal are you?</h2>
          <Link href="/animals/" className="text-sm font-medium underline">
            Meet all 15
          </Link>
        </div>
        <p className="text-sm text-ink-soft">
          Each mix of thinking preferences has its own animal, from the Clipboard Detective Raccoon to the Wise Forest Owl.
          Your report tells you which one is yours.
        </p>
        <ul className="flex flex-wrap gap-2" aria-label="The 15 profile animals">
          {ANIMALS.map((a) => (
            <li key={a.name}>
              <img
                src={animalImage(a)}
                alt={a.name}
                title={a.name}
                width={52}
                height={52}
                loading="lazy"
                className="h-[52px] w-[52px] rounded-full border border-line object-cover"
                style={{ objectPosition: "50% 40%" }}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 text-sm sm:grid-cols-2">
        <div className="flex gap-3">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" />
          <p className="text-ink-soft">
            Paste friends&rsquo; report links into{" "}
            <Link href="/compare/" className="underline">
              Compare
            </Link>{" "}
            to see team balance, missing perspectives and likely communication clashes.
          </p>
        </div>
        <div className="flex gap-3">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" />
          <p className="text-ink-soft">
            Nothing is stored. You only give a name, scoring happens in your browser, and your report lives in its own
            link. Share it with whoever you like.
          </p>
        </div>
      </section>
    </div>
  );
}
