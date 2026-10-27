import Link from "next/link";
import { THINKING, type ThinkingKey } from "@/lib/attributes";
import { animalImage, type Animal } from "@/lib/animals";

/** Largest share of any profile, used as the full width of every rarity bar so they compare. */
export const RARITY_SCALE = 15;

export function ColorChips({ colors }: { colors: ThinkingKey[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {colors.map((k) => (
        <span key={k} className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-medium">
          <span className="h-2 w-2 rounded-full" style={{ background: THINKING[k].color }} aria-hidden />
          {THINKING[k].name}
        </span>
      ))}
    </span>
  );
}

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

/** The "Your animal" section of a report. */
export function AnimalCard({ animal, code }: { animal: Animal; code: string }) {
  return (
    <section className="card grid items-center gap-5 sm:grid-cols-[minmax(0,240px)_1fr]">
      <img
        src={animalImage(animal)}
        alt={`${animal.name}: ${animal.description}`}
        width={640}
        height={480}
        className="mx-auto w-full max-w-[280px] rounded-xl"
      />
      <div className="min-w-0 space-y-3">
        <div className="space-y-1.5">
          <p className="eyebrow">Your profile animal</p>
          <h2 className="text-xl font-bold leading-tight">{animal.name}</h2>
          <ColorChips colors={animal.colors} />
        </div>
        <p className="text-sm text-ink-soft">{animal.description}</p>
        <blockquote className="border-l-4 border-line pl-3 text-base font-medium italic">&ldquo;{animal.motto}&rdquo;</blockquote>
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
