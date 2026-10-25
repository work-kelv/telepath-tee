import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeTeam, type Member } from "./team";
import type { Scores } from "./scoring";

function member(name: string, percentages: number[], behaviors: number[]): Member {
  const [analytical, structural, social, conceptual] = percentages;
  const [expressiveness, assertiveness, flexibility] = behaviors;
  const pct = { analytical, structural, social, conceptual };
  const third = (p: number) => (p <= 33 ? 1 : p <= 66 ? 2 : 3) as 1 | 2 | 3;
  const scores: Scores = {
    raw: {} as Scores["raw"],
    percentiles: { ...pct, expressiveness, assertiveness, flexibility },
    percentages: pct,
    preferences: (Object.keys(pct) as Array<keyof typeof pct>).filter((k) => pct[k] >= 23),
    modality: "Bi-modal",
    thirds: { expressiveness: third(expressiveness), assertiveness: third(assertiveness), flexibility: third(flexibility) },
  };
  return { id: name, name, scores };
}

test("opposite profiles produce one grouped friction card with thinking and behavior tensions", () => {
  const t = analyzeTeam([member("Blue-Green", [45, 45, 5, 5], [10, 50, 10]), member("Red-Yellow", [5, 5, 45, 45], [90, 50, 90])]);
  assert.equal(t.frictions.length, 1);
  const titles = t.frictions[0].tensions.map((x) => x.title);
  assert.ok(titles.includes("Plan vs. possibilities"));
  assert.ok(titles.includes("Data vs. people"));
  assert.ok(titles.includes("Internal vs. external processing"));
  assert.ok(titles.includes("Settled vs. open"));
  assert.ok(!titles.includes("Pace and push"));
  assert.equal(t.isWETeam, true);
});

test("a group missing an attribute reports the gap", () => {
  const t = analyzeTeam([member("A", [50, 40, 5, 5], [50, 50, 50]), member("B", [40, 50, 5, 5], [55, 45, 50])]);
  assert.deepEqual(t.gaps, ["social", "conceptual"]);
  assert.equal(t.isWETeam, false);
  assert.equal(t.frictions.length, 0);
  assert.deepEqual(t.synergies[0].shared.sort(), ["analytical", "structural"]);
});
