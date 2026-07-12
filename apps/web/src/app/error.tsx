"use client";

import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-shell py-24 flex flex-col items-center text-center max-w-lg mx-auto">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--warning-muted)] text-[var(--warning)] mb-6">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight mb-3">
        Seite konnte nicht geladen werden
      </h1>
      <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
        Ein Serverfehler ist aufgetreten. Bitte erneut versuchen.
      </p>
      <Button onClick={() => reset()}>Erneut laden</Button>
    </div>
  );
}
