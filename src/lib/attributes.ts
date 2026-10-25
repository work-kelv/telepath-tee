// Attribute definitions distilled from the three source documents:
//  - Technical Report 2022 (p.8, p.24): attribute definitions and behavioral continua
//  - Amplitude Fieldbook 2018 (p.81-93): "Considerations" pages, spectrum labels, thirds
//  - Meeting of the Minds eWorkbook 2017 (p.10, p.14): 23% preference rule, workshop cues

export type ThinkingKey = "analytical" | "structural" | "social" | "conceptual";
export type BehaviorKey = "expressiveness" | "assertiveness" | "flexibility";
export type AttributeKey = ThinkingKey | BehaviorKey;

export const THINKING_KEYS: ThinkingKey[] = ["analytical", "structural", "social", "conceptual"];
export const BEHAVIOR_KEYS: BehaviorKey[] = ["expressiveness", "assertiveness", "flexibility"];
export const ATTRIBUTE_KEYS: AttributeKey[] = [...THINKING_KEYS, ...BEHAVIOR_KEYS];

export interface ThinkingAttribute {
  key: ThinkingKey;
  name: string;
  short: string;
  color: string;
  colorName: string;
  question: string;
  definition: string;
  traits: string[];
  workshopCues: string[];
  problemSolving: string;
  creativeGift: string;
  leaderRole: string;
  environment: string[];
  energizers: string[];
  communicateTips: string[];
  motivators: string[];
  avoid: string[];
  sampleLines: string[];
}

export const THINKING: Record<ThinkingKey, ThinkingAttribute> = {
  analytical: {
    key: "analytical",
    name: "Analytical",
    short: "ANA",
    color: "#3A78E0",
    colorName: "Blue",
    question: "Why?",
    definition:
      "An interest in problem-solving, understanding complex subjects and mental analysis.",
    traits: ["Clear thinker", "Logical problem solver", "Data driven", "Rational", "Learns by mental analysis"],
    workshopCues: ["Prove it / numbers", "Research", "Executive summary", "Facts"],
    problemSolving: "Rational, logical, scientific method.",
    creativeGift: "Good at designing systems.",
    leaderRole: "Clearly in charge, rational and instructive.",
    environment: [
      "A formal, well-lit, focused workspace",
      "Access to data, research and expert sources",
      "Room to dig deeply into one complex problem",
    ],
    energizers: ["Staying on task", "Getting to the bottom line, with the reasoning shown"],
    communicateTips: [
      "Lead with the executive summary, then the evidence",
      "Back up claims with data, research or cited sources",
      "Use precise, clear language and stay on topic",
      "Send material ahead of time so they can come prepared",
    ],
    motivators: ["Hard, interesting problems", "Recognition for well-reasoned work", "Competent, knowledgeable peers"],
    avoid: ["Vague claims with no evidence", "Irrelevant tangents", "Sloppy or unprepared work"],
    sampleLines: ["“What does the data say?”", "“What’s the cost/benefit?”"],
  },
  structural: {
    key: "structural",
    name: "Structural",
    short: "STR",
    color: "#17703D",
    colorName: "Green",
    question: "How? When?",
    definition: "A preference for rules and guidelines, stability, a hands-on approach and avoiding risk.",
    traits: ["Practical thinker", "Likes guidelines", "Cautious of new ideas", "Predictable", "Learns by doing"],
    workshopCues: ["Bullet points", "Follows plans and rules", "To-do lists", "Clear instructions", "Details"],
    problemSolving: "A detailed, methodical, step-by-step process.",
    creativeGift: "Makes sense out of chaos by organizing it into a system.",
    leaderRole: "Gives procedure and direction so something tangible can be measured at the end.",
    environment: [
      "An organized, minimalist, predictable space",
      "Clear agendas, deadlines and written procedures",
      "Projects with defined parameters and a visible finish line",
    ],
    energizers: ["Following up on details", "Bringing work to closure"],
    communicateTips: [
      "Use an agenda and stick to it; flag any detour before you take it",
      "Give step-by-step, written instructions and timelines",
      "Summarize key points and next actions at the end",
      "Double-check accuracy: details and spelling matter",
    ],
    motivators: ["Clear expectations", "Finishing what was started", "Reliable plans and processes"],
    avoid: ["Last-minute surprises", "Ambiguous ownership or deadlines", "Changing direction without explanation"],
    sampleLines: ["“What’s the plan?”", "“If it ain’t broke, don’t fix it.”"],
  },
  social: {
    key: "social",
    name: "Social",
    short: "SOC",
    color: "#EE5E57",
    colorName: "Red",
    question: "Who?",
    definition: "Intuitive about people, socially aware, enjoys working in teams and connecting with others.",
    traits: ["Relational", "Intuitive about people", "Socially aware", "Empathic", "Learns from others"],
    workshopCues: ["Stories", "Teamwork", "Builds rapport", "People first"],
    problemSolving: "Connecting with people, enlisting their help and engaging them in the solution.",
    creativeGift: "Helps very different people work well together.",
    leaderRole: "Interpreter, coach, facilitator and empathic friend.",
    environment: [
      "A casual, warm and collaborative atmosphere",
      "Regular contact with teammates and stakeholders",
      "Work that visibly helps people",
    ],
    energizers: ["A comfortable environment", "Variety and movement", "Real-world stories"],
    communicateTips: [
      "Build rapport before diving into the task",
      "Use real-world examples and stories about people",
      "Explain who is affected and how",
      "Follow up conversations with written next steps",
    ],
    motivators: ["Feeling valued and included", "Helping others grow", "A trusting team"],
    avoid: ["Cold, purely transactional exchanges", "Insensitive humor", "Decisions that ignore the people impact"],
    sampleLines: ["“Who else should we involve?”", "“How will the team feel about this?”"],
  },
  conceptual: {
    key: "conceptual",
    name: "Conceptual",
    short: "CON",
    color: "#D9A514",
    colorName: "Yellow",
    question: "What if?",
    definition: "Intuitive about ideas, seeks unique activities and experimentation, futuristic and visionary.",
    traits: ["Imaginative", "Intuitive about ideas", "Visionary", "Enjoys the unusual", "Learns by experimenting"],
    workshopCues: ["Metaphors and pictures", "Big-picture overview", "Brainstorming", "Ideas"],
    problemSolving: "Takes in lots of input, explores every option, then steps away until the answer pops up.",
    creativeGift: "Creative in the traditional sense: clever, inventive, artistic.",
    leaderRole: "A hands-off facilitator who presents options and lets people experiment.",
    environment: [
      "An informal, flexible and visually stimulating space",
      "Freedom to experiment and try new approaches",
      "Variety, with something new every so often",
    ],
    energizers: ["Brainstorming", "Experimenting", "Humor and the unexpected"],
    communicateTips: [
      "Start with the big picture and the “why it matters”",
      "Use metaphors, visuals and analogies",
      "Keep the pace up and invite “what if” questions",
      "Leave room for their ideas before locking the plan",
    ],
    motivators: ["Novel challenges", "Freedom to explore", "Future-focused vision"],
    avoid: ["Long, detail-heavy walkthroughs", "“We’ve always done it this way”", "Shutting down ideas too early"],
    sampleLines: ["“What if we tried…?”", "“Imagine where this could go.”"],
  },
};

