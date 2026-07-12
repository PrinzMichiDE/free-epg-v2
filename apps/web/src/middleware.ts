import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();
  response.headers.set("X-Response-Time", `${Date.now() - start}ms`);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
