export function shouldTrackAnalytics(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return false;
  if (pathname === "/favicon.ico") return false;
  if (pathname.startsWith("/api/internal")) return false;
  return true;
}
