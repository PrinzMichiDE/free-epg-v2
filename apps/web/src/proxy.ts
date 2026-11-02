import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { trackRequest } from "@/lib/analytics";
import { shouldTrackAnalytics } from "@/lib/analytics-middleware";
import { rateLimit } from "@/lib/rate-limit";

const isProduction = process.env.NODE_ENV === "production";
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (isProduction && (!nextAuthSecret || nextAuthSecret === "dev-secret-change-me")) {
  throw new Error("NEXTAUTH_SECRET must be set to a strong secret in production");
}

export async function proxy(request: NextRequest) {
  const start = Date.now();
  const pathname = request.nextUrl.pathname;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

  // Rate limit auth endpoints
  if (pathname.startsWith("/api/auth")) {
    const { success, limit, remaining, reset } = await rateLimit(`auth:${ip}`, 10, 60);
    if (!success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": "60",
        },
      });
    }
  }

  // Rate limit admin API endpoints
  if (pathname.startsWith("/api/admin")) {
    const { success, limit, remaining, reset } = await rateLimit(`admin-api:${ip}`, 60, 60);
    if (!success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": "60",
        },
      });
    }
  }

  // Rate limit upload and sensitive endpoints
  if (pathname.startsWith("/api/m3u/upload") || pathname.includes("/rematch")) {
    const { success, limit, remaining, reset } = await rateLimit(`upload:${ip}`, 5, 60);
    if (!success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": "60",
        },
      });
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!pathname.startsWith("/admin/login")) {
      const token = await getToken({
        req: request,
        secret: nextAuthSecret ?? "dev-secret-change-me",
      });
      if (!token) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Response-Time", `${Date.now() - start}ms`);
  
  if (pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  if (shouldTrackAnalytics(pathname)) {
    void trackRequest(request, response, start).catch(() => {
      // Analytics must not block user requests.
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
