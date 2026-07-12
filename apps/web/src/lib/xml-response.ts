import { createReadStream, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";

export function fileEtag(filePath: string): string {
  const stat = statSync(filePath);
  const hash = createHash("md5")
    .update(`${stat.mtimeMs}-${stat.size}`)
    .digest("hex");
  return `"${hash}"`;
}

export function streamFileResponse(
  filePath: string,
  contentType: string,
  opts?: { gzip?: boolean; ifNoneMatch?: string | null }
) {
  if (!existsSync(filePath)) {
    return new Response("Not Found", { status: 404 });
  }

  const etag = fileEtag(filePath);
  if (opts?.ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const stat = statSync(filePath);
  const stream = createReadStream(filePath);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Length": String(stat.size),
    "Cache-Control": "public, max-age=3600",
    ETag: etag,
    "Last-Modified": stat.mtime.toUTCString(),
  };

  if (opts?.gzip) {
    headers["Content-Encoding"] = "gzip";
  }

  return new Response(webStream, { headers });
}
