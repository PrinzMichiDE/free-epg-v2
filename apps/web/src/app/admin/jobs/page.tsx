"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminJobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/dashboard")
        .then((r) => r.json())
        .then((d) => setJobs(d.recentJobs ?? []));
    }
  }, [session]);

  if (!session) return <div className="p-12">Bitte anmelden</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href="/admin" className="text-[var(--primary)] hover:underline mb-4 inline-block">← Dashboard</Link>
      <h1 className="text-3xl font-bold mb-8">Job-Historie</h1>
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--card)]">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Typ</th>
              <th className="p-3 text-left">Land</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Gestartet</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={String(j.id)} className="border-t border-[var(--border)]">
                <td className="p-3">{String(j.id)}</td>
                <td className="p-3">{String(j.jobType)}</td>
                <td className="p-3">{String(j.country ?? "—")}</td>
                <td className="p-3">{String(j.status)}</td>
                <td className="p-3">{j.startedAt ? new Date(String(j.startedAt)).toLocaleString("de-DE") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
