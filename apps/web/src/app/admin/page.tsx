"use client";

import { signIn, useSession } from "next-auth/react";
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
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            signIn("credentials", {
              email: fd.get("email"),
              password: fd.get("password"),
              callbackUrl: "/admin",
            });
          }}
          className="space-y-4"
        >
          <input name="email" type="email" placeholder="Email" required className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)]" />
          <input name="password" type="password" placeholder="Password" required className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)]" />
          <button type="submit" className="w-full py-3 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">Anmelden</button>
        </form>
      </div>
    );
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
