import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { Answers, Scores } from "./scoring";

// Two interchangeable stores behind one API:
//  - JSON file (default): data/db.json, for running on your own computer. Writes go to a
//    temp file and are renamed into place, so a crash never leaves a half-written database.
//  - Redis over HTTPS (Upstash): used automatically when its REST URL and token are set.
//    Serverless hosts such as Vercel have no writable disk, so this is the store for hosting.

export interface Submission {
  id: string;
  name: string;
  email?: string;
  group?: string;
  createdAt: string;
  answers: Answers;
  scores: Scores;
}

export type SubmissionSummary = Omit<Submission, "answers">;

interface Store {
  insert(s: Submission): Promise<void>;
  get(id: string): Promise<Submission | undefined>;
  getMany(ids: string[]): Promise<Submission[]>;
  all(): Promise<Submission[]>;
  remove(id: string): Promise<boolean>;
}

// ---- JSON file store ----------------------------------------------------------------

interface DbShape {
  version: 1;
  submissions: Submission[];
}

function jsonStore(dir: string): Store {
  const file = path.join(dir, "db.json");
  let writeChain: Promise<unknown> = Promise.resolve();

  async function load(): Promise<DbShape> {
    try {
      return JSON.parse(await fs.readFile(file, "utf8")) as DbShape;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return { version: 1, submissions: [] };
      throw err;
    }
  }

  async function save(db: DbShape): Promise<void> {
    await fs.mkdir(dir, { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, file);
  }

  /** Serialises read-modify-write cycles so concurrent submissions can't overwrite each other. */
  function mutate<T>(fn: (db: DbShape) => T): Promise<T> {
    const run = writeChain.then(async () => {
      const db = await load();
      const result = fn(db);
      await save(db);
      return result;
    });
    writeChain = run.catch(() => undefined);
    return run;
  }

  return {
    insert: async (s) => {
      await mutate((db) => db.submissions.push(s));
    },
    get: async (id) => (await load()).submissions.find((s) => s.id === id),
    getMany: async (ids) => {
      const all = (await load()).submissions;
      return ids.map((id) => all.find((s) => s.id === id)).filter((s): s is Submission => Boolean(s));
    },
    all: async () => (await load()).submissions,
    remove: (id) =>
      mutate((db) => {
        const before = db.submissions.length;
        db.submissions = db.submissions.filter((s) => s.id !== id);
        return db.submissions.length < before;
      }),
  };
}

// ---- Redis store (Upstash REST API, no client library needed) ------------------------

function redisStore(url: string, token: string, prefix: string): Store {
  const key = (id: string) => `${prefix}sub:${id}`;
  const index = `${prefix}subs`;

  async function pipeline(commands: Array<Array<string | number>>): Promise<unknown[]> {
    const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Redis request failed: ${res.status} ${await res.text()}`);
    const out = (await res.json()) as Array<{ result?: unknown; error?: string }>;
    const failed = out.find((r) => r.error);
    if (failed) throw new Error(`Redis error: ${failed.error}`);
    return out.map((r) => r.result);
  }

  const parse = (values: unknown): Submission[] =>
    (Array.isArray(values) ? values : [])
      .filter((v): v is string => typeof v === "string")
      .map((v) => JSON.parse(v) as Submission);

  async function getMany(ids: string[]): Promise<Submission[]> {
    if (!ids.length) return [];
    const [values] = await pipeline([["MGET", ...ids.map(key)]]);
    return parse(values);
  }

  return {
    insert: async (s) => {
      await pipeline([
        ["SET", key(s.id), JSON.stringify(s)],
        ["ZADD", index, Date.parse(s.createdAt), s.id],
      ]);
    },
    get: async (id) => (await getMany([id]))[0],
    getMany,
    all: async () => {
      const [ids] = await pipeline([["ZRANGE", index, 0, -1]]);
      return getMany(Array.isArray(ids) ? (ids as string[]) : []);
    },
    remove: async (id) => {
      const [deleted] = await pipeline([
        ["DEL", key(id)],
        ["ZREM", index, id],
      ]);
      return Number(deleted) > 0;
    },
  };
}

// ---- Store selection -------------------------------------------------------------------

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const storeKind: "redis" | "json" = REDIS_URL && REDIS_TOKEN ? "redis" : "json";

const store: Store =
  storeKind === "redis"
    ? redisStore(REDIS_URL!, REDIS_TOKEN!, process.env.REDIS_KEY_PREFIX ?? "tt:")
    : jsonStore(process.env.DATA_DIR ?? path.join(process.cwd(), "data"));

if (storeKind === "json" && process.env.VERCEL) {
  console.warn(
    "telepath-tee: running on Vercel without Redis. Submissions cannot be saved. " +
      "Add an Upstash Redis database (see README, 'Deploy for free').",
  );
}

export function newId(): string {
  return crypto.randomBytes(9).toString("base64url");
}

export async function createSubmission(input: Omit<Submission, "id" | "createdAt">): Promise<Submission> {
  const submission: Submission = { ...input, id: newId(), createdAt: new Date().toISOString() };
  await store.insert(submission);
  return submission;
}

export function getSubmission(id: string): Promise<Submission | undefined> {
  return store.get(id);
}

export function getSubmissions(ids: string[]): Promise<Submission[]> {
  return store.getMany(ids);
}

export async function listSubmissions(): Promise<SubmissionSummary[]> {
  return (await store.all())
    .map(({ answers: _answers, ...rest }) => rest)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function deleteSubmission(id: string): Promise<boolean> {
  return store.remove(id);
}

/**
 * Admin check. With no ADMIN_KEY set, the admin area is open only under `next dev` on your
 * own computer; any production server (including hosting) stays locked until a key is set.
 */
export function isAdmin(key: string | null | undefined): boolean {
  const expected = process.env.ADMIN_KEY;
  if (!expected) return process.env.NODE_ENV === "development";
  if (!key) return false;
  const a = Buffer.from(key);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function adminKeyRequired(): boolean {
  return Boolean(process.env.ADMIN_KEY) || process.env.NODE_ENV !== "development";
}
