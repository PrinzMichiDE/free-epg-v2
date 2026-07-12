import { PlaylistWatchLoader } from "@/components/player/PlaylistWatchLoader";
import { WORLD_PLAYLIST_SLUG } from "@/lib/playlists";

export default function WorldPlaylistWatchPage() {
  return (
    <PlaylistWatchLoader
      playlistCode={WORLD_PLAYLIST_SLUG}
      backHref={`/playlists/${WORLD_PLAYLIST_SLUG}`}
    />
  );
}
