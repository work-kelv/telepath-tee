"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, IdCard, Link2, Printer, Share2, Users } from "lucide-react";

export function ReportActions({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function"), []);

  const link = () => `${window.location.origin}${window.location.pathname}#${code}`;

  async function share() {
    try {
      await navigator.share({ title: "My thinking & behavior profile", url: link() });
    } catch {
      /* the person closed the share sheet */
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link());
    } catch {
      window.prompt("Copy this link:", link());
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="no-print flex flex-wrap gap-2">
      {canShare ? (
        <button className="btn-primary" onClick={share}>
          <Share2 className="h-4 w-4" /> Share link
        </button>
      ) : (
        <button className="btn-primary" onClick={copyLink}>
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      )}
      <Link className="btn-ghost" href={`/card/#${code}`}>
        <IdCard className="h-4 w-4" /> How to work with me
      </Link>
      <Link className="btn-ghost" href={`/compare/#${code}`}>
        <Users className="h-4 w-4" /> Compare with others
      </Link>
      <button className="btn-ghost" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Save PDF
      </button>
    </div>
  );
}
