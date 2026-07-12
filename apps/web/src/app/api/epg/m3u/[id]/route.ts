import { streamFileResponse } from "@/lib/xml-response";
import { m3uXmlPath } from "@/lib/epg-paths";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const wantsGzip = new URL(request.url).pathname.endsWith(".gz");
  const filePath = wantsGzip ? `${m3uXmlPath(id)}.gz` : m3uXmlPath(id);
  const ifNoneMatch = request.headers.get("if-none-match");

  return streamFileResponse(
    filePath,
    wantsGzip ? "application/gzip" : "application/xml; charset=utf-8",
    { gzip: wantsGzip, ifNoneMatch }
  );
}
