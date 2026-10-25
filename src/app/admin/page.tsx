import os from "os";
import { AdminPanel } from "@/components/AdminPanel";
import { adminKeyRequired } from "@/lib/db";

export const dynamic = "force-dynamic";

/** IPv4 addresses on the local network, so friends on the same Wi-Fi can open the survey. */
function lanAddresses(): string[] {
  // On a host such as Vercel these are internal addresses nobody can reach, so show none.
  if (process.env.VERCEL) return [];
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i): i is os.NetworkInterfaceInfo => !!i && i.family === "IPv4" && !i.internal)
    .map((i) => i.address);
}

export default function AdminPage() {
  return (
    <AdminPanel
      lanHosts={lanAddresses()}
      port={process.env.PORT ?? "3000"}
      requiresKey={adminKeyRequired()}
      keyConfigured={Boolean(process.env.ADMIN_KEY)}
    />
  );
}
