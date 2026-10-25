import { test } from "node:test";
import assert from "node:assert/strict";

// Exercises the Redis store against a fake Upstash REST endpoint (the store picks Redis
// when the URL and token are set, so they must be in place before db.ts is imported).
process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.test";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

const kv = new Map<string, string>();
const zset = new Map<string, number>();
const calls: unknown[] = [];

globalThis.fetch = (async (url: string, init: { headers: Record<string, string>; body: string }) => {
  assert.equal(url, "https://fake.upstash.test/pipeline");
  assert.equal(init.headers.Authorization, "Bearer test-token");
  const commands = JSON.parse(init.body) as Array<Array<string | number>>;
  calls.push(commands);
  const results = commands.map(([cmd, ...args]) => {
    switch (cmd) {
      case "SET": kv.set(String(args[0]), String(args[1])); return { result: "OK" };
      case "MGET": return { result: args.map((k) => kv.get(String(k)) ?? null) };
      case "ZADD": zset.set(String(args[2]), Number(args[1])); return { result: 1 };
      case "ZRANGE": return { result: [...zset.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id) };
      case "DEL": return { result: kv.delete(String(args[0])) ? 1 : 0 };
      case "ZREM": return { result: zset.delete(String(args[1])) ? 1 : 0 };
      default: return { error: `unsupported ${cmd}` };
    }
  });
  return new Response(JSON.stringify(results), { status: 200 });
}) as typeof fetch;

test("Redis store: create, read, list, delete", async () => {
  const db = await import("./db");
  assert.equal(db.storeKind, "redis");
  const scores = {} as never;
  const a = await db.createSubmission({ name: "Ada", answers: { ana1: 5 }, scores });
  const b = await db.createSubmission({ name: "Bo", answers: { ana1: 3 }, scores });

  assert.equal((await db.getSubmission(a.id))?.name, "Ada");
  assert.equal(await db.getSubmission("missing"), undefined);
  assert.deepEqual((await db.getSubmissions([b.id, "missing", a.id])).map((s) => s.name), ["Bo", "Ada"]);

  const list = await db.listSubmissions();
  assert.equal(list.length, 2);
  assert.ok(!("answers" in list[0]), "list summaries leave out answers");

  assert.equal(await db.deleteSubmission(a.id), true);
  assert.equal(await db.deleteSubmission(a.id), false);
  assert.deepEqual((await db.listSubmissions()).map((s) => s.name), ["Bo"]);
  assert.ok(calls.length > 0);
});

test("admin stays locked outside development when no key is set", async () => {
  const db = await import("./db");
  const env = process.env as Record<string, string | undefined>;
  delete env.ADMIN_KEY;
  env.NODE_ENV = "production";
  assert.equal(db.isAdmin(""), false);
  env.NODE_ENV = "development";
  assert.equal(db.isAdmin(""), true);
  env.ADMIN_KEY = "secret";
  assert.equal(db.isAdmin("secret"), true);
  assert.equal(db.isAdmin("nope"), false);
});
