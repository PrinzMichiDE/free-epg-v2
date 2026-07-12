import { Suspense } from "react";
import ChannelsPageClient from "./ChannelsPageClient";

export default function ChannelsPage() {
  return (
    <Suspense
      fallback={
        <div className="page-shell py-10 sm:py-14">
          <div className="h-10 w-48 rounded-lg bg-[var(--surface-muted)] animate-pulse mb-8" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-[var(--surface-muted)] animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <ChannelsPageClient />
    </Suspense>
  );
}
