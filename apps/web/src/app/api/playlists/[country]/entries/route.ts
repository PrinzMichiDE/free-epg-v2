import { NextResponse } from "next/server";
import {
  getCountryPlaylistPlayerData,
  getWorldPlaylistPlayerData,
  WORLD_PLAYLIST_SLUG,
} from "@/lib/playlists";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: raw } = await params;
  const slug = raw.toLowerCase();

  try {
    if (slug === WORLD_PLAYLIST_SLUG) {
      const data = await getWorldPlaylistPlayerData();
      if (!data) {
        return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
      }
      return NextResponse.json(data, {
        headers: { "Cache-Control": "public, max-age=3600" },
      });
    }

    const country = slug.toUpperCase();
    if (!/^[A-Z]{2}$/.test(country)) {
      return NextResponse.json({ error: "Invalid country code" }, { status: 400 });
    }

    const data = await getCountryPlaylistPlayerData(country);
    if (!data) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch (error) {
    console.error(`GET /api/playlists/${slug}/entries failed:`, error);
    return NextResponse.json({ error: "Playlist generation failed" }, { status: 503 });
  }
}
