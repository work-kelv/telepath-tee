import {
  BEHAVIOR,
  BEHAVIOR_KEYS,
  THINKING,
  type BehaviorKey,
  type ThinkingKey,
  type Third,
} from "./attributes";
import { rankedThinking, type Scores } from "./scoring";

// Turns scores into plain-language guidance. Wording follows the Fieldbook's tip-sheet
// format (p.63-64) and "Considerations" pages, phrased as tendencies, never verdicts:
// the profile describes preferences, not ability.

export function spectrumLabel(key: BehaviorKey, percentile: number): string {
  const labels = BEHAVIOR[key].spectrum;
  return labels[Math.min(4, Math.floor(percentile / 20))];
}

export function thirdLabel(third: Third): string {
  return ["", "First third", "Second third", "Third third"][third];
}

export function profileTitle(s: Scores): string {
  return s.preferences.map((k) => THINKING[k].name).join(" / ");
}

const PAIR_NOTES: Array<{ pair: [ThinkingKey, ThinkingKey]; note: string }> = [
  {
    pair: ["analytical", "structural"],
    note:
      "Analytical/Structural thinkers tend to dive deep rather than skim: rational, methodical and good at time management. Ideas are judged on evidence and practicality, so new ideas may get a cautious first look.",
  },
  {
    pair: ["analytical", "conceptual"],
    note:
      "Analytical and Conceptual together want you to cut to the chase. The Analytical side needs the facts behind a theory; the Conceptual side runs ahead to what it could become. Expect sharp questions if you come unprepared.",
  },
  {
    pair: ["structural", "social"],
    note:
      "Structural and Social together want practical, well-organized work delivered with warmth. Too much theory feels “pie in the sky”; too little care for people feels cold.",
  },
  {
    pair: ["social", "conceptual"],
    note:
      "Social and Conceptual together are intuitive about both people and ideas: imaginative, empathic and drawn to possibilities that help others. Detailed plans may need a partner.",
  },
  {
    pair: ["analytical", "social"],
    note:
      "Analytical and Social together balance the head and the heart: decisions are checked for evidence and for their impact on people.",
  },
  {
    pair: ["structural", "conceptual"],
    note:
      "Structural and Conceptual together hold an interesting tension: ideas and possibilities on one side, plans and follow-through on the other. This mix can both dream it and build it.",
  },
];

const DECISIONS: Record<ThinkingKey, string> = {
  analytical: "Weighs the options against data and logic before committing.",
  structural: "Follows a proven, step-by-step process and checks the details.",
  social: "Considers who is affected and often checks in with others.",
  conceptual: "Trusts intuition and explores many options, sometimes stepping away until the answer clicks.",
};

const REACH: Record<ThinkingKey, string> = {
  analytical: "Present a logical case with evidence, then let them question it.",
  structural: "Give a clear plan with steps, owners and dates, in writing.",
  social: "Connect personally first, then explain how it helps people.",
  conceptual: "Paint the big picture and invite their ideas early.",
};

const FLEX_TOWARD: Record<BehaviorKey, Record<Third, string>> = {
  expressiveness: {
    1: "Think before you speak. Use fewer words and gestures, and give them time to reflect.",
    2: "Meet in the middle: neither too subdued nor too animated.",
    3: "Bring energy and enthusiasm, and give them space to talk it through.",
  },
  assertiveness: {
    1: "Slow your pace, ask rather than tell, and keep the tone calm.",
    2: "Meet in the middle: neither too slow nor too fast-paced.",
    3: "Be direct and get to the point. Healthy debate is welcome, not rude.",
  },
  flexibility: {
    1: "Give advance notice of changes, a clear reason, and a defined decision.",
    2: "Meet in the middle: neither rigidly defined nor too many open options.",
    3: "Offer options and room to adapt. Avoid locking things down too early.",
  },
};

export interface TipSheet {
  thinking: string;
  reach: string;
  decisions: string;
  processor: string;
  needsTime: string;
  change: string;
  driver: string;
  multitask: string;
}

export function tipSheet(s: Scores): TipSheet {
  const ranked = rankedThinking(s);
  const top = ranked[0];
  const { expressiveness: exp, assertiveness: asr, flexibility: flx } = s.thirds;
  const prefers = (k: ThinkingKey) => s.preferences.includes(k);
  return {
    thinking: THINKING[top].traits.slice(0, 3).join(", "),
    reach: REACH[top],
    decisions: DECISIONS[top],
    processor: exp === 1 ? "Internal: thinks before elaborating" : exp === 3 ? "External: thinks out loud" : "Either, depending on the situation",
    needsTime: exp === 1 || ((prefers("analytical") || prefers("structural")) && exp !== 3) ? "Yes" : exp === 3 ? "Not usually" : "Sometimes",
    change: flx === 3 ? "Yes, energized by it" : flx === 1 ? "Prefers notice and a good reason" : "Reacts based on the situation",
    driver: asr === 3 ? "Yes, fast-paced and driven" : asr === 1 ? "Rarely, prefers a calm, steady pace" : "Can be, when personally invested",
    multitask:
      prefers("conceptual") || flx === 3 ? "Yes, enjoys variety" : prefers("structural") && flx === 1 ? "Prefers one thing at a time" : "Sometimes",
  };
}

