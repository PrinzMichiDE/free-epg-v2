import {
  buildUpstreamHeaders,
  isAllowedStreamUrl,
  isHlsManifest,
  rewriteHlsPlaylist,
} from "@/lib/player/stream-proxy";
import { safeFetchResponse, UnsafeUrlError } from "@/lib/url-safety";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl || !isAllowedStreamUrl(targetUrl)) {
    return new Response("Invalid stream URL", { status: 400 });
  }

  const opts = {
    referrer: searchParams.get("referrer"),
    userAgent: searchParams.get("ua"),
  };

  try {
    const { response: upstream, finalUrl } = await safeFetchResponse(targetUrl, {
      headers: buildUpstreamHeaders(opts),
      timeoutMs: 30_000,
    });

    if (!upstream.ok) {
      return new Response(`Upstream error: ${upstream.status}`, {
        status: upstream.status,
      });
    }

    const contentType = upstream.headers.get("content-type");

    if (isHlsManifest(finalUrl, contentType) || isHlsManifest(targetUrl, contentType)) {
      const text = await upstream.text();
      const requestOrigin = new URL(request.url).origin;
      const rewritten = rewriteHlsPlaylist(text, finalUrl, opts, requestOrigin);

      return new Response(rewritten, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const headers = new Headers();
    if (contentType) headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "no-store");
    headers.set("Access-Control-Allow-Origin", "*");

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    if (error instanceof UnsafeUrlError) {
      return new Response("Invalid stream URL", { status: 400 });
    }
    console.error("Stream proxy failed:", error);
    return new Response("Stream proxy failed", { status: 502 });
  }
}
