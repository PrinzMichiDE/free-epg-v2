import { getPlaylistCountries, getWorldPlaylistMeta } from "@/lib/playlists";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  try {
    const [playlists, world] = await Promise.all([
      getPlaylistCountries(),
      getWorldPlaylistMeta(),
    ]);
    return Response.json({
      count: playlists.length,
      world,
      playlists,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET /api/playlists failed:", error);
    return Response.json(
      { error: "Playlists konnten nicht geladen werden" },
      { status: 503 }
    );
  }
}
