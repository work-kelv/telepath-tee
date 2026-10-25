import {
  ATTRIBUTE_KEYS,
  BEHAVIOR,
  BEHAVIOR_KEYS,
  THINKING,
  THINKING_KEYS,
  type AttributeKey,
  type BehaviorKey,
  type ThinkingKey,
} from "./attributes";
import type { Scores } from "./scoring";

// Group analysis modelled on the Fieldbook's Group Profile, Dot Chart and WE-Team reports
// (p.69-74): averages are shown alongside individuals because a mid-range average can hide
// two very different extremes.

export interface Member {
  id: string;
  name: string;
  scores: Scores;
}

export interface Tension {
  kind: "thinking" | "behavior";
  title: string;
  detail: string;
  tip: string;
}

export interface Friction {
  a: string;
  b: string;
  tensions: Tension[];
}

export interface TeamAnalysis {
  averagePercentiles: Record<AttributeKey, number>;
  averagePercentages: Record<ThinkingKey, number>;
  coverage: Record<ThinkingKey, string[]>;
  gaps: ThinkingKey[];
  isWETeam: boolean;
  behaviorSpread: Record<BehaviorKey, { min: number; max: number; thirds: [number, number, number] }>;
  frictions: Friction[];
  synergies: Array<{ a: string; b: string; shared: ThinkingKey[] }>;
  observations: string[];
}

const THINKING_TENSIONS: Array<{ pair: [ThinkingKey, ThinkingKey]; title: string; detail: string; tip: string }> = [
  {
    pair: ["structural", "conceptual"],
    title: "Plan vs. possibilities",
    detail: "One wants a defined plan and closure; the other wants to keep exploring options and change course.",
    tip: "Agree up front which decisions are fixed and which are open, and time-box the brainstorming.",
  },
  {
    pair: ["analytical", "social"],
    title: "Data vs. people",
    detail: "One leads with logic and evidence; the other leads with relationships and how people feel.",
    tip: "Present the evidence and the people impact together, and treat both as legitimate input.",
  },
  {
    pair: ["analytical", "conceptual"],
    title: "Proof vs. intuition",
    detail: "Both want the bottom line, but one needs facts behind it while the other accepts a theory that feels right.",
    tip: "Let the intuitive idea lead, then agree on what evidence would confirm it.",
  },
  {
    pair: ["structural", "social"],
    title: "Task vs. rapport",
    detail: "One wants to get through the agenda efficiently; the other wants time to connect and tell the story.",
    tip: "Start with a few minutes of connection, then follow a clear agenda.",
  },
];

const BEHAVIOR_TENSIONS: Record<BehaviorKey, { title: string; detail: string; tip: string }> = {
  expressiveness: {
    title: "Internal vs. external processing",
    detail: "One thinks out loud and expects an energetic response; the other reflects quietly and may seem unreadable.",
    tip: "Share agendas ahead of time, allow written input, and don’t read quiet as disengaged.",
  },
  assertiveness: {
    title: "Pace and push",
    detail: "One drives fast and says things directly; the other prefers a calmer pace and may withdraw from confrontation.",
    tip: "Make space for the quieter voice, and frame directness as caring about the outcome.",
  },
  flexibility: {
    title: "Settled vs. open",
    detail: "One wants decisions locked so they can focus; the other keeps re-opening options as new ideas come up.",
    tip: "Set explicit decision points and a process for proposing changes after them.",
  },
};

const BEHAVIOR_GAP = 50;

function mean(xs: number[]): number {
  return xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
}

export function analyzeTeam(members: Member[]): TeamAnalysis {
  const averagePercentiles = Object.fromEntries(
    ATTRIBUTE_KEYS.map((k) => [k, mean(members.map((m) => m.scores.percentiles[k]))]),
  ) as Record<AttributeKey, number>;
  const averagePercentages = Object.fromEntries(
    THINKING_KEYS.map((k) => [k, mean(members.map((m) => m.scores.percentages[k]))]),
  ) as Record<ThinkingKey, number>;

  const coverage = Object.fromEntries(
    THINKING_KEYS.map((k) => [k, members.filter((m) => m.scores.preferences.includes(k)).map((m) => m.name)]),
  ) as Record<ThinkingKey, string[]>;
  const gaps = THINKING_KEYS.filter((k) => coverage[k].length === 0);

  const behaviorSpread = Object.fromEntries(
    BEHAVIOR_KEYS.map((k) => {
      const ps = members.map((m) => m.scores.percentiles[k]);
      const thirds: [number, number, number] = [0, 0, 0];
      members.forEach((m) => thirds[m.scores.thirds[k] - 1]++);
      return [k, { min: Math.min(...ps), max: Math.max(...ps), thirds }];
    }),
  ) as TeamAnalysis["behaviorSpread"];

  const frictions: Friction[] = [];
  const synergies: TeamAnalysis["synergies"] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const [x, y] = [members[i], members[j]];
      const px = x.scores.preferences;
      const py = y.scores.preferences;
      const tensions: Tension[] = [];

      for (const { pair, ...t } of THINKING_TENSIONS) {
        const [p, q] = pair;
        const opposed =
          (px.includes(p) && !px.includes(q) && py.includes(q) && !py.includes(p)) ||
          (px.includes(q) && !px.includes(p) && py.includes(p) && !py.includes(q));
        if (opposed) tensions.push({ kind: "thinking", ...t });
      }
      for (const k of BEHAVIOR_KEYS) {
        if (Math.abs(x.scores.percentiles[k] - y.scores.percentiles[k]) >= BEHAVIOR_GAP) {
          tensions.push({ kind: "behavior", ...BEHAVIOR_TENSIONS[k] });
        }
      }
      if (tensions.length) frictions.push({ a: x.name, b: y.name, tensions });
      const shared = px.filter((k) => py.includes(k));
      if (shared.length) synergies.push({ a: x.name, b: y.name, shared });
    }
  }

  const observations: string[] = [];
  if (members.length > 1) {
    observations.push(
      gaps.length === 0
        ? "This is a WE-Team (Whole Emergenetics): every thinking attribute is a preference for at least one person."
        : `No one has a preference in ${gaps.map((k) => THINKING[k].name).join(" or ")}. The group will need to deliberately ask “${gaps.map((k) => THINKING[k].question).join("” and “")}”, or borrow that perspective from someone outside it.`,
    );
    const crowded = THINKING_KEYS.filter((k) => coverage[k].length === members.length);
    if (crowded.length)
      observations.push(
        `Everyone shares a ${crowded.map((k) => THINKING[k].name).join(" and ")} preference. Communication in that mode will be easy, but watch for group blind spots.`,
      );
    for (const k of BEHAVIOR_KEYS) {
      const { min, max } = behaviorSpread[k];
      if (max - min < 25)
        observations.push(
          `${BEHAVIOR[k].name} is tightly clustered (${min}–${max}th percentile), so the group behaves similarly here, which feels comfortable but can limit range.`,
        );
      else if (max - min >= 60)
        observations.push(
          `${BEHAVIOR[k].name} spans ${min}–${max}. The average (${averagePercentiles[k]}) hides two very different styles in the room.`,
        );
    }
  }

  return {
    averagePercentiles,
    averagePercentages,
    coverage,
    gaps,
    isWETeam: gaps.length === 0,
    behaviorSpread,
    frictions: frictions.sort((f, g) => g.tensions.length - f.tensions.length),
    synergies,
    observations,
  };
}
