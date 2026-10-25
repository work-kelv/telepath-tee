"use client";

import { useHash } from "@/lib/useHash";
import { decodeProfile } from "@/lib/share";
import { ReportView } from "@/components/ReportView";
import { BadLink } from "@/components/BadLink";

export default function ReportPage() {
  const hash = useHash();
  if (hash === null) return <div className="h-64" />;
  const profile = decodeProfile(hash);
  return profile ? <ReportView profile={profile} code={hash} /> : <BadLink />;
}
