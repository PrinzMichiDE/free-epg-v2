import { streamFileResponse } from "@/lib/xml-response";
import { listXmlPath } from "@/lib/epg-paths";
import { isValidListId } from "@/lib/epg-access";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidListId(id)) {
      return new Response("List not found", { status: 404 });
    }

    const wantsGzip = new URL(request.url).pathname.endsWith(".gz");
    const filePath = wantsGzip ? `${listXmlPath(id)}.gz` : listXmlPath(id);

    return streamFileResponse(
      filePath,
      wantsGzip ? "application/gzip" : "application/xml; charset=utf-8",
      { gzip: wantsGzip, ifNoneMatch: request.headers.get("if-none-match") }
    );
  } catch (error) {
    console.error("[EPG List API] Failed to serve list:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
