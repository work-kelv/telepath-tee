"use client";

import { useEffect, useState } from "react";

/**
 * Print-only box with the page's full link. Browsers shorten long addresses in the printed
 * footer by cutting out the middle ("…"), and a link copied from there is missing answers.
 */
export function PrintLink({ what = "report" }: { what?: string }) {
  const [href, setHref] = useState("");
  useEffect(() => setHref(window.location.href), []);
  if (!href) return null;
  return (
    <section className="card hidden space-y-1 print:block">
      <h2 className="text-sm font-semibold">Link to this {what}</h2>
      <p className="break-all font-mono text-xs leading-relaxed">{href}</p>
      <p className="text-xs text-ink-muted">
        This is the only copy of the link, so keep it. Copy it from here: the address in the page footer is often
        shortened and may not open.
      </p>
    </section>
  );
}
