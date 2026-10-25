import { NextResponse, type NextRequest } from "next/server";
import { createSubmission, getSubmissions, isAdmin, listSubmissions } from "@/lib/db";
import { score, validateAnswers } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 120) : "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  const group = typeof body.group === "string" ? body.group.trim().slice(0, 60) : "";

  const checked = validateAnswers(body.answers);
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });

  const submission = await createSubmission({
    name,
    email: email || undefined,
    group: group || undefined,
    answers: checked.answers,
    scores: score(checked.answers),
  });
  return NextResponse.json({ id: submission.id }, { status: 201 });
}

/**
 * GET ?ids=a,b,c  -> those submissions (ids are unguessable, so this works like a share link)
 * GET             -> every submission summary, admin only
 */
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids");
  if (ids) {
    const subs = await getSubmissions(ids.split(",").filter(Boolean).slice(0, 30));
    return NextResponse.json(subs.map(({ answers: _a, email: _e, ...rest }) => rest));
  }
  if (!isAdmin(req.headers.get("x-admin-key")))
    return NextResponse.json({ error: "Admin passcode required." }, { status: 401 });
  return NextResponse.json(await listSubmissions());
}
