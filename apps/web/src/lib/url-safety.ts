import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.goog",
  "metadata",
]);

const BLOCKED_HOST_SUFFIXES = [".localhost", ".local", ".internal", ".lan"];

export const MAX_OUTBOUND_REDIRECTS = 5;
export const DEFAULT_FETCH_TIMEOUT_MS = 30_000;
export const DEFAULT_MAX_BODY_BYTES = 5 * 1024 * 1024;

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

export function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

export function isPrivateIpv6(host: string): boolean {
  const normalized = host.toLowerCase();
  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fe80:")) return true; // link-local
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // ULA
  if (normalized.startsWith("ff")) return true; // multicast

  // IPv4-mapped IPv6 (::ffff:x.x.x.x)
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return isPrivateIpv4(mapped[1]);

  const mappedHex = normalized.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (mappedHex) {
    const hi = Number.parseInt(mappedHex[1], 16);
    const lo = Number.parseInt(mappedHex[2], 16);
    const ipv4 = `${(hi >> 8) & 255}.${hi & 255}.${(lo >> 8) & 255}.${lo & 255}`;
    return isPrivateIpv4(ipv4);
  }

  return false;
}

export function isPrivateIpAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return isPrivateIpv4(address);
  if (version === 6) return isPrivateIpv6(address);
  return true;
}

export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (BLOCKED_HOSTS.has(host)) return true;
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  if (isIP(host) && isPrivateIpAddress(host)) return true;
  return false;
}

export function parseHttpUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError("Invalid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Only http and https URLs are allowed");
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError("URLs with credentials are not allowed");
  }
  if (isBlockedHostname(url.hostname)) {
    throw new UnsafeUrlError("URL host is not allowed");
  }
  return url;
}

export function isAllowedHttpUrl(raw: string): boolean {
  try {
    parseHttpUrl(raw);
    return true;
  } catch {
    return false;
  }
}

export async function assertSafeOutboundUrl(raw: string): Promise<URL> {
  const url = parseHttpUrl(raw);
  const host = url.hostname;

  if (isIP(host)) {
    if (isPrivateIpAddress(host)) {
      throw new UnsafeUrlError("URL resolves to a private IP address");
    }
    return url;
  }

  let records: Array<{ address: string }>;
  try {
    records = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new UnsafeUrlError("Unable to resolve URL host");
  }

  if (records.length === 0) {
    throw new UnsafeUrlError("Unable to resolve URL host");
  }

  for (const record of records) {
    if (isPrivateIpAddress(record.address)) {
      throw new UnsafeUrlError("URL resolves to a private IP address");
    }
  }

  return url;
}

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  headers?: HeadersInit;
}

async function readBodyWithLimit(
  response: Response,
  maxBytes: number
): Promise<string> {
  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    const length = Number(contentLength);
    if (Number.isFinite(length) && length > maxBytes) {
      throw new UnsafeUrlError(`Response exceeds size limit of ${maxBytes} bytes`);
    }
  }

  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new UnsafeUrlError(`Response exceeds size limit of ${maxBytes} bytes`);
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");
}

export async function safeFetchResponse(
  rawUrl: string,
  options: SafeFetchOptions = {}
): Promise<{ response: Response; finalUrl: string }> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const maxRedirects = options.maxRedirects ?? MAX_OUTBOUND_REDIRECTS;
  let currentUrl = (await assertSafeOutboundUrl(rawUrl)).href;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertSafeOutboundUrl(currentUrl);

    const response = await fetch(currentUrl, {
      headers: options.headers,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new UnsafeUrlError("Redirect missing Location header");
      }
      currentUrl = new URL(location, currentUrl).href;
      continue;
    }

    return { response, finalUrl: currentUrl };
  }

  throw new UnsafeUrlError("Too many redirects");
}

export async function safeFetchText(
  rawUrl: string,
  options: SafeFetchOptions = {}
): Promise<{ text: string; finalUrl: string }> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BODY_BYTES;
  const { response, finalUrl } = await safeFetchResponse(rawUrl, options);

  if (!response.ok) {
    throw new UnsafeUrlError(`Upstream returned HTTP ${response.status}`);
  }

  const text = await readBodyWithLimit(response, maxBytes);
  return { text, finalUrl };
}
