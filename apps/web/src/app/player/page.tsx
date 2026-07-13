import { PlaylistWatchLoader } from "@/components/player/PlaylistWatchLoader";
import { WORLD_PLAYLIST_SLUG } from "@/lib/playlists";

export default function PlayerPage() {
  return (
    <PlaylistWatchLoader
      playlistCode={WORLD_PLAYLIST_SLUG}
      backHref="/playlists"
    />
  );
}
