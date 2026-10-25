import { test } from "node:test";
import assert from "node:assert/strict";
import { codeFromLink, decodeProfile, encodeProfile } from "./share";
import { QUESTIONS } from "./questions";
import { score } from "./scoring";

const answers = Object.fromEntries(QUESTIONS.map((q, i) => [q.id, (i % 7) + 1]));

test("a profile survives the round trip through its link", () => {
  const code = encodeProfile("Zoë Tan-Wong", answers);
  assert.match(code, /^1\.[1-7]{56}\.[A-Za-z0-9_-]+$/);
  const p = decodeProfile(code)!;
  assert.equal(p.name, "Zoë Tan-Wong");
  assert.deepEqual(p.answers, answers);
  assert.deepEqual(p.scores, score(answers));
});

test("links stay short and contain nothing but the answers and name", () => {
  const code = encodeProfile("Sam", answers);
  assert.ok(code.length < 70, `code is ${code.length} characters`);
});

test("invalid or tampered codes are rejected", () => {
  const code = encodeProfile("Sam", answers);
  assert.equal(decodeProfile(code.replace(/^1\./, "9.")), null);
  assert.equal(decodeProfile(code.replace(/\.(\d)/, ".8")), null);
  assert.equal(decodeProfile("1.123.abc"), null);
  assert.equal(decodeProfile("garbage"), null);
  assert.throws(() => encodeProfile("Sam", { ...answers, [QUESTIONS[0].id]: 0 }));
});

test("names are tidied and capped", () => {
  const p = decodeProfile(encodeProfile("   A   very long name that goes on and on and on forever   ", answers))!;
  assert.equal(p.name.length, 40);
  assert.ok(!p.name.startsWith(" "));
  assert.equal(decodeProfile(encodeProfile("", answers))!.name, "Anonymous");
});

test("full report links, card links and bare codes are understood", () => {
  const a = encodeProfile("A", answers);
  const b = encodeProfile("B", answers);
  assert.equal(codeFromLink(`https://example.github.io/telepath-tee/report/#${a}`), a);
  assert.equal(codeFromLink(`  ${b}  `), b);
  assert.equal(codeFromLink(`https://example.github.io/telepath-tee/card/#${b}`), b);
  assert.equal(codeFromLink("https://example.com/report/#nope"), null);
});
