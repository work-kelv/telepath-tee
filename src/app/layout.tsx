import type { Metadata } from "next";
import Link from "next/link";
import { Brain } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thinking & Behavior Profile",
  description: "An Emergenetics-inspired questionnaire and personal profile report.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <header className="no-print border-b border-line bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 py-2.5 font-semibold">
              <Brain className="h-5 w-5" aria-hidden />
              <span>Profile</span>
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <Link href="/assessment/" className="rounded-lg px-3 py-2.5 hover:bg-surface-sunken">
                Take it
              </Link>
              <Link href="/compare/" className="rounded-lg px-3 py-2.5 hover:bg-surface-sunken">
                Compare
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</main>
        <footer className="no-print mx-auto max-w-5xl px-4 pb-10 text-xs text-ink-muted">
          Inspired by the Emergenetics&reg; model. This is an unofficial, informal tool for friends: it is not the
          Emergenetics Profile, and results describe preferences, not abilities. Nothing you enter is stored: each
          report lives only in its own link.
        </footer>
      </body>
    </html>
  );
}
