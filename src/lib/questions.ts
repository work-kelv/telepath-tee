import type { AttributeKey } from "./attributes";
import { ATTRIBUTE_KEYS } from "./attributes";

// Original items written for this app (the official Emergenetics questionnaire is proprietary).
// Structure mirrors the Technical Report: seven Likert-scaled factors with ~8 items each.
// Reverse-keyed items ("reverse: true") reduce acquiescence bias.

export interface Question {
  id: string;
  attribute: AttributeKey;
  text: string;
  reverse?: boolean;
}

const BANK: Record<AttributeKey, Array<[string, boolean?]>> = {
  analytical: [
    ["I like to understand the logic behind how things work."],
    ["Before I accept a claim, I want to see the evidence or data."],
    ["I enjoy solving complex problems that require careful reasoning."],
    ["I prefer decisions based on objective analysis rather than gut feel."],
    ["I enjoy working with numbers, models or technical systems."],
    ["I keep asking “why?” until I reach the root cause."],
    ["I lose interest when a discussion becomes very technical or data-heavy.", true],
    ["I rarely question information if it comes from someone I trust.", true],
  ],
  structural: [
    ["I like to have a clear plan before I start a task."],
    ["I prefer step-by-step instructions to loose guidance."],
    ["I keep my work, schedule and files well organized."],
    ["I prefer proven methods over untested new approaches."],
    ["I like to finish one task before starting the next."],
    ["I pay close attention to details and accuracy."],
    ["I’m comfortable starting a project without knowing how it will unfold.", true],
    ["Rules and procedures often feel like unnecessary constraints to me.", true],
  ],
  social: [
    ["I can usually sense how other people are feeling."],
    ["I do my best thinking when collaborating with others."],
    ["When making decisions, I think about how they will affect people."],
    ["I learn well from other people’s stories and experiences."],
    ["Building good relationships with the people I work with matters a lot to me."],
    ["I enjoy helping others develop and succeed."],
    ["I prefer to solve problems on my own rather than involve others.", true],
    ["When there’s a job to do, people’s feelings are secondary to me.", true],
  ],
  conceptual: [
    ["I enjoy imagining future possibilities and asking “what if?”"],
    ["Ideas often come to me seemingly out of nowhere."],
    ["I like experimenting with unusual or unconventional ideas."],
    ["I need to see the big picture before the details make sense."],
    ["I often think in pictures, metaphors or analogies."],
    ["I’m energized by brainstorming and new concepts."],
    ["I prefer practical, concrete topics over abstract theories.", true],
    ["I’m skeptical of ideas that haven’t been tried before.", true],
  ],
  expressiveness: [
    ["I’m usually talkative in group settings."],
    ["People can easily read my emotions from my face and gestures."],
    ["I gain energy from being around lots of people."],
    ["I’m comfortable being the center of attention."],
    ["I tend to think out loud."],
    ["I share my feelings and experiences openly."],
    ["I prefer to observe quietly before joining a conversation.", true],
    ["After a busy social event, I need time alone to recharge.", true],
  ],
  assertiveness: [
    ["I state my opinions directly, even when others may disagree."],
    ["I take charge when a group lacks direction."],
    ["I enjoy a good debate."],
    ["I work at a fast, driving pace."],
    ["I’m comfortable confronting issues head-on."],
    ["I’m competitive and like to win."],
    ["I’d rather keep the peace than push my point of view.", true],
    ["I’m happy to let others take the lead.", true],
  ],
  flexibility: [
    ["I’m comfortable when plans change at the last minute."],
    ["I stay open to other people’s ideas, even after I’ve decided."],
    ["I handle ambiguous situations well."],
    ["I’m willing to go along with what the group wants."],
    ["I can easily see several sides of an issue."],
    ["I enjoy variety and switching between different tasks."],
    ["Once I’ve made a decision, I stick to it firmly.", true],
    ["I hold strong opinions that are hard to change.", true],
  ],
};

export const QUESTIONS: Question[] = ATTRIBUTE_KEYS.flatMap((attribute) =>
  BANK[attribute].map(([text, reverse], i) => ({
    id: `${attribute.slice(0, 3)}${i + 1}`,
    attribute,
    text,
    reverse: reverse ?? false,
  })),
);

export const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export const ITEMS_PER_ATTRIBUTE = 8;

/**
 * Splits the bank into steps that each contain one item per attribute, so no page
 * is "all about one thing". A fixed rotation (not random) keeps the order stable
 * between visits and for everyone taking the survey.
 */
export function buildSteps(): Question[][] {
  const steps: Question[][] = [];
  for (let s = 0; s < ITEMS_PER_ATTRIBUTE; s++) {
    const step = ATTRIBUTE_KEYS.map((a) => QUESTION_BY_ID.get(`${a.slice(0, 3)}${s + 1}`)!);
    const offset = (s * 3) % step.length;
    steps.push([...step.slice(offset), ...step.slice(0, offset)]);
  }
  return steps;
}

export const LIKERT = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Somewhat disagree" },
  { value: 4, label: "Neutral" },
  { value: 5, label: "Somewhat agree" },
  { value: 6, label: "Agree" },
  { value: 7, label: "Strongly agree" },
] as const;
