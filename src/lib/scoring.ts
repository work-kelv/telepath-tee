import {
  ATTRIBUTE_KEYS,
  BEHAVIOR_KEYS,
  THINKING_KEYS,
  type AttributeKey,
  type BehaviorKey,
  type ThinkingKey,
  type Third,
} from "./attributes";
import { QUESTIONS } from "./questions";

/*
 * Scoring pipeline (Technical Report p.7-8, Fieldbook p.63 & p.91-93, Workbook p.10):
 *
 *   1. Raw score      mean of the 1-7 Likert answers per attribute (reverse items flipped: 8 - x)
 *   2. Percentile     raw score -> z against norms -> normal CDF -> 1..99
 *                     ("interpersonal" measure: how you compare to the population)
 *   3. Percentage mix the 4 thinking percentiles normalised to sum to 100%
 *                     ("intrapersonal" measure: how your own thinking energy is distributed).
 *                     Verified against the sample profile in the Fieldbook: percentiles
 *                     95/90/48/5 -> 40/38/20/2 %.
 *   4. Preference     a thinking attribute is a preference when its percentage is >= 23%
 *   5. Thirds         behavioral percentiles: 0-33 first, 34-66 second ("It Depends"), 67-100 third
 */

export type Answers = Record<string, number>;

export interface Norm {
  mean: number;
  sd: number;
}

/**
 * Provisional norms for this item bank on a 1-7 scale. The real instrument is re-normed
 * every two years against a global population; these values assume typical self-report
 * behavior (mean slightly above the midpoint) and should be replaced with means/SDs
 * computed from your own data once you have a few dozen responses.
 */
export const NORMS: Record<AttributeKey, Norm> = {
  analytical: { mean: 4.6, sd: 0.95 },
  structural: { mean: 4.5, sd: 0.95 },
  social: { mean: 4.8, sd: 0.9 },
  conceptual: { mean: 4.5, sd: 1.0 },
  expressiveness: { mean: 4.2, sd: 1.05 },
  assertiveness: { mean: 4.3, sd: 1.0 },
  flexibility: { mean: 4.4, sd: 0.9 },
};

export const PREFERENCE_THRESHOLD = 23;
export const LIKERT_MIN = 1;
export const LIKERT_MAX = 7;

export type Modality = "Uni-modal" | "Bi-modal" | "Tri-modal" | "Quadra-modal";

export interface Scores {
  raw: Record<AttributeKey, number>;
  percentiles: Record<AttributeKey, number>;
  percentages: Record<ThinkingKey, number>;
  preferences: ThinkingKey[];
  modality: Modality;
  thirds: Record<BehaviorKey, Third>;
}

/** Abramowitz-Stegun 7.1.26 approximation of the standard normal CDF (|error| < 1.5e-7). */
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-(z * z) / 2);
  return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}

export function toPercentile(raw: number, norm: Norm): number {
  const p = Math.round(normalCdf((raw - norm.mean) / norm.sd) * 100);
  return Math.min(99, Math.max(1, p));
}

export function toThird(percentile: number): Third {
  if (percentile <= 33) return 1;
  if (percentile <= 66) return 2;
  return 3;
}

/** Normalises percentiles to whole percentages summing to exactly 100 (largest-remainder rounding). */
export function toPercentages(percentiles: Record<ThinkingKey, number>): Record<ThinkingKey, number> {
  const total = THINKING_KEYS.reduce((sum, k) => sum + percentiles[k], 0);
  const exact = THINKING_KEYS.map((k) => ({ k, v: total > 0 ? (percentiles[k] / total) * 100 : 25 }));
  const floored = exact.map((e) => ({ ...e, f: Math.floor(e.v) }));
  let remainder = 100 - floored.reduce((s, e) => s + e.f, 0);
  [...floored]
    .sort((a, b) => b.v - b.f - (a.v - a.f))
    .forEach((e) => {
      if (remainder > 0) {
        e.f += 1;
        remainder -= 1;
      }
    });
  return Object.fromEntries(floored.map((e) => [e.k, e.f])) as Record<ThinkingKey, number>;
}

const MODALITY: Modality[] = ["Uni-modal", "Uni-modal", "Bi-modal", "Tri-modal", "Quadra-modal"];

export function validateAnswers(answers: unknown): { ok: true; answers: Answers } | { ok: false; error: string } {
  if (!answers || typeof answers !== "object") return { ok: false, error: "Answers are required." };
  const a = answers as Record<string, unknown>;
  const missing = QUESTIONS.filter((q) => {
    const v = a[q.id];
    return typeof v !== "number" || !Number.isInteger(v) || v < LIKERT_MIN || v > LIKERT_MAX;
  });
  if (missing.length) return { ok: false, error: `${missing.length} question(s) are unanswered or invalid.` };
  return { ok: true, answers: Object.fromEntries(QUESTIONS.map((q) => [q.id, a[q.id] as number])) };
}

export function score(answers: Answers, norms: Record<AttributeKey, Norm> = NORMS): Scores {
  const raw = {} as Record<AttributeKey, number>;
  for (const key of ATTRIBUTE_KEYS) {
    const items = QUESTIONS.filter((q) => q.attribute === key);
    const sum = items.reduce((s, q) => s + (q.reverse ? LIKERT_MAX + LIKERT_MIN - answers[q.id] : answers[q.id]), 0);
    raw[key] = Math.round((sum / items.length) * 100) / 100;
  }

  const percentiles = Object.fromEntries(
    ATTRIBUTE_KEYS.map((k) => [k, toPercentile(raw[k], norms[k])]),
  ) as Record<AttributeKey, number>;

  const percentages = toPercentages(percentiles);
  const preferences = THINKING_KEYS.filter((k) => percentages[k] >= PREFERENCE_THRESHOLD).sort(
    (a, b) => percentages[b] - percentages[a],
  );
  const thirds = Object.fromEntries(BEHAVIOR_KEYS.map((k) => [k, toThird(percentiles[k])])) as Record<
    BehaviorKey,
    Third
  >;

  return { raw, percentiles, percentages, preferences, modality: MODALITY[preferences.length], thirds };
}

/** Thinking attributes ordered from most to least preferred (ties broken by percentile). */
export function rankedThinking(s: Scores): ThinkingKey[] {
  return [...THINKING_KEYS].sort(
    (a, b) => s.percentages[b] - s.percentages[a] || s.percentiles[b] - s.percentiles[a],
  );
}
