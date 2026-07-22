"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AuditLogRow {
  id: number;
  actorEmail: string;
  action: string;
  target: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export default function AdminAuditPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<AuditLogRow[]>([]);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/audit?limit=100")
        .then((r) => r.json())
        .then((d) => setLogs(d.logs ?? []));
    }
  }, [session]);

  if (!session) return <div className="p-12">Bitte anmelden</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href="/admin" className="text-[var(--primary)] hover:underline mb-4 inline-block">
        ← Dashboard
      </Link>
      <h1 className="text-3xl font-bold mb-2">Audit-Log</h1>
      <p className="text-[var(--muted)] mb-8">
        Protokollierte Administrator-Aktionen (Job-Trigger, Syncs).
      </p>

      <div className="rounded-xl border border-[var(--border)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--card)]">
            <tr>
              <th className="p-3 text-left">Zeit</th>
              <th className="p-3 text-left">Akteur</th>
              <th className="p-3 text-left">Aktion</th>
              <th className="p-3 text-left">Ziel</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-[var(--muted)]">
                  Noch keine Einträge vorhanden.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t border-[var(--border)]">
                  <td className="p-3 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("de-DE")}
                  </td>
                  <td className="p-3">{log.actorEmail}</td>
                  <td className="p-3 font-mono text-xs">{log.action}</td>
                  <td className="p-3">{log.target ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
