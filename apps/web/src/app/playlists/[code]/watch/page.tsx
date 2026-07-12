import { notFound } from "next/navigation";
import { PlaylistWatchLoader } from "@/components/player/PlaylistWatchLoader";

export default async function CountryPlaylistWatchPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cc = code.toUpperCase();

  if (!/^[A-Z]{2}$/.test(cc)) {
    notFound();
  }

  return (
    <PlaylistWatchLoader
      playlistCode={cc.toLowerCase()}
      backHref={`/playlists/${cc.toLowerCase()}`}
    />
  );
}
