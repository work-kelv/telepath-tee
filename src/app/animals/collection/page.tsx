import Link from "next/link";
import { THINKING } from "@/lib/attributes";
import { ANIMALS } from "@/lib/animals";
import { AnimalPortrait } from "@/components/AnimalPortrait";

/** One shareable card with all 15 animals, their colors, motto and rarity. */
export default function CollectionPage() {
  return (
    <div className="space-y-4">
      <p className="no-print text-sm text-ink-soft">
        All 15 animals on one card.{" "}
        <Link href="/animals/" className="underline">
          See the full descriptions
        </Link>
      </p>
      <section id="collection" className="rounded-3xl border border-line bg-[#fbf3e6] px-4 py-6 sm:px-8 sm:py-8">
        <header className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">The character collection</h1>
          <p className="text-sm text-ink-soft">
            Find your rarity. Each ring shows a typical thinking mix for that profile:{" "}
            {(["analytical", "conceptual", "structural", "social"] as const).map((k, i, all) => (
              <span key={k} className="whitespace-nowrap">
                <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: THINKING[k].color }} />
                {THINKING[k].name}
                {i < all.length - 1 ? ", " : ""}
              </span>
            ))}
            .
          </p>
        </header>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {ANIMALS.map((a) => (
            <li key={a.name} className="flex flex-col items-center text-center">
              <AnimalPortrait animal={a} percentages={a.typical} size={150} label={`${a.rarity}% of people`} />
              <h2 className="mt-2 text-sm font-bold leading-tight">{a.name.replace(/^The /, "")}</h2>
              <p className="mt-1 flex flex-wrap justify-center gap-x-1.5 text-[11px] text-ink-soft">
                {a.colors.map((k) => (
                  <span key={k} className="inline-flex items-center gap-1 whitespace-nowrap">
                    <span className="h-2 w-2 rounded-full" style={{ background: THINKING[k].color }} />
                    {THINKING[k].name}
                  </span>
                ))}
              </p>
              <p className="mt-1 text-xs italic leading-snug">&ldquo;{a.motto}&rdquo;</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-ink-muted">
          Take the questionnaire at <b>work-kelv.github.io/telepath-tee</b> to find yours.
        </p>
      </section>
    </div>
  );
}
