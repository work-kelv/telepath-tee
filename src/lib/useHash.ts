"use client";

import { useEffect, useState } from "react";

/** The URL fragment without "#", or null until the page has mounted in the browser. */
export function useHash(): string | null {
  const [hash, setHash] = useState<string | null>(null);
  useEffect(() => {
    const read = () => setHash(window.location.hash.replace(/^#/, ""));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return hash;
}
