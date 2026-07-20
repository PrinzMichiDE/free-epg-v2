import { isAllowedHttpUrl } from "@/lib/url-safety-shared";

export function isAllowedStreamUrl(raw: string): boolean {
  return isAllowedHttpUrl(raw);
}

export interface StreamProxyOptions {
  referrer?: string | null;
  userAgent?: string | null;
}

export function buildProxyUrl(
  targetUrl: string,
  opts?: StreamProxyOptions,
  absoluteBase?: string
): string {
  const params = new URLSearchParams({ url: targetUrl });
  if (opts?.referrer) params.set("referrer", opts.referrer);
  if (opts?.userAgent) params.set("ua", opts.userAgent);
  const path = `/api/player/stream?${params.toString()}`;
  if (absoluteBase) {
    return new URL(path, absoluteBase).href;
  }
  return path;
}

function resolveStreamUrl(relativeOrAbsolute: string, baseUrl: string): string {
  return new URL(relativeOrAbsolute, baseUrl).href;
}

export function rewriteHlsPlaylist(
  content: string,
  manifestUrl: string,
  opts?: StreamProxyOptions,
  absoluteBase?: string
): string {
  const base = new URL(manifestUrl);

  return content
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      if (trimmed.startsWith("#")) {
        return trimmed.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
          const absolute = resolveStreamUrl(uri, base.href);
          if (!isAllowedStreamUrl(absolute)) return `URI="${uri}"`;
          return `URI="${buildProxyUrl(absolute, opts, absoluteBase)}"`;
        });
      }

      const absolute = resolveStreamUrl(trimmed, base.href);
      if (!isAllowedStreamUrl(absolute)) return line;
      return buildProxyUrl(absolute, opts, absoluteBase);
    })
    .join("\n");
}

export function buildUpstreamHeaders(opts?: StreamProxyOptions): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "*/*",
  };
  if (opts?.referrer) headers.Referer = opts.referrer;
  if (opts?.userAgent) headers["User-Agent"] = opts.userAgent;
  return headers;
}

export function isHlsManifest(url: string, contentType?: string | null): boolean {
  if (url.includes(".m3u8")) return true;
  if (!contentType) return false;
  return (
    contentType.includes("mpegurl") ||
    contentType.includes("x-mpegURL") ||
    contentType.includes("vnd.apple.mpegurl")
  );
}
