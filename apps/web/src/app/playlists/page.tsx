import { PlaylistsPageContent } from "@/components/playlist/PlaylistsPageContent";
import { getPlaylistCountries, getWorldPlaylistMeta } from "@/lib/playlists";

export const dynamic = "force-dynamic";

export default async function PlaylistsPage() {
  let playlists: Awaited<ReturnType<typeof getPlaylistCountries>> = [];
  let world: Awaited<ReturnType<typeof getWorldPlaylistMeta>> | null = null;
  let loadError = false;

  try {
    [playlists, world] = await Promise.all([
      getPlaylistCountries(),
      getWorldPlaylistMeta(),
    ]);
  } catch {
    loadError = true;
  }

  return (
    <PlaylistsPageContent
      playlists={playlists}
      world={world}
      loadError={loadError}
    />
  );
}
