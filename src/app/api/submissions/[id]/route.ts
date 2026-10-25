import { NextResponse, type NextRequest } from "next/server";
import { deleteSubmission, getSubmission, isAdmin } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const sub = await getSubmission(params.id);
  if (!sub) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const { answers: _a, email: _e, ...rest } = sub;
  return NextResponse.json(rest);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req.headers.get("x-admin-key")))
    return NextResponse.json({ error: "Admin passcode required." }, { status: 401 });
  const removed = await deleteSubmission(params.id);
  return removed ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Not found." }, { status: 404 });
}
