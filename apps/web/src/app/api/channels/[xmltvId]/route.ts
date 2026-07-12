import { getChannelEpg } from "@/lib/player/channel-epg";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ xmltvId: string }> }
) {
  const { xmltvId } = await params;

  try {
    const data = await getChannelEpg(xmltvId);
    if (!data.channel) {
      return Response.json({ error: "Channel not found" }, { status: 404 });
    }

    return Response.json(data, {
      headers: { "Cache-Control": "public, max-age=120" },
    });
  } catch (error) {
    console.error(`GET /api/channels/${xmltvId} failed:`, error);
    return Response.json({ error: "Failed to load EPG" }, { status: 500 });
  }
}
