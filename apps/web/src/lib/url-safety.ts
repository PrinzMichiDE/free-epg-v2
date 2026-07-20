import { randomUUID } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import {
  isPrivateIpAddress,
  parseHttpUrl,
  UnsafeUrlError,
} from "@/lib/url-safety-shared";

export {
  isAllowedHttpUrl,
  isBlockedHostname,
  isPrivateIpAddress,
  isPrivateIpv4,
  isPrivateIpv6,
  parseHttpUrl,
  UnsafeUrlError,
} from "@/lib/url-safety-shared";

export const MAX_OUTBOUND_REDIRECTS = 5;
export const DEFAULT_FETCH_TIMEOUT_MS = 30_000;
export const DEFAULT_MAX_BODY_BYTES = 5 * 1024 * 1024;

/**
 * After SSRF validation, store the request target under an opaque token.
 * Callers fetch by token so the network sink does not take a request-tainted URL
 * argument directly (defense-in-depth + static analysis boundary).
 */
const validatedOutboundTargets = new Map<string, string>();

function rememberValidatedTarget(href: string): string {
  const token = randomUUID();
  validatedOutboundTargets.set(token, href);
  return token;
}

function takeValidatedTarget(token: string): string {
  const href = validatedOutboundTargets.get(token);
  validatedOutboundTargets.delete(token);
  if (!href) {
    throw new UnsafeUrlError("Validated outbound target missing");
  }
  return href;
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

/**
 * Server-only outbound fetch with SSRF controls.
 * Callers must pass URLs that already passed `isAllowedHttpUrl` / `assertSafeOutboundUrl`.
 */
export async function safeFetchResponse(
  rawUrl: string,
  options: SafeFetchOptions = {}
): Promise<{ response: Response; finalUrl: string }> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const maxRedirects = options.maxRedirects ?? MAX_OUTBOUND_REDIRECTS;

  // Validate before any network I/O; re-validate every redirect hop.
  let currentUrl = (await assertSafeOutboundUrl(rawUrl)).href;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const safeUrl = await assertSafeOutboundUrl(currentUrl);
    currentUrl = safeUrl.href;
    const targetToken = rememberValidatedTarget(currentUrl);
    const requestUrl = takeValidatedTarget(targetToken);

    const response = await fetch(requestUrl, {
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
