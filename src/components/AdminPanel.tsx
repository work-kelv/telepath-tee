"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, IdCard, KeyRound, Loader2, Search, Trash2, Users } from "lucide-react";
import type { SubmissionSummary } from "@/lib/db";
import { BEHAVIOR_KEYS, BEHAVIOR } from "@/lib/attributes";
import { profileTitle } from "@/lib/insights";
import { ThinkingMixBar } from "./ThinkingMixBar";

const KEY_STORAGE = "profile-admin-key";

export function AdminPanel({
  lanHosts,
  port,
  requiresKey,
  keyConfigured,
}: {
  lanHosts: string[];
  port: string;
  requiresKey: boolean;
  keyConfigured: boolean;
}) {
  const [key, setKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [rows, setRows] = useState<SubmissionSummary[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const [copied, setCopied] = useState("");
  const [origin, setOrigin] = useState("");

  const load = useCallback(async (k: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/submissions", { headers: { "x-admin-key": k }, cache: "no-store" });
      if (res.status === 401) {
        setRows(null);
        setError(k ? "That passcode isn't right." : "");
        try {
          sessionStorage.removeItem(KEY_STORAGE);
        } catch {}
        return;
      }
      if (!res.ok) throw new Error("Couldn't load submissions.");
      setRows(await res.json());
      setKey(k);
      try {
        sessionStorage.setItem(KEY_STORAGE, k);
      } catch {}
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
    let saved = "";
    try {
      saved = sessionStorage.getItem(KEY_STORAGE) ?? "";
    } catch {}
    if (saved || !requiresKey) void load(saved);
  }, [load, requiresKey]);

  const groups = useMemo(() => [...new Set((rows ?? []).map((r) => r.group).filter(Boolean))] as string[], [rows]);
  const filtered = useMemo(
    () =>
      (rows ?? []).filter(
        (r) =>
          (!group || r.group === group) &&
          (!query || `${r.name} ${r.email ?? ""} ${r.group ?? ""}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [rows, group, query],
  );

  const surveyLinks = useMemo(() => {
    const links = new Set<string>();
    if (origin) links.add(`${origin}/assessment`);
    lanHosts.forEach((h) => links.add(`http://${h}:${port}/assessment`));
    return [...links];
  }, [origin, lanHosts, port]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("Copy this link:", text);
    }
    setCopied(text);
    setTimeout(() => setCopied(""), 2000);
  }

  async function remove(r: SubmissionSummary) {
    if (!confirm(`Delete ${r.name}'s profile? This can't be undone.`)) return;
    const res = await fetch(`/api/submissions/${r.id}`, { method: "DELETE", headers: { "x-admin-key": key } });
    if (res.ok) {
      setRows((rs) => rs?.filter((x) => x.id !== r.id) ?? null);
      setSelected((s) => {
        const n = new Set(s);
        n.delete(r.id);
        return n;
      });
    } else alert("Delete failed.");
  }

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  if (rows === null && requiresKey && !keyConfigured) {
    return (
      <div className="card mx-auto max-w-md space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Admin is locked</h1>
        </div>
        <p className="text-sm text-ink-soft">
          No ADMIN_KEY is set on this server, so nobody can open the admin area. Add an ADMIN_KEY environment variable
          (in .env.local, or in your host&rsquo;s project settings), then restart or redeploy.
        </p>
      </div>
    );
  }

  if (rows === null) {
    return (
      <form
        className="card mx-auto max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void load(keyInput);
        }}
      >
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Admin access</h1>
        </div>
        <input
          className="input"
          type="password"
          placeholder="Passcode"
          value={keyInput}
          autoFocus
          onChange={(e) => setKeyInput(e.target.value)}
        />
        {error && <p className="text-sm text-social">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock"}
        </button>
        <p className="text-xs text-ink-muted">The passcode is the ADMIN_KEY setting on the server.</p>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Completed assessments</h1>
        {!requiresKey && (
          <p className="mt-2 text-sm text-conceptual">
            No ADMIN_KEY is set. The admin area is open because this is a development server; it locks automatically in
            production. Add one to .env.local before sharing on a network.
          </p>
        )}
      </header>

      <section className="card space-y-3">
        <h2 className="font-semibold">Share the survey</h2>
        <p className="text-sm text-ink-muted">
          {lanHosts.length
            ? "Send a link to friends. Network addresses only work for people on the same Wi-Fi while this computer is running the app."
            : "Send this link to friends."}
        </p>
        <ul className="space-y-2">
          {surveyLinks.map((l) => (
            <li key={l} className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg bg-surface-sunken px-3 py-2 text-sm">{l}</code>
              <button className="btn-ghost shrink-0 px-3" onClick={() => copy(l)} aria-label={`Copy ${l}`}>
                {copied === l ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input className="input pl-9" placeholder="Search name, email, group" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="input w-auto" value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Filter by group">
            <option value="">All groups</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <Link
            href={`/compare?ids=${[...selected].join(",")}`}
            className={`btn-primary ${selected.size < 2 ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={selected.size < 2}
          >
            <Users className="h-4 w-4" /> Compare selected ({selected.size})
          </Link>
        </div>

        <p className="text-sm text-ink-muted">
          {filtered.length} of {rows.length} profiles
        </p>

        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">No submissions yet. Share the survey link above.</p>
        ) : (
          <div className="-mx-5 overflow-x-auto sm:-mx-6">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="py-2 pl-5 pr-2 sm:pl-6">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={() =>
                        setSelected((s) => {
                          const n = new Set(s);
                          filtered.forEach((r) => (allVisibleSelected ? n.delete(r.id) : n.add(r.id)));
                          return n;
                        })
                      }
                      aria-label="Select all visible"
                    />
                  </th>
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">Thinking mix</th>
                  <th className="px-2 py-2 font-medium">Behaviors (percentile)</th>
                  <th className="px-2 py-2 font-medium">Date</th>
                  <th className="py-2 pl-2 pr-5 text-right font-medium sm:pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((r) => (
                  <tr key={r.id} className={selected.has(r.id) ? "bg-surface-sunken/60" : ""}>
                    <td className="py-3 pl-5 pr-2 sm:pl-6">
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Select ${r.name}`} />
                    </td>
                    <td className="px-2 py-3">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-ink-muted">
                        {[r.group, r.email].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </td>
                    <td className="w-[240px] px-2 py-3">
                      <ThinkingMixBar percentages={r.scores.percentages} height={20} compact />
                      <div className="mt-1 text-xs text-ink-muted">
                        {profileTitle(r.scores)} &middot; {r.scores.modality}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-xs tabular-nums text-ink-soft">
                      {BEHAVIOR_KEYS.map((k) => (
                        <div key={k}>
                          {BEHAVIOR[k].short} {r.scores.percentiles[k]}
                        </div>
                      ))}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-xs text-ink-muted">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 pl-2 pr-5 sm:pr-6">
                      <div className="flex justify-end gap-1">
                        <Link className="rounded-lg p-2 hover:bg-surface-sunken" href={`/report/${r.id}`} title="Open report">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link className="rounded-lg p-2 hover:bg-surface-sunken" href={`/card/${r.id}`} title="How to work with me">
                          <IdCard className="h-4 w-4" />
                        </Link>
                        <button className="rounded-lg p-2 text-social hover:bg-social/10" onClick={() => remove(r)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
