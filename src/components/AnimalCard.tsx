import Link from "next/link";
import { THINKING, THINKING_KEYS, type ThinkingKey } from "@/lib/attributes";
import { animalImage, type Animal } from "@/lib/animals";
import { AnimalPortrait } from "./AnimalPortrait";

/** Largest share of any profile, used as the full width of every rarity bar so they compare. */
export const RARITY_SCALE = 15;

export function RarityBar({ rarity }: { rarity: number }) {
  return (
    <div className="space-y-1" title={`About ${rarity}% of people have this profile`}>
      <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
        <div className="h-full rounded-full bg-ink/70" style={{ width: `${(rarity / RARITY_SCALE) * 100}%` }} />
      </div>
      <p className="text-xs text-ink-muted">
        About <b className="text-ink">{rarity}%</b> of people{rarity <= 2 ? " (one of the rarest profiles)" : ""}
      </p>
    </div>
  );
}

/** The "Your animal" section of a report: the animal framed by a ring of this person's thinking mix. */
export function AnimalCard({
  animal,
  code,
  percentages,
}: {
  animal: Animal;
  code: string;
  percentages: Record<ThinkingKey, number>;
}) {
  return (
    <section className="card grid items-center gap-5 sm:grid-cols-[220px_1fr]">
      <div className="mx-auto">
        <AnimalPortrait animal={animal} percentages={percentages} size={220} />
      </div>
      <div className="min-w-0 space-y-3">
        <div className="space-y-1">
          <p className="eyebrow">Your profile animal</p>
          <h2 className="text-xl font-bold leading-tight">{animal.name}</h2>
          <p className="text-base font-medium italic">&ldquo;{animal.motto}&rdquo;</p>
        </div>
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft" aria-label="The ring shows your thinking mix">
          {THINKING_KEYS.map((k) => (
            <span key={k} className="inline-flex items-center gap-1 whitespace-nowrap">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: THINKING[k].color }} />
              {THINKING[k].name} <b className="text-ink">{percentages[k]}%</b>
            </span>
          ))}
        </p>
        <p className="text-sm text-ink-soft">{animal.summary}</p>
        <RarityBar rarity={animal.rarity} />
        <Link href={`/animals/#${code}`} className="no-print inline-block text-sm font-medium underline">
          Meet all 15 animals
        </Link>
      </div>
    </section>
  );
}

/** A small round portrait with the animal's name, for cards and group views. */
export function AnimalBadge({ animal, size = 44 }: { animal: Animal; size?: number }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <img
        src={animalImage(animal)}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full border border-line object-cover"
        style={{ width: size, height: size, objectPosition: "50% 40%" }}
      />
      <span className="min-w-0 text-xs text-ink-soft">{animal.name.replace(/^The /, "")}</span>
    </span>
  );
}
