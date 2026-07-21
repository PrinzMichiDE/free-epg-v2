import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { trackRequest } from "@/lib/analytics";
import { shouldTrackAnalytics } from "@/lib/analytics-middleware";

export async function proxy(request: NextRequest) {
  const start = Date.now();
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me",
    });
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Response-Time", `${Date.now() - start}ms`);

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
