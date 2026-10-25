import { notFound } from "next/navigation";
import { getSubmission } from "@/lib/db";
import { BEHAVIOR_KEYS, type BehaviorKey } from "@/lib/attributes";
import { cheatSheet, profileTitle, spectrumLabel } from "@/lib/insights";
import { CheatSheetCard } from "@/components/CheatSheetCard";

export const dynamic = "force-dynamic";

export default async function CardPage({ params }: { params: { id: string } }) {
  const sub = await getSubmission(params.id);
  if (!sub) notFound();
  const s = sub.scores;
  const behaviorLabels = Object.fromEntries(
    BEHAVIOR_KEYS.map((k) => [k, spectrumLabel(k, s.percentiles[k])]),
  ) as Record<BehaviorKey, string>;

  return (
    <CheatSheetCard
      id={sub.id}
      name={sub.name}
      title={profileTitle(s)}
      percentages={s.percentages}
      preferences={s.preferences}
      behaviorLabels={behaviorLabels}
      sheet={cheatSheet(s)}
    />
  );
}
