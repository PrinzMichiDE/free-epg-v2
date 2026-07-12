"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-3">Seite konnte nicht geladen werden</h1>
      <p className="text-[var(--muted)] mb-8">
        Ein Serverfehler ist aufgetreten. Bitte erneut versuchen.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
      >
        Erneut laden
      </button>
    </div>
  );
}
