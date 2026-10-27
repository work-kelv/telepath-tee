"use client";

import Link from "next/link";
import { ANIMAL_GROUPS, ANIMALS, animalFor, animalImage } from "@/lib/animals";
import { decodeProfile } from "@/lib/share";
import { useHash } from "@/lib/useHash";
import { RarityBar, RARITY_SCALE } from "@/components/AnimalCard";
import { ModelCircle } from "@/components/ModelCircle";

/** All 15 profile animals, grouped by how many thinking colors are preferences. */
export default function AnimalsPage() {
  const hash = useHash();
  const profile = hash ? decodeProfile(hash) : null;
  const mine = profile ? animalFor(profile.scores.preferences) : null;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="eyebrow">Profile animals</p>
        <h1 className="text-3xl font-bold tracking-tight">Meet the 15 animals</h1>
        <p className="max-w-2xl text-ink-soft">
          Every profile has a mix of thinking preferences: any color at 23% or more. In each circle, the colored quadrants
          are that animal&rsquo;s preferences. Each of the 15 possible mixes has its own animal, motto and share of the
          population; the bars use one scale, where a full bar is {RARITY_SCALE}% of people.
        </p>
        {profile && mine && (
          <p className="no-print rounded-xl border border-line bg-surface-card p-3 text-sm">
            <b>{profile.name}</b> is <b>{mine.name}</b>, highlighted below.{" "}
            <Link href={`/report/#${hash}`} className="underline">
              Back to the report
            </Link>
          </p>
        )}
      </header>

      {/* One grid of 15 cards: five even rows of three, ordered from one color to all four. */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ANIMALS.map((a) => {
          const isMine = mine?.name === a.name;
          return (
            <li
              key={a.name}
              className={`card flex flex-col gap-3 ${isMine ? "border-ink ring-2 ring-ink" : ""}`}
              aria-current={isMine ? "true" : undefined}
            >
              <img
                src={animalImage(a)}
                alt={a.name}
                width={640}
                height={480}
                loading="lazy"
                className="w-full rounded-xl"
              />
              <p className={`eyebrow ${isMine ? "text-ink" : ""}`}>
                {isMine ? `${profile?.name}’s animal` : ANIMAL_GROUPS.find((g) => g.size === a.colors.length)?.title}
              </p>
              <div className="flex items-center gap-3">
                <ModelCircle colors={a.colors} size={128} />
                <div className="min-w-0 space-y-1">
                  <h3 className="font-bold leading-tight">{a.name}</h3>
                  <p className="text-sm font-medium italic">&ldquo;{a.motto}&rdquo;</p>
                </div>
              </div>
              <p className="text-sm text-ink-soft">{a.summary}</p>
              <div className="mt-auto">
                <RarityBar rarity={a.rarity} />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-ink-muted">
        Mottos and population shares as presented in the &ldquo;Teaming Up! With Emergenetics&rdquo; workshop. The shares
        are rounded, so they add up to 101%.
      </p>
    </div>
  );
}
