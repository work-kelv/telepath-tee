import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "fs";
import path from "path";
import { ANIMALS, animalFor } from "./animals";
import { THINKING_KEYS, type ThinkingKey } from "./attributes";
import { QUESTIONS } from "./questions";
import { score } from "./scoring";

test("every possible combination of preferences has exactly one animal", () => {
  const combos: ThinkingKey[][] = [];
  for (let mask = 1; mask < 16; mask++) combos.push(THINKING_KEYS.filter((_, i) => mask & (1 << i)));
  assert.equal(ANIMALS.length, 15);
  const names = new Set(combos.map((c) => animalFor(c).name));
  assert.equal(names.size, 15);
});

test("order of preferences doesn't matter", () => {
  assert.equal(animalFor(["conceptual", "social"]).name, animalFor(["social", "conceptual"]).name);
  assert.equal(animalFor(["social", "conceptual"]).name, "The Community Mural Capybara");
  assert.equal(animalFor(THINKING_KEYS).name, "The Wise Forest Owl");
});

test("population shares add up to about 100% (each is rounded; the workshop figures total 101%)", () => {
  const total = ANIMALS.reduce((s, a) => s + a.rarity, 0);
  assert.ok(total >= 98 && total <= 102, `total ${total}`);
});

test("every scored profile gets an animal, and every picture exists", () => {
  for (let shift = 0; shift < 7; shift++) {
    const answers = Object.fromEntries(QUESTIONS.map((q, i) => [q.id, ((i * 5 + shift) % 7) + 1]));
    assert.ok(animalFor(score(answers).preferences));
  }
  for (const a of ANIMALS) assert.ok(existsSync(path.join("public", "animals", a.image)), a.image);
});
