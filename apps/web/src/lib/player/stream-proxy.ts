const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export function isAllowedStreamUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (BLOCKED_HOSTS.has(host)) return false;
    if (isPrivateIpv4(host)) return false;
    return true;
  } catch {
    return false;
  }
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
