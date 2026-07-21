"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/dashboard")
        .then((r) => r.json())
        .then(setDashboard);
    }
  }, [session]);

  if (status === "loading") return <div className="p-12">Lade...</div>;

  if (!session) {
    return <div className="p-12">Weiterleitung zum Login...</div>;
  }

  const stats = dashboard?.stats as Record<string, number> | undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Link href="/admin/analytics" className="text-[var(--primary)] hover:underline">Analytics</Link>
          <Link href="/admin/jobs" className="text-[var(--primary)] hover:underline">Jobs</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Kanäle" value={stats?.totalChannels ?? 0} />
        <StatCard label="Mit EPG" value={stats?.channelsWithEpg ?? 0} />
        <StatCard label="Abdeckung" value={`${stats?.coverage ?? 0}%`} />
        <StatCard label="Fehler Jobs" value={stats?.failedJobs ?? 0} />
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">EPG Refresh</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => fetch("/api/admin/jobs/trigger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ country: "DE" }) })}
            className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--card)]"
          >
            DE refreshen
          </button>
          <button
            onClick={() => fetch("/api/admin/jobs/trigger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) })}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]"
          >
            Alle Länder refreshen
          </button>
          <button
            onClick={() => fetch("/api/admin/jobs/trigger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ iptvOrg: true }) })}
            className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--card)]"
          >
            iptv-org Sync (Kanäle &amp; Playlists)
          </button>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-[var(--muted)]">{label}</p>
    </div>
  );
}
