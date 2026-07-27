"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AdminJobTriggers } from "@/components/admin/AdminJobTriggers";

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Kanäle" value={stats?.totalChannels ?? 0} />
        <StatCard label="Mit EPG" value={stats?.channelsWithEpg ?? 0} />
        <StatCard label="Abdeckung" value={`${stats?.coverage ?? 0}%`} />
        <StatCard label="Fehler Jobs" value={stats?.failedJobs ?? 0} />
      </div>

      <AdminJobTriggers />
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
