import { Suspense } from "react";
import { ProgrammesPageClient } from "./ProgrammesPageClient";

export const dynamic = "force-dynamic";

export default function ProgrammesPage() {
  return (
    <Suspense
      fallback={
        <div className="page-shell py-14">
          <div className="h-10 w-64 rounded-lg bg-[var(--border)] animate-pulse mb-8" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-[var(--border)] animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <ProgrammesPageClient />
    </Suspense>
  );
}
