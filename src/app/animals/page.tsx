"use client";

import Link from "next/link";
import { ANIMAL_GROUPS, ANIMALS, animalFor, animalImage } from "@/lib/animals";
import { decodeProfile } from "@/lib/share";
import { useHash } from "@/lib/useHash";
import { ColorChips, RarityBar, RARITY_SCALE } from "@/components/AnimalCard";

// Columns that the group fills evenly: 4 animals in one row of four (two rows of two on tablets),
// 6 in rows of three, and the single quadra-modal owl as one card.
const GRID: Record<number, string> = {
  1: "max-w-sm",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  6: "sm:grid-cols-2 lg:grid-cols-3",
};

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
          Every profile has a mix of thinking preferences: any color at 23% or more. Each of the 15 possible mixes has its
          own animal, motto and share of the population. The bars use one scale, where a full bar is {RARITY_SCALE}% of
          people.
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

      {ANIMAL_GROUPS.map((g) => (
        <section key={g.size} className="space-y-3">
          <h2 className="text-lg font-semibold">{g.title}</h2>
          <ul className={`grid gap-4 ${GRID[ANIMALS.filter((a) => a.colors.length === g.size).length] ?? GRID[6]}`}>
            {ANIMALS.filter((a) => a.colors.length === g.size).map((a) => {
              const isMine = mine?.name === a.name;
              return (
                <li
                  key={a.name}
                  className={`card flex flex-col gap-3 ${isMine ? "border-ink ring-2 ring-ink" : ""}`}
                  aria-current={isMine ? "true" : undefined}
                >
                  <img
                    src={animalImage(a)}
                    alt={`${a.name}: ${a.description}`}
                    width={640}
                    height={480}
                    loading="lazy"
                    className="w-full rounded-xl"
                  />
                  <div className="space-y-1.5">
                    {isMine && <p className="eyebrow text-ink">{profile?.name}&rsquo;s animal</p>}
                    <h3 className="font-bold leading-tight">{a.name}</h3>
                    <ColorChips colors={a.colors} />
                  </div>
                  <blockquote className="text-sm font-medium italic">&ldquo;{a.motto}&rdquo;</blockquote>
                  <p className="text-sm text-ink-soft">{a.description}</p>
                  <div className="mt-auto">
                    <RarityBar rarity={a.rarity} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="text-xs text-ink-muted">
        Mottos and population shares as presented in the &ldquo;Teaming Up! With Emergenetics&rdquo; workshop. The shares
        are rounded, so they add up to 101%.
      </p>
    </div>
  );
}
