import Link from "next/link";
import { Globe2, ListMusic } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { WorldPlaylistMeta } from "@/lib/playlists";

interface WorldPlaylistCardProps {
  playlist: WorldPlaylistMeta;
  className?: string;
}

export function WorldPlaylistCard({ playlist, className }: WorldPlaylistCardProps) {
  return (
    <article
      className={cn(
        "surface-card p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6",
        "border-[var(--accent)]/30 bg-gradient-to-br from-[var(--card)] to-[var(--surface-muted)]/40",
        className
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)]">
          <Globe2 className="h-7 w-7" aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {playlist.name}
            </h2>
            <Badge variant="success">Global-Lite EPG</Badge>
          </div>
          <p className="text-[var(--muted-foreground)] leading-relaxed max-w-2xl">
            Eine M3U mit Sendern aus {formatNumber(playlist.countryCount)} Ländern —
            nach Land gruppiert, mit tvg-id und weltweitem EPG in einer Datei.
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2 tabular-nums">
            {formatNumber(playlist.countryCount)} Länder ·{" "}
            {formatNumber(playlist.channelCount)} Sender · bis zu{" "}
            {formatNumber(playlist.entryLimit)} Einträge max.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <Link
          href={`/playlists/${playlist.slug}`}
          className={cn(
            "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg",
            "border border-[var(--border)] text-sm font-medium",
            "hover:bg-[var(--surface-muted)] transition-colors"
          )}
        >
          Details
        </Link>
        <ButtonLink href={playlist.m3uUrl} size="md" download>
          <ListMusic className="h-4 w-4" aria-hidden />
          M3U herunterladen
        </ButtonLink>
      </div>
    </article>
  );
}
