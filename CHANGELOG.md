# Changelog

All notable changes to FreeEPG are documented here. Detailed compliance-oriented entries live in [`internal-docs/prozesse/changelog.md`](internal-docs/prozesse/changelog.md).

## 2026-07-21 — Daily evolution (ops, analytics & security)

### Added
- Dedicated admin login page at `/admin/login` (NextAuth `signIn` target) with shared `AdminLoginForm` component.
- Next.js 16 `proxy.ts` replacing deprecated middleware: server-side admin route protection via JWT, request analytics via `trackRequest`, and `X-Response-Time` headers.
- EPG access helpers (`apps/web/src/lib/epg-access.ts`) with country whitelist and list-ID validation; unit tests for analytics middleware helpers and programme preview batching.

### Fixed
- Programme preview DB bloat: worker now replaces all preview rows per country refresh instead of deleting only future programmes (ended rows no longer accumulate).
- Path traversal on `/api/epg/[country]` and `/api/epg/list/[id]` by validating against `SUPPORTED_EPG_COUNTRIES` and list ID pattern before filesystem access.
- Dead analytics pipeline: web requests are tracked again (Redis buffer → worker flush → admin dashboard).

### Changed
- Admin UI unauthenticated users are redirected to `/admin/login` by proxy instead of inline login on `/admin`.

## 2026-07-20 — Daily evolution (security & lifecycle)

### Added
- Shared outbound URL safety helpers (`apps/web/src/lib/url-safety.ts`) with private-IP/DNS checks, credential rejection, redirect revalidation, and body size limits.
- M3U playlist access helpers and expiry enforcement (`apps/web/src/lib/m3u-access.ts`).
- Worker job `m3u-cleanup` (cron `CRON_M3U_CLEANUP`, default `15 3 * * *`) deleting expired playlist rows and XML artifacts.
- Unit tests for URL safety, M3U access, and cleanup path helpers; CI now runs `npm test` for epg-core, web, and worker.
- Next.js rewrites for `/api/epg/m3u/:id.xml(.gz)`.

### Fixed
- SSRF risk on M3U URL import and stream proxy (literal private hosts, IPv6/ULA/CGNAT, DNS rebinding-style private resolutions, unsafe redirects).
- Unauthenticated writes from M3U rematch into global `m3u_match_overrides` (rematch is playlist-scoped only).
- Expired M3U playlists remained readable indefinitely; reads now return HTTP 410 and cleanup removes them.
- High severity drizzle-orm identifier SQL injection CVE by pinning `drizzle-orm@0.45.2` across workspaces via npm overrides.

### Changed
- M3U uploads enforce 5 MB payload and 5000 entry ceilings.
- Manual rematch requires an existing catalog channel (`xmltvId`).
