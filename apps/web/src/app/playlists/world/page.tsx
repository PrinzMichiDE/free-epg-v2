import Link from "next/link";
import { ChevronLeft, Globe2, ListMusic } from "lucide-react";
import { XmlUrlBox } from "@/components/epg/XmlUrlBox";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  getWorldPlaylistMeta,
  WORLD_PLAYLIST_MAX_ENTRIES,
} from "@/lib/playlists";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WorldPlaylistPage() {
  let world: Awaited<ReturnType<typeof getWorldPlaylistMeta>> | null = null;

  try {
    world = await getWorldPlaylistMeta();
  } catch {
    world = null;
  }

  if (!world) {
    return (
      <div className="page-shell py-10 sm:py-14">
        <p className="text-[var(--muted-foreground)]">
          Die weltweite Playlist ist gerade nicht verfügbar. Bitte später erneut
          versuchen.
        </p>
      </div>
    );
  }

  return (
    <div className="page-shell py-10 sm:py-14">
      <Link
        href="/playlists"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Alle Playlisten
      </Link>

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)]">
            <Globe2 className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {world.name}
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1 text-sm">
              {formatNumber(world.countryCount)} Länder ·{" "}
              {formatNumber(world.channelCount)} Sender · max.{" "}
              {formatNumber(WORLD_PLAYLIST_MAX_ENTRIES)} Einträge
            </p>
          </div>
          <Badge variant="success">Global-Lite EPG</Badge>
        </div>
        <p className="text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
          Alle verfügbaren Länder-Playlists in einer M3U gebündelt. Sender sind
          nach Land als Gruppe sortiert; das EPG verweist auf das weltweite
          Lite-Feed.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <XmlUrlBox
          title="Weltweite M3U"
          description="Alle Länder in einer Playlist — ideal für IPTV-Apps mit einer Quelle."
          url={world.m3uUrl}
        />
        <XmlUrlBox
          title="EPG (Global-Lite)"
          description="Passendes weltweites EPG für die gebündelte Playlist."
          url="/api/epg"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href={world.m3uUrl} size="md" download>
          <ListMusic className="h-4 w-4" aria-hidden />
          M3U herunterladen
        </ButtonLink>
        <ButtonLink href={world.m3uUrl} variant="outline" size="md">
          M3U öffnen
        </ButtonLink>
      </div>
    </div>
  );
}
