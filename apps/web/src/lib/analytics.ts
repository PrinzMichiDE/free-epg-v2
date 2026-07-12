import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { AnalyticsTracker, extractCountryFromPath } from "@freeepg/analytics";

const tracker = new AnalyticsTracker(process.env.REDIS_URL);

export async function trackRequest(
  request: NextRequest,
  response: NextResponse,
  start: number
) {
  if (process.env.ANALYTICS_ENABLED === "false") return;

  const path = request.nextUrl.pathname;
  const isApi = path.startsWith("/api/");

  await tracker.track({
    type: isApi ? "api_request" : "page_view",
    path,
    method: request.method,
    country: extractCountryFromPath(path),
    statusCode: response.status,
    responseTimeMs: Date.now() - start,
    referrer: request.headers.get("referer") ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined,
  });
}

export { createHash };
