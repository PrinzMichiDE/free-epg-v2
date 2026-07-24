"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  formatJobDuration,
  jobStatusBadgeVariantForUnknown,
  type JobRow,
  type JobStatus,
  type JobStatusCounts,
} from "@/lib/admin-jobs-query";

interface JobsResponse {
  jobs: JobRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  statusCounts: JobStatusCounts;
  filters: {
    status: JobStatus | null;
    jobType: string | null;
  };
}

const STATUS_OPTIONS: Array<{ value: JobStatus | ""; label: string }> = [
  { value: "", label: "Alle Status" },
  { value: "pending", label: "Ausstehend" },
  { value: "running", label: "Läuft" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "failed", label: "Fehlgeschlagen" },
];

export default function AdminJobsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<JobsResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (statusFilter) params.set("status", statusFilter);

    const response = await fetch(`/api/admin/jobs?${params.toString()}`);
    if (!response.ok) {
      setError("Job-Daten konnten nicht geladen werden.");
      return;
    }
    setError(null);
    setData(await response.json());
  }, [page, statusFilter]);

  useEffect(() => {
    if (!session) return;
    void loadJobs();
    const timer = setInterval(() => void loadJobs(), 30_000);
    return () => clearInterval(timer);
  }, [session, loadJobs]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  if (!session) return <div className="p-12">Bitte anmelden</div>;
  if (error) return <div className="p-12 text-[var(--destructive)]">{error}</div>;
  if (!data) return <div className="p-12">Lade Job-Historie...</div>;

  const { jobs, pagination, statusCounts } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href="/admin" className="text-[var(--primary)] hover:underline mb-4 inline-block">
        ← Dashboard
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job-Historie</h1>
          <p className="text-[var(--muted)] mt-1">
            EPG-Worker-Jobs mit Status, Dauer und Fehlerdetails. Auto-Refresh alle 30s.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadJobs()}
          className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--card)]"
        >
          Aktualisieren
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Ausstehend" value={statusCounts.pending} />
        <SummaryCard label="Läuft" value={statusCounts.running} />
        <SummaryCard label="Abgeschlossen" value={statusCounts.completed} />
        <SummaryCard label="Fehlgeschlagen" value={statusCounts.failed} />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label className="text-sm text-[var(--muted)]">
          Filter
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as JobStatus | "")}
            className="ml-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-[var(--muted)]">
          {pagination.total} Jobs gesamt · Seite {pagination.page} von {pagination.totalPages}
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--card)]">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Typ</th>
              <th className="p-3 text-left">Land</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Dauer</th>
              <th className="p-3 text-left">Gestartet</th>
              <th className="p-3 text-left">Fehler</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-[var(--muted)]">
                  Keine Jobs für den gewählten Filter.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-t border-[var(--border)]">
                  <td className="p-3 font-mono text-xs">{job.id}</td>
                  <td className="p-3">{job.jobType}</td>
                  <td className="p-3">{job.country ?? "—"}</td>
                  <td className="p-3">
                    <Badge variant={jobStatusBadgeVariantForUnknown(job.status)}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {formatJobDuration(job.startedAt, job.finishedAt) ?? "—"}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {job.startedAt
                      ? new Date(job.startedAt).toLocaleString("de-DE")
                      : job.createdAt
                        ? new Date(job.createdAt).toLocaleString("de-DE")
                        : "—"}
                  </td>
                  <td className="p-3 max-w-xs truncate text-[var(--destructive)]" title={job.error ?? undefined}>
                    {job.error ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="px-4 py-2 rounded-lg border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--card)]"
          >
            Zurück
          </button>
          <span className="text-sm text-[var(--muted)]">
            Seite {pagination.page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="px-4 py-2 rounded-lg border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--card)]"
          >
            Weiter
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-sm text-[var(--muted)]">{label}</p>
    </div>
  );
}
