import { THINKING_KEYS, type ThinkingKey } from "./attributes";

// One animal for each combination of thinking preferences (15 in all: every set of one to
// four colors). Mottos and population shares are as presented in the "Teaming Up! With
// Emergenetics" workshop; the animals and their descriptions are this project's own.

export interface Animal {
  /** Thinking preferences, in the standard Analytical/Structural/Social/Conceptual order. */
  colors: ThinkingKey[];
  name: string;
  description: string;
  motto: string;
  /** Share of people with this profile, in percent. */
  rarity: number;
  image: string;
}

export const ANIMALS: Animal[] = [
  {
    colors: ["analytical"],
    name: "The Clipboard Detective Raccoon",
    description:
      "A sharp-eyed raccoon in round spectacles, carrying an oversized pocket calculator and cross-examining every clue with a magnifying glass.",
    motto: "In God we trust… all others must bring data.",
    rarity: 1,
    image: "raccoon.jpg",
  },
  {
    colors: ["structural"],
    name: "The Punctual Penguin",
    description:
      "An ultra-organized penguin in a tiny bowtie and hard hat, carrying color-coded checklists and arranging ice blocks in perfect, symmetrical rows.",
    motto: "Of course I don’t look busy, I did it right the first time.",
    rarity: 6,
    image: "penguin.jpg",
  },
  {
    colors: ["social"],
    name: "The Golden Retriever Puppy",
    description:
      "An energetic puppy with a bright heart on its shirt, making friends with every bird, bug and stranger it passes on the street.",
    motto: "I wear my heart on my sleeve.",
    rarity: 1,
    image: "puppy.jpg",
  },
  {
    colors: ["conceptual"],
    name: "The Daydreaming Chameleon",
    description:
      "A color-shifting lizard staring at the stars, doodling wild sci-fi landscapes on sticky notes instead of looking where it’s walking.",
    motto: "I feel like I’m diagonally parked in a parallel universe.",
    rarity: 2,
    image: "chameleon.jpg",
  },
  {
    colors: ["analytical", "structural"],
    name: "The Master Architect Ant",
    description:
      "A tiny ant in a high-vis vest holding blueprint scrolls, carefully calculating load distribution before moving a single leaf.",
    motto: "Make a plan and follow it.",
    rarity: 15,
    image: "ant.jpg",
  },
  {
    colors: ["structural", "social"],
    name: "The Camp Leader Squirrel",
    description:
      "A friendly squirrel who plans fun group games, but insists everyone lines up in alphabetical order and signs up for a time slot in advance.",
    motto: "I’d love to share the experience with you, but please make an appointment first.",
    rarity: 14,
    image: "squirrel.jpg",
  },
  {
    colors: ["analytical", "conceptual"],
    name: "The Astronomer Star-Fox",
    description:
      "A clever fox at a huge telescope, working through cosmic equations while dreaming up theories about deep-space galaxy maps.",
    motto: "I see the forest.",
    rarity: 13,
    image: "fox.jpg",
  },
  {
    colors: ["social", "conceptual"],
    name: "The Community Mural Capybara",
    description:
      "A chill, artistic capybara who gathers the neighborhood’s forest animals to paint a giant mural together, encouraging everyone to add their own ideas.",
    motto: "Let’s create this together.",
    rarity: 12,
    image: "capybara.jpg",
  },
  {
    colors: ["structural", "conceptual"],
    name: "The Origami Master Crane",
    description:
      "A bird that turns flat, wild ideas into intricate 3D paper structures, one precise step-by-step fold at a time.",
    motto: "Nailing jelly to the wall.",
    rarity: 4,
    image: "crane.jpg",
  },
  {
    colors: ["analytical", "social"],
    name: "The Advice-Giver Dolphin",
    description:
      "An empathetic sea creature who uses sonar data to help schoolmates navigate underwater currents, with plenty of comforting encouragement along the way.",
    motto: "An informed head with a warm heart.",
    rarity: 3,
    image: "dolphin.jpg",
  },
  {
    colors: ["analytical", "social", "conceptual"],
    name: "The Eco-Explorer Octopus",
    description:
      "A versatile octopus holding a map, a test tube and a megaphone, gathering data to pitch big, friendly ocean-cleanup ideas to marine life.",
    motto: "What do you think of this global idea?",
    rarity: 12,
    image: "octopus.jpg",
  },
  {
    colors: ["analytical", "structural", "social"],
    name: "The School Headmaster Badger",
    description:
      "An organized badger who manages school budgets and schedules down to the cent, but always leaves the office door open to comfort a stressed student.",
    motto: "Efficiency with feeling.",
    rarity: 7,
    image: "badger.jpg",
  },
  {
    colors: ["analytical", "structural", "conceptual"],
    name: "The Rocket Engineer Beaver",
    description:
      "A beaver who drafts wild spaceship blueprints, runs the fuel calculations, and builds the launchpad step by step.",
    motto: "Ideas are for doing.",
    rarity: 5,
    image: "beaver.jpg",
  },
  {
    colors: ["structural", "social", "conceptual"],
    name: "The Circus Ringmaster Lion",
    description:
      "A charismatic leader who designs magical creative acts, schedules the rehearsal timetable, and keeps every performer happy and in step.",
    motto: "Creative thinking with controlled emotions.",
    rarity: 5,
    image: "lion.jpg",
  },
  {
    colors: ["analytical", "structural", "social", "conceptual"],
    name: "The Wise Forest Owl",
    description:
      "A gentle, many-talented owl in a four-color sash who solves puzzles with logic, sets clear forest rules, listens with deep empathy and inspires everyone with big dreams.",
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
