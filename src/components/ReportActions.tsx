"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, IdCard, Link2, Printer } from "lucide-react";

export function ReportActions({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/report/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="no-print flex flex-wrap gap-2">
      <button className="btn-primary" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print / Save PDF
      </button>
      <Link className="btn-ghost" href={`/card/${id}`}>
        <IdCard className="h-4 w-4" /> How to work with me
      </Link>
      <button className="btn-ghost" onClick={copyLink}>
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
