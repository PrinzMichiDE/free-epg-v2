const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.goog",
  "metadata",
]);

const BLOCKED_HOST_SUFFIXES = [".localhost", ".local", ".internal", ".lan"];

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

function isIpv4Literal(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}

function isIpv6Literal(host: string): boolean {
  // Bracketed hosts are normalized by URL.hostname without brackets.
  return host.includes(":");
}

export function isPrivateIpv4(host: string): boolean {
  if (!isIpv4Literal(host)) return false;
  const parts = host.split(".").map(Number);
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
  if (!isIpv6Literal(normalized)) return false;
  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fe80:")) return true; // link-local
  if (
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  ) {
    return true; // ULA fc00::/7
  }
  if (normalized.startsWith("ff")) return true; // multicast

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
  if (isIpv4Literal(address)) return isPrivateIpv4(address);
  if (isIpv6Literal(address)) return isPrivateIpv6(address);
  return true;
}

export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (BLOCKED_HOSTS.has(host)) return true;
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  if ((isIpv4Literal(host) || isIpv6Literal(host)) && isPrivateIpAddress(host)) {
    return true;
  }
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
