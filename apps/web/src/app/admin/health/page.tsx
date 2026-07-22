"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface HealthCheck {
  name: string;
  status: "ok" | "error";
  detail?: string;
}

interface HealthPayload {
  status: "healthy" | "degraded";
  checks: HealthCheck[];
  buildInfo: {
    appVersion: string;
    gitSha: string;
    epgOutputVersion: number;
    builtAt?: string;
  };
  environment: string;
  analyticsEnabled: boolean;
  timestamp: string;
}

export default function AdminHealthPage() {
  const { data: session } = useSession();
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHealth = useCallback(async () => {
    const response = await fetch("/api/admin/health");
    if (!response.ok) {
      setError("Health-Daten konnten nicht geladen werden.");
      return;
    }
    setError(null);
    setHealth(await response.json());
  }, []);

  useEffect(() => {
    if (!session) return;
    void loadHealth();
    const timer = setInterval(() => void loadHealth(), 30_000);
    return () => clearInterval(timer);
  }, [session, loadHealth]);

  if (!session) return <div className="p-12">Bitte anmelden</div>;
  if (error) return <div className="p-12 text-[var(--destructive)]">{error}</div>;
  if (!health) return <div className="p-12">Lade Systemstatus...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href="/admin" className="text-[var(--primary)] hover:underline mb-4 inline-block">
        ← Dashboard
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">System Health</h1>
        <button
          type="button"
          onClick={() => void loadHealth()}
          className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--card)]"
        >
          Aktualisieren
        </button>
      </div>

      <div className="mb-8 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-3">
          <StatusDot status={health.status} />
          <div>
            <p className="font-semibold capitalize">{health.status}</p>
            <p className="text-sm text-[var(--muted)]">
              Zuletzt geprüft: {new Date(health.timestamp).toLocaleString("de-DE")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {health.checks.map((check) => (
          <div
            key={check.name}
            className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <StatusDot status={check.status === "ok" ? "healthy" : "degraded"} />
              <p className="font-medium capitalize">{check.name}</p>
            </div>
            {check.detail ? (
              <p className="text-sm text-[var(--destructive)]">{check.detail}</p>
            ) : (
              <p className="text-sm text-[var(--muted)]">Betriebsbereit</p>
            )}
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-[var(--border)] overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b border-[var(--border)] bg-[var(--card)]">
          Deployment-Info
        </h2>
        <dl className="grid sm:grid-cols-2 gap-4 p-4 text-sm">
          <InfoRow label="App-Version" value={`v${health.buildInfo.appVersion}`} />
          <InfoRow label="Git SHA" value={health.buildInfo.gitSha} />
          <InfoRow label="EPG Output Version" value={String(health.buildInfo.epgOutputVersion)} />
          <InfoRow label="Umgebung" value={health.environment} />
          <InfoRow label="Analytics" value={health.analyticsEnabled ? "aktiv" : "deaktiviert"} />
          <InfoRow
            label="Build-Zeit"
            value={
              health.buildInfo.builtAt
                ? new Date(health.buildInfo.builtAt).toLocaleString("de-DE")
                : "—"
            }
          />
        </dl>
      </section>
    </div>
  );
}

function StatusDot({ status }: { status: "healthy" | "degraded" }) {
  const color = status === "healthy" ? "bg-emerald-500" : "bg-amber-500";
  return <span className={`inline-block h-3 w-3 rounded-full ${color}`} aria-hidden />;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
