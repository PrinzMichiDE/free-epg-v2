"use client";

import { useState } from "react";
import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources";

type TriggerState = "idle" | "loading" | "success" | "error";

interface TriggerFeedback {
  state: TriggerState;
  message?: string;
}

export function AdminJobTriggers() {
  const [country, setCountry] = useState("DE");
  const [feedback, setFeedback] = useState<Record<string, TriggerFeedback>>({
    country: { state: "idle" },
    all: { state: "idle" },
    iptvOrg: { state: "idle" },
  });

  async function triggerJob(
    key: string,
    body: Record<string, unknown>
  ): Promise<void> {
    setFeedback((current) => ({ ...current, [key]: { state: "loading" } }));
    try {
      const response = await fetch("/api/admin/jobs/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        setFeedback((current) => ({
          ...current,
          [key]: {
            state: "error",
            message: payload.error ?? "Job konnte nicht gestartet werden.",
          },
        }));
        return;
      }
      setFeedback((current) => ({
        ...current,
        [key]: {
          state: "success",
          message: payload.message ?? "Job wurde in die Warteschlange gestellt.",
        },
      }));
    } catch {
      setFeedback((current) => ({
        ...current,
        [key]: {
          state: "error",
          message: "Netzwerkfehler beim Starten des Jobs.",
        },
      }));
    }
  }

  return (
    <section aria-labelledby="epg-refresh-heading">
      <h2 id="epg-refresh-heading" className="text-xl font-semibold mb-4">
        EPG Refresh
      </h2>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-[var(--muted)] mb-1">Land</span>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] min-w-[8rem]"
          >
            {SUPPORTED_EPG_COUNTRIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
        <TriggerButton
          label={`${country} refreshen`}
          feedback={feedback.country}
          onClick={() => void triggerJob("country", { country })}
        />
        <TriggerButton
          label="Alle Länder refreshen"
          primary
          feedback={feedback.all}
          onClick={() => void triggerJob("all", { all: true })}
        />
        <TriggerButton
          label="iptv-org Sync"
          feedback={feedback.iptvOrg}
          onClick={() => void triggerJob("iptvOrg", { iptvOrg: true })}
        />
      </div>
    </section>
  );
}

function TriggerButton({
  label,
  primary,
  feedback,
  onClick,
}: {
  label: string;
  primary?: boolean;
  feedback: TriggerFeedback;
  onClick: () => void;
}) {
  const disabled = feedback.state === "loading";
  const className = primary
    ? "px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] disabled:opacity-60"
    : "px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--card)] disabled:opacity-60";

  return (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={onClick} disabled={disabled} className={className}>
        {feedback.state === "loading" ? "Starte…" : label}
      </button>
      {feedback.message ? (
        <p
          role="status"
          className={
            feedback.state === "error"
              ? "text-xs text-[var(--destructive)]"
              : "text-xs text-emerald-600 dark:text-emerald-400"
          }
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
