import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-3">Nicht gefunden</h1>
      <p className="text-[var(--muted)] mb-8">
        Die angeforderte Seite existiert nicht.
      </p>
      <Link
        href="/"
        className="inline-block px-5 py-2.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
