import { headers } from "next/headers";
import { PlaylistWatchLoader } from "@/components/player/PlaylistWatchLoader";
import { WORLD_PLAYLIST_SLUG } from "@/lib/playlists";

function getCountryFromHeaders(h: Headers): string | null {
  const candidates = [
    h.get("x-vercel-ip-country"),
    h.get("cf-ipcountry"),
    h.get("x-country-code"),
    h.get("x-geo-country"),
  ];
  for (const c of candidates) {
    if (c && /^[A-Za-z]{2}$/.test(c) && c.toUpperCase() !== "XX") {
      return c.toUpperCase();
    }
  }
  return null;
}

export default async function WorldPlaylistWatchPage() {
  const h = await headers();
  const userCountry = getCountryFromHeaders(h);

  return (
    <PlaylistWatchLoader
      playlistCode={WORLD_PLAYLIST_SLUG}
      backHref={`/playlists/${WORLD_PLAYLIST_SLUG}`}
      defaultCountry={userCountry}
    />
  );
}
