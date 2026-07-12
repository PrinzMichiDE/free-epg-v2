import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="page-shell py-24 flex flex-col items-center text-center max-w-lg mx-auto">
      <p className="text-6xl font-semibold text-[var(--muted-foreground)]/30 mb-4 tabular-nums">
        404
      </p>
      <h1 className="text-2xl font-semibold tracking-tight mb-3">Nicht gefunden</h1>
      <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
        Die angeforderte Seite existiert nicht.
      </p>
      <Link href="/">
        <Button>Zur Startseite</Button>
      </Link>
    </div>
  );
}
