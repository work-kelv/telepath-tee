"use client";

import { BEHAVIOR_KEYS, type BehaviorKey } from "@/lib/attributes";
import { cheatSheet, profileTitle, spectrumLabel } from "@/lib/insights";
import { decodeProfile } from "@/lib/share";
import { useHash } from "@/lib/useHash";
import { CheatSheetCard } from "@/components/CheatSheetCard";
import { BadLink } from "@/components/BadLink";

export default function CardPage() {
  const hash = useHash();
  if (hash === null) return <div className="h-64" />;
  const profile = decodeProfile(hash);
  if (!profile) return <BadLink what="card" />;
  const s = profile.scores;
  const behaviorLabels = Object.fromEntries(
    BEHAVIOR_KEYS.map((k) => [k, spectrumLabel(k, s.percentiles[k])]),
  ) as Record<BehaviorKey, string>;

  return (
    <CheatSheetCard
      code={hash}
      name={profile.name}
      title={profileTitle(s)}
      percentages={s.percentages}
      preferences={s.preferences}
      behaviorLabels={behaviorLabels}
      sheet={cheatSheet(s)}
    />
  );
}
