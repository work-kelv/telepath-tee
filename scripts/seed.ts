// Adds a handful of demo profiles (group "Demo") so the compare and admin views have data.
// Usage: npm run seed

import { createSubmission } from "../src/lib/db";
import { QUESTIONS } from "../src/lib/questions";
import { score } from "../src/lib/scoring";
import type { AttributeKey } from "../src/lib/attributes";

type Levels = Record<AttributeKey, number>;

const PEOPLE: Array<[string, Levels]> = [
  ["Avery (demo)", { analytical: 6.5, structural: 6, social: 3.5, conceptual: 2.5, expressiveness: 2.5, assertiveness: 4.5, flexibility: 4 }],
  ["Blake (demo)", { analytical: 3, structural: 3, social: 6.5, conceptual: 6, expressiveness: 6.5, assertiveness: 5, flexibility: 6 }],
  ["Casey (demo)", { analytical: 5, structural: 6.5, social: 5.5, conceptual: 3, expressiveness: 4, assertiveness: 2.5, flexibility: 3 }],
  ["Devon (demo)", { analytical: 6, structural: 3, social: 4, conceptual: 6.5, expressiveness: 5, assertiveness: 6.5, flexibility: 5 }],
  ["Emery (demo)", { analytical: 4.5, structural: 4.5, social: 5, conceptual: 4.5, expressiveness: 3.5, assertiveness: 3.5, flexibility: 5.5 }],
];

function jitter(level: number): number {
  return Math.min(7, Math.max(1, Math.round(level + (Math.random() - 0.5) * 2)));
}

async function main() {
  for (const [name, levels] of PEOPLE) {
    const answers = Object.fromEntries(
      QUESTIONS.map((q) => {
        const v = jitter(levels[q.attribute]);
        return [q.id, q.reverse ? 8 - v : v];
      }),
    );
    const s = await createSubmission({ name, group: "Demo", answers, scores: score(answers) });
    console.log(`  ${name.padEnd(14)} /report/${s.id}  ${s.scores.preferences.join("/")}`);
  }
  console.log("Seeded demo profiles.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
