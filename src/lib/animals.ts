import { THINKING_KEYS, type ThinkingKey } from "./attributes";

// One animal for each combination of thinking preferences (15 in all: every set of one to
// four colors). Mottos and population shares are as presented in the "Teaming Up! With
// Emergenetics" workshop; the animals and summaries are this project's own.

export interface Animal {
  /** Thinking preferences, in the standard Analytical/Structural/Social/Conceptual order. */
  colors: ThinkingKey[];
  /** A typical thinking mix for this profile (percentages adding to 100), as drawn in its pie. */
  typical: Record<ThinkingKey, number>;
  name: string;
  /** What this mix of thinking preferences is like, in a sentence or two. */
  summary: string;
  motto: string;
  /** Share of people with this profile, in percent. */
  rarity: number;
  image: string;
}

export const ANIMALS: Animal[] = [
  {
    colors: ["analytical"],
    typical: { analytical: 64, structural: 12, social: 12, conceptual: 12 },
    name: "The Clipboard Detective Raccoon",
    summary: "Logic first. Thinks things through with data and reasoning, enjoys untangling complex problems, and wants evidence before agreeing.",
    motto: "In God we trust… all others must bring data.",
    rarity: 1,
    image: "raccoon.jpg",
  },
  {
    colors: ["structural"],
    typical: { analytical: 12, structural: 64, social: 12, conceptual: 12 },
    name: "The Punctual Penguin",
    summary: "Plan first. Likes clear steps, rules and predictability, pays close attention to detail, and finishes what it starts.",
    motto: "Of course I don’t look busy, I did it right the first time.",
    rarity: 6,
    image: "penguin.jpg",
  },
  {
    colors: ["social"],
    typical: { analytical: 12, structural: 12, social: 64, conceptual: 12 },
    name: "The Golden Retriever Puppy",
    summary: "People first. Reads how others feel, thinks best in conversation, and weighs every decision by its effect on people.",
    motto: "I wear my heart on my sleeve.",
    rarity: 1,
    image: "puppy.jpg",
  },
  {
    colors: ["conceptual"],
    typical: { analytical: 12, structural: 12, social: 12, conceptual: 64 },
    name: "The Daydreaming Chameleon",
    summary: "Ideas first. Imaginative and intuitive, sees the big picture, loves the unusual, and learns by experimenting.",
    motto: "I feel like I’m diagonally parked in a parallel universe.",
    rarity: 2,
    image: "chameleon.jpg",
  },
  {
    colors: ["analytical", "structural"],
    typical: { analytical: 42, structural: 40, social: 9, conceptual: 9 },
    name: "The Master Architect Ant",
    summary: "Logical and organized. Gathers the facts, builds a careful plan, then follows it through to the end.",
    motto: "Make a plan and follow it.",
    rarity: 15,
    image: "ant.jpg",
  },
  {
    colors: ["structural", "social"],
    typical: { analytical: 8, structural: 44, social: 40, conceptual: 8 },
    name: "The Camp Leader Squirrel",
    summary: "Practical and caring. Brings order to people\u2019s needs: reliable plans, clear roles and a well-looked-after team.",
    motto: "I’d love to share the experience with you, but please make an appointment first.",
    rarity: 14,
    image: "squirrel.jpg",
  },
  {
    colors: ["analytical", "conceptual"],
    typical: { analytical: 44, structural: 8, social: 8, conceptual: 40 },
    name: "The Astronomer Star-Fox",
    summary: "Big-picture strategist. Pairs rigorous analysis with imagination, seeing both the data and where it could lead.",
    motto: "I see the forest.",
    rarity: 13,
    image: "fox.jpg",
  },
  {
    colors: ["social", "conceptual"],
    typical: { analytical: 7, structural: 7, social: 42, conceptual: 44 },
    name: "The Community Mural Capybara",
    summary: "Creative and collaborative. Dreams up new possibilities with and for people, and builds ideas together.",
    motto: "Let’s create this together.",
    rarity: 12,
    image: "capybara.jpg",
  },
  {
    colors: ["structural", "conceptual"],
    typical: { analytical: 10, structural: 40, social: 10, conceptual: 40 },
    name: "The Origami Master Crane",
    summary: "Visionary builder. Has the wild ideas and the patience to turn them into step-by-step reality, a rare mix of new and proven.",
    motto: "Nailing jelly to the wall.",
    rarity: 4,
    image: "crane.jpg",
  },
  {
    colors: ["analytical", "social"],
    typical: { analytical: 42, structural: 10, social: 38, conceptual: 10 },
    name: "The Advice-Giver Dolphin",
    summary: "Head and heart. Checks both the evidence and the human impact, combining clear reasoning with empathy.",
    motto: "An informed head with a warm heart.",
    rarity: 3,
    image: "dolphin.jpg",
  },
  {
    colors: ["analytical", "social", "conceptual"],
    typical: { analytical: 32, structural: 8, social: 30, conceptual: 30 },
    name: "The Eco-Explorer Octopus",
    summary: "Global thinker. Combines analysis, a feel for people and big ideas; at home with strategy and change, lighter on routine.",
    motto: "What do you think of this global idea?",
    rarity: 12,
    image: "octopus.jpg",
  },
  {
    colors: ["analytical", "structural", "social"],
    typical: { analytical: 30, structural: 32, social: 30, conceptual: 8 },
    name: "The School Headmaster Badger",
    summary: "Efficient with feeling. Logical, organized and attentive to people: gets things done without leaving anyone behind.",
    motto: "Efficiency with feeling.",
    rarity: 7,
    image: "badger.jpg",
  },
  {
    colors: ["analytical", "structural", "conceptual"],
    typical: { analytical: 32, structural: 30, social: 8, conceptual: 30 },
    name: "The Rocket Engineer Beaver",
    summary: "Inventive doer. Turns ideas into results with logic and planning; the people side may need a deliberate thought.",
    motto: "Ideas are for doing.",
    rarity: 5,
    image: "beaver.jpg",
  },
  {
    colors: ["structural", "social", "conceptual"],
    typical: { analytical: 8, structural: 30, social: 32, conceptual: 30 },
    name: "The Circus Ringmaster Lion",
    summary: "Creative organizer. Imaginative and people-minded, with the structure to bring ideas to life.",
    motto: "Creative thinking with controlled emotions.",
    rarity: 5,
    image: "lion.jpg",
  },
  {
    colors: ["analytical", "structural", "social", "conceptual"],
    typical: { analytical: 25, structural: 25, social: 25, conceptual: 25 },
    name: "The Wise Forest Owl",
    summary: "Fair and balanced. Relates to every way of thinking and sees a problem from all angles, though picking one path can take time.",
    motto: "Fair and balanced.",
    rarity: 1,
    image: "owl.jpg",
  },
];

const key = (colors: ThinkingKey[]) => THINKING_KEYS.filter((k) => colors.includes(k)).join("+");
const BY_COLORS = new Map(ANIMALS.map((a) => [key(a.colors), a]));

/** The animal for a set of thinking preferences (order doesn't matter). */
export function animalFor(preferences: ThinkingKey[]): Animal {
  const animal = BY_COLORS.get(key(preferences));
  if (!animal) throw new Error(`No animal for ${preferences.join(", ")}`);
  return animal;
}

/** Public URL of an animal's picture, including the site's sub-folder when it has one. */
export function animalImage(animal: Animal): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/animals/${animal.image}`;
}

export const ANIMAL_GROUPS: Array<{ title: string; size: number }> = [
  { title: "Uni-modal: one color", size: 1 },
  { title: "Bi-modal: two colors", size: 2 },
  { title: "Tri-modal: three colors", size: 3 },
  { title: "Quadra-modal: all four colors", size: 4 },
];