export interface Report {
  title: string;
  headline: string;
  summary: string[];
  combination?: string;
  strengths: ThinkingKey[];
  leastPreferred: ThinkingKey;
  behaviors: Array<{
    key: BehaviorKey;
    percentile: number;
    third: Third;
    label: string;
    sentence: string;
  }>;
  communication: string[];
  environment: string[];
  flexToward: string[];
  tips: TipSheet;
}

function unique<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}

export function buildReport(name: string, s: Scores): Report {
  const ranked = rankedThinking(s);
  const first = name.trim().split(/\s+/)[0] || "This person";
  const prefs = s.preferences;
  const least = ranked[ranked.length - 1];

  const headline =
    prefs.length === 4
      ? `${first} draws evenly on all four thinking attributes, so they can speak every “language” in the room.`
      : `${first} is a ${s.modality.toLowerCase()} thinker with a preference for ${listJoin(prefs.map((k) => THINKING[k].name))} thinking.`;

  const summary = [
    `${first}’s strongest thinking attribute is ${THINKING[ranked[0]].name} (${s.percentages[ranked[0]]}%), which asks “${THINKING[ranked[0]].question}”. ${THINKING[ranked[0]].definition}`,
    prefs.length < 4
      ? `${THINKING[least].name} (${s.percentages[least]}%) is least preferred. That isn’t a lack of skill: it just takes more energy, like driving a dirt road instead of a highway.`
      : `With no attribute under 23%, ${first} can move between perspectives with relatively little effort. The trade-off is that a group may not always see one clear “default”.`,
    `Behaviorally, ${first} ${BEHAVIOR.expressiveness.thirds[s.thirds.expressiveness].summary}`,
  ];

  const pairNote = PAIR_NOTES.find(({ pair }) => prefs.slice(0, 2).every((p) => pair.includes(p)) && prefs.length >= 2);

  const behaviors = BEHAVIOR_KEYS.map((key) => ({
    key,
    percentile: s.percentiles[key],
    third: s.thirds[key],
    label: spectrumLabel(key, s.percentiles[key]),
    sentence: `${first} ${BEHAVIOR[key].thirds[s.thirds[key]].summary}`,
  }));

  return {
    title: profileTitle(s),
    headline,
    summary,
    combination: pairNote?.note,
    strengths: prefs,
    leastPreferred: least,
    behaviors,
    communication: unique(prefs.flatMap((k) => THINKING[k].communicateTips.slice(0, prefs.length > 2 ? 2 : 3))),
    environment: unique(prefs.flatMap((k) => THINKING[k].environment.slice(0, 2))).concat(
      s.thirds.expressiveness === 1
        ? ["Quiet time and space to think before contributing"]
        : s.thirds.expressiveness === 3
          ? ["Plenty of interaction and chances to talk ideas through"]
          : [],
    ),
    flexToward: BEHAVIOR_KEYS.map((k) => FLEX_TOWARD[k][s.thirds[k]]),
    tips: tipSheet(s),
  };
}

export interface CheatSheet {
  communicate: string[];
  motivate: string[];
  collaborate: string[];
  avoid: string[];
}

export function cheatSheet(s: Scores): CheatSheet {
  const prefs = s.preferences;
  const take = (pick: (k: ThinkingKey) => string[], n: number) => unique(prefs.flatMap((k) => pick(k).slice(0, n)));
  const { expressiveness: exp, assertiveness: asr, flexibility: flx } = s.thirds;
  const collaborate = [
    exp === 1 ? "Send questions ahead; I give my best answers after reflecting" : exp === 3 ? "Let me think out loud; my first take is a draft" : "Ask whether I’d like to talk it through or think it over",
    asr === 1 ? "Invite my view directly; I may not push to be heard" : asr === 3 ? "Disagree openly; I see debate as progress, not conflict" : "Tell me when you need me to lead and when to support",
    flx === 1 ? "Agree on decisions and stick to them; flag changes early" : flx === 3 ? "Keep options open; I adapt quickly when things change" : "Tell me which parts are fixed and which are flexible",
  ];
  return {
    communicate: take((k) => THINKING[k].communicateTips, prefs.length > 2 ? 1 : 2),
    motivate: take((k) => THINKING[k].motivators, prefs.length > 2 ? 1 : 2),
    collaborate,
    avoid: take((k) => THINKING[k].avoid, prefs.length > 2 ? 1 : 2).slice(0, 4),
  };
}

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