export type Third = 1 | 2 | 3;

export interface BehaviorAttribute {
  key: BehaviorKey;
  name: string;
  short: string;
  definition: string;
  /** Five labels evenly spaced across the 0-100 percentile spectrum (Fieldbook p.63). */
  spectrum: [string, string, string, string, string];
  ends: { low: string; high: string };
  thirds: Record<Third, { title: string; traits: string[]; summary: string }>;
}

export const BEHAVIOR: Record<BehaviorKey, BehaviorAttribute> = {
  expressiveness: {
    key: "expressiveness",
    name: "Expressiveness",
    short: "EXP",
    definition: "The outward display of emotions toward others and the world at large.",
    spectrum: ["Quiet", "Introspective", "Reserved", "Talkative", "Gregarious"],
    ends: { low: "Quiet end", high: "Gregarious end" },
    thirds: {
      1: {
        title: "Quiet",
        traits: ["Likes time alone", "Avoids the limelight", "Recharges alone", "Likes time to reflect", "Appears calm, even under stress"],
        summary:
          "is probably calm, thoughtful and quiet, keeps thoughts private until ready, and learns by listening and reflecting.",
      },
      2: {
        title: "It Depends",
        traits: ["Flexes between quiet and gregarious", "Reads the room first"],
        summary:
          "is in the “It Depends” group, comfortably flexing between reflective and outgoing depending on the situation.",
      },
      3: {
        title: "Gregarious",
        traits: ["Spontaneous and animated", "Draws energy from people", "Loves to share experiences", "Thinks out loud"],
        summary:
          "is probably animated, spontaneous and energized by people, sharing thoughts and feelings openly and often.",
      },
    },
  },
  assertiveness: {
    key: "assertiveness",
    name: "Assertiveness",
    short: "ASR",
    definition: "The style and pace with which you advance thoughts, feelings and beliefs.",
    spectrum: ["Peacekeeping", "Easygoing", "Competitive", "Forceful", "Driving"],
    ends: { low: "Peacekeeping end", high: "Driving end" },
    thirds: {
      1: {
        title: "Peacekeeping",
        traits: ["Easygoing", "Seeks peaceful resolution", "Calming approach", "Gentle, consistent pace"],
        summary:
          "probably prefers a calm, steady pace, seeks harmony and is more likely to ask than to tell.",
      },
      2: {
        title: "It Depends",
        traits: ["Can lead or follow", "Steps up when it matters"],
        summary:
          "is in the “It Depends” group: they may step up and take charge, or step back and let others lead.",
      },
      3: {
        title: "Driving",
        traits: ["Telling", "Competitive", "Embraces confrontation", "Loves debate", "Fast, forceful pace"],
        summary:
          "probably moves at a fast, driving pace, states views directly, enjoys debate and tends to lead more than follow.",
      },
    },
  },
  flexibility: {
    key: "flexibility",
    name: "Flexibility",
    short: "FLX",
    definition: "Willingness to accommodate the thoughts and actions of others.",
    spectrum: ["Focused", "Firm", "Adaptable", "Accommodating", "Welcomes Change"],
    ends: { low: "Focused end", high: "Welcomes change" },
    thirds: {
      1: {
        title: "Focused",
        traits: ["Likes situations defined", "Holds strong opinions", "Decides easily", "Energized by maintaining focus"],
        summary:
          "probably likes situations clearly defined, decides easily and holds a position firmly once it is set.",
      },
      2: {
        title: "It Depends",
        traits: ["Easygoing or firm by situation", "Chooses where to spend energy"],
        summary:
          "is in the “It Depends” group: sometimes easygoing and accommodating, sometimes firm, depending on the situation and the people involved.",
      },
      3: {
        title: "Welcomes Change",
        traits: ["Open to suggestions", "Handles ambiguity", "Sees many points of view", "Tolerant of unplanned changes"],
        summary:
          "is probably open to other views, comfortable with ambiguity and energized rather than drained by change.",
      },
    },
  },
};

export function attributeName(key: AttributeKey): string {
  return key in THINKING ? THINKING[key as ThinkingKey].name : BEHAVIOR[key as BehaviorKey].name;
}

export const BEHAVIOR_COLOR = "#7C4DCC";
