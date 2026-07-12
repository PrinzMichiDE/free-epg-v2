import { buildCountryPlaylistM3u } from "@/lib/playlists";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: raw } = await params;
  const country = raw.replace(/\.m3u$/i, "").toUpperCase();

  if (!/^[A-Z]{2}$/.test(country)) {
    return new Response("Invalid country code", { status: 400 });
  }

  try {
    const result = await buildCountryPlaylistM3u(country);
    if (!result) {
      return new Response("Playlist not found", { status: 404 });
    }

    return new Response(result.content, {
      headers: {
        "Content-Type": "audio/x-mpegurl; charset=utf-8",
        "Content-Disposition": `attachment; filename="freeepg-${country.toLowerCase()}.m3u"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error(`GET /api/playlists/${country} failed:`, error);
    return new Response("Playlist generation failed", { status: 503 });
  }
}
