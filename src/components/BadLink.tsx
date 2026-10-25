import Link from "next/link";
import { Link2Off } from "lucide-react";

/** Shown when a page's link doesn't contain a valid profile, e.g. it was cut off when pasted. */
export function BadLink({ what = "report" }: { what?: string }) {
  return (
    <div className="card mx-auto max-w-md space-y-3 text-center">
      <Link2Off className="mx-auto h-8 w-8 text-ink-muted" aria-hidden />
      <h1 className="text-xl font-semibold">This {what} link isn&rsquo;t complete</h1>
      <p className="text-sm text-ink-soft">
        Profiles are never stored, so everything lives in the link itself. If it was copied from a message, make sure the
        whole link came through, including everything after the <code>#</code>.
      </p>
      <Link href="/assessment/" className="btn-primary">
        Take the questionnaire
      </Link>
    </div>
  );
}
