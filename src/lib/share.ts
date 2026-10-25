import { QUESTIONS } from "./questions";
import { LIKERT_MAX, LIKERT_MIN, score, type Answers, type Scores } from "./scoring";

// Profiles are never stored. A report lives entirely in its link: the answers and the
// name are packed into the URL fragment (the part after "#"), which browsers never send
// to the server. Format: "1.<56 digits, one per question in bank order>.<name, base64url>".

const VERSION = "1";
export const MAX_NAME_LENGTH = 40;

export interface Profile {
  name: string;
  answers: Answers;
  scores: Scores;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): string {
  const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function cleanName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

export function encodeProfile(name: string, answers: Answers): string {
  const digits = QUESTIONS.map((q) => {
    const v = answers[q.id];
    if (!Number.isInteger(v) || v < LIKERT_MIN || v > LIKERT_MAX) throw new Error(`Missing answer for ${q.id}`);
    return String(v);
  }).join("");
  return `${VERSION}.${digits}.${toBase64Url(cleanName(name))}`;
}

/** Returns null for anything that isn't a complete, valid profile code. */
export function decodeProfile(code: string): Profile | null {
  try {
    const [version, digits, encodedName] = decodeURIComponent(code.replace(/^#/, "")).trim().split(".");
    if (version !== VERSION || !digits || digits.length !== QUESTIONS.length || !/^[1-7]+$/.test(digits)) return null;
    const name = cleanName(encodedName ? fromBase64Url(encodedName) : "") || "Anonymous";
    const answers: Answers = Object.fromEntries(QUESTIONS.map((q, i) => [q.id, Number(digits[i])]));
    return { name, answers, scores: score(answers) };
  } catch {
    return null;
  }
}

/** Accepts a full report link, a card link, or a bare code, and returns the code part. */
export function codeFromLink(input: string): string | null {
  const text = input.trim();
  const hash = text.includes("#") ? text.slice(text.indexOf("#") + 1) : text;
  return decodeProfile(hash) ? hash : null;
}

/** Compare links hold several profile codes separated by "~". */
export function encodeGroup(codes: string[]): string {
  return codes.join("~");
}

/** Valid codes from a compare link, in order, without duplicates. Invalid parts are skipped. */
export function decodeGroup(fragment: string): string[] {
  const codes = fragment.replace(/^#/, "").split("~").filter((c) => decodeProfile(c));
  return [...new Set(codes)];
}
