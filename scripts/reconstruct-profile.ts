// Reconstructs plausible answers for a profile that only exists as published scores
// (e.g. an older official Emergenetics report), using a current submission as the baseline.
//
// Method: for each attribute, invert the scoring (percentile -> z -> target raw mean), then
// change the baseline answers by the fewest one-point steps needed to hit that mean,
// spreading steps across the items with the most room to move. The result is "the answers
// closest to how you answer today that would produce the old profile", not a record of
// what was actually answered.
//
// Usage: npm run reconstruct -- <baseline-submission-id> <old-profile.json> <out-dir> [--save]
// The old-profile file holds the published percentiles; see scripts/old-profile.example.json.

import { promises as fs } from "fs";
import path from "path";
import { ATTRIBUTE_KEYS, type AttributeKey } from "../src/lib/attributes";
import { QUESTIONS } from "../src/lib/questions";
import { LIKERT_MAX, LIKERT_MIN, NORMS, normalCdf, score, type Answers } from "../src/lib/scoring";
import { createSubmission, getSubmission } from "../src/lib/db";

interface OldProfile {
  label: string;
  percentiles: Record<AttributeKey, number>;
}

async function readOldProfile(file: string): Promise<OldProfile> {
  const parsed = JSON.parse(await fs.readFile(file, "utf8")) as Partial<OldProfile>;
  const percentiles = parsed.percentiles ?? ({} as Record<AttributeKey, number>);
  for (const k of ATTRIBUTE_KEYS) {
    const v = percentiles[k];
    if (typeof v !== "number" || v < 1 || v > 99) throw new Error(`${file}: percentiles.${k} must be a number from 1 to 99`);
  }
  return { label: parsed.label ?? "Earlier profile", percentiles };
}

function inverseCdf(p: number): number {
  let lo = -6;
  let hi = 6;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (normalCdf(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const keyed = (q: (typeof QUESTIONS)[number], v: number) => (q.reverse ? LIKERT_MAX + LIKERT_MIN - v : v);

export function reconstruct(baseline: Answers, targets: Record<AttributeKey, number>) {
  const answers: Answers = { ...baseline };
  const targetRaw = {} as Record<AttributeKey, number>;

  for (const attr of ATTRIBUTE_KEYS) {
    const items = QUESTIONS.filter((q) => q.attribute === attr);
    const norm = NORMS[attr];
    const raw = norm.mean + norm.sd * inverseCdf(targets[attr] / 100);
    targetRaw[attr] = Math.round(raw * 100) / 100;
    const targetSum = Math.min(items.length * LIKERT_MAX, Math.max(items.length * LIKERT_MIN, Math.round(raw * items.length)));

    const values = items.map((q) => keyed(q, answers[q.id]));
    let delta = targetSum - values.reduce((a, b) => a + b, 0);
    const dir = Math.sign(delta);
    while (delta !== 0) {
      // Move the item with the most room in the needed direction; ties go to the item changed least so far.
      let best = -1;
      let bestRoom = 0;
      values.forEach((v, i) => {
        const room = dir > 0 ? LIKERT_MAX - v : v - LIKERT_MIN;
        const moved = Math.abs(v - keyed(items[i], baseline[items[i].id]));
        const rank = room * 10 - moved;
        if (room > 0 && (best < 0 || rank > bestRoom)) {
          best = i;
          bestRoom = rank;
        }
      });
      if (best < 0) break;
      values[best] += dir;
      delta -= dir;
    }
    items.forEach((q, i) => (answers[q.id] = keyed(q, values[i])));
  }
  return { answers, targetRaw };
}

async function main() {
  const [baselineId, oldFile, outDir] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (!baselineId || !oldFile || !outDir) throw new Error("Usage: reconstruct <baseline-submission-id> <old-profile.json> <out-dir> [--save]");
  const oldProfile = await readOldProfile(oldFile);
  const current = await getSubmission(baselineId);
  if (!current) throw new Error(`No submission ${baselineId}`);

  const { answers, targetRaw } = reconstruct(current.answers, oldProfile.percentiles);
  const oldScores = score(answers);

  const questions = QUESTIONS.map((q) => ({
    id: q.id,
    attribute: q.attribute,
    text: q.text,
    reverse: q.reverse,
    current: current.answers[q.id],
    old: answers[q.id],
    change: current.answers[q.id] - answers[q.id],
  }));

  const result = {
    generatedAt: new Date().toISOString(),
    person: current.name,
    method:
      "Old answers are reconstructed: the closest answers to the current ones that reproduce the old profile's percentiles under this app's scoring. They are not the original responses.",
    current: { source: `App submission ${current.id} (${current.createdAt})`, scores: current.scores, answers: current.answers },
    old: {
      source: oldProfile.label,
      officialPercentiles: oldProfile.percentiles,
      targetRawMeans: targetRaw,
      scores: oldScores,
      answers,
    },
    questions,
  };

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "profile-comparison.json"), JSON.stringify(result, null, 2));

  const csv = [
    "id,attribute,reverse_keyed,question,current_answer,old_answer_reconstructed,change",
    ...questions.map((q) =>
      [q.id, q.attribute, q.reverse, `"${q.text.replace(/"/g, '""')}"`, q.current, q.old, q.change].join(","),
    ),
  ].join("\n");
  await fs.writeFile(path.join(outDir, "answers-current-vs-old.csv"), csv);

  if (process.argv.includes("--save")) {
    const saved = await createSubmission({
      name: `${current.name} (old profile, reconstructed)`,
      email: current.email,
      group: current.group || "Profile history",
      answers,
      scores: oldScores,
    });
    console.log(`Saved reconstructed old profile to app: /report/${saved.id}`);
    console.log(`Compare in app: /compare?ids=${current.id},${saved.id}`);
  }

  console.log("attribute       official  reconstructed  current");
  for (const k of ATTRIBUTE_KEYS)
    console.log(
      `${k.padEnd(15)} ${String(oldProfile.percentiles[k]).padStart(8)}  ${String(oldScores.percentiles[k]).padStart(13)}  ${String(current.scores.percentiles[k]).padStart(7)}`,
    );
  console.log("old percentages:", oldScores.percentages, oldScores.modality);
  console.log(`changed answers: ${questions.filter((q) => q.change !== 0).length}/${questions.length}`);
}

if (process.argv[1]?.includes("reconstruct-profile")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
