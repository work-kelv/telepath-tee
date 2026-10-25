import { test } from "node:test";
import assert from "node:assert/strict";
import { normalCdf, score, toPercentages, toThird, validateAnswers, NORMS } from "./scoring";
import { QUESTIONS, buildSteps } from "./questions";
import { ATTRIBUTE_KEYS, type AttributeKey } from "./attributes";

function answersFor(levels: Partial<Record<AttributeKey, number>>, fallback = 4) {
  return Object.fromEntries(
    QUESTIONS.map((q) => {
      const level = levels[q.attribute] ?? fallback;
      return [q.id, q.reverse ? 8 - level : level];
    }),
  );
}

test("percentage mix reproduces the Fieldbook sample profile (95/90/48/5 -> 40/38/20/2)", () => {
  assert.deepEqual(toPercentages({ analytical: 95, structural: 90, social: 48, conceptual: 5 }), {
    analytical: 40,
    structural: 38,
    social: 20,
    conceptual: 2,
  });
});

test("percentages always sum to 100", () => {
  for (const p of [
    [1, 1, 1, 1],
    [99, 1, 1, 1],
    [33, 33, 33, 34],
    [70, 61, 12, 88],
  ]) {
    const r = toPercentages({ analytical: p[0], structural: p[1], social: p[2], conceptual: p[3] });
    assert.equal(Object.values(r).reduce((a, b) => a + b, 0), 100);
  }
});

test("behavioral thirds use 0-33 / 34-66 / 67-100", () => {
  assert.equal(toThird(1), 1);
  assert.equal(toThird(33), 1);
  assert.equal(toThird(34), 2);
  assert.equal(toThird(66), 2);
  assert.equal(toThird(67), 3);
  assert.equal(toThird(99), 3);
});

test("normal CDF is accurate at reference points", () => {
  assert.ok(Math.abs(normalCdf(0) - 0.5) < 1e-6);
  assert.ok(Math.abs(normalCdf(1) - 0.841345) < 1e-5);
  assert.ok(Math.abs(normalCdf(-1.96) - 0.024998) < 1e-5);
});

test("reverse-keyed items are flipped, so a consistent responder gets their intended level", () => {
  const s = score(answersFor({ analytical: 7, conceptual: 1 }));
  assert.equal(s.raw.analytical, 7);
  assert.equal(s.raw.conceptual, 1);
});

test("a strong Analytical/Structural responder is bi-modal Blue/Green", () => {
  const s = score(answersFor({ analytical: 7, structural: 6, social: 3, conceptual: 2 }));
  assert.deepEqual(s.preferences, ["analytical", "structural"]);
  assert.equal(s.modality, "Bi-modal");
  assert.ok(s.percentages.conceptual < 23);
});

test("scoring exactly at the norm means gives the 50th percentile, 25% each and quadra-modal", () => {
  const atMean = Object.fromEntries(ATTRIBUTE_KEYS.map((k) => [k, { mean: 4, sd: 1 }])) as typeof NORMS;
  const s = score(answersFor({}, 4), atMean);
  for (const k of ATTRIBUTE_KEYS) assert.equal(s.percentiles[k], 50);
  assert.deepEqual(Object.values(s.percentages), [25, 25, 25, 25]);
  assert.equal(s.modality, "Quadra-modal");
  assert.equal(s.thirds.expressiveness, 2);
});

test("behavioral extremes map to first and third thirds", () => {
  const s = score(answersFor({ expressiveness: 7, assertiveness: 1, flexibility: 7 }));
  assert.equal(s.thirds.expressiveness, 3);
  assert.equal(s.thirds.assertiveness, 1);
  assert.equal(s.thirds.flexibility, 3);
});

test("validation rejects missing and out-of-range answers", () => {
  const good = answersFor({});
  assert.equal(validateAnswers(good).ok, true);
  const { [QUESTIONS[0].id]: _, ...missingOne } = good;
  assert.equal(validateAnswers(missingOne).ok, false);
  assert.equal(validateAnswers({ ...good, [QUESTIONS[1].id]: 9 }).ok, false);
  assert.equal(validateAnswers({ ...good, [QUESTIONS[1].id]: 3.5 }).ok, false);
});

test("item bank: 8 items per attribute, 2 reverse-keyed, steps cover every item once", () => {
  for (const k of ATTRIBUTE_KEYS) {
    const items = QUESTIONS.filter((q) => q.attribute === k);
    assert.equal(items.length, 8);
    assert.equal(items.filter((q) => q.reverse).length, 2);
    assert.ok(NORMS[k]);
  }
  const ids = buildSteps().flat().map((q) => q.id);
  assert.equal(ids.length, QUESTIONS.length);
  assert.equal(new Set(ids).size, QUESTIONS.length);
});
