# Changelog

All notable changes to FreeEPG are documented here. Detailed compliance-oriented entries live in [`internal-docs/prozesse/changelog.md`](internal-docs/prozesse/changelog.md).

## 2026-07-24 — Daily evolution (admin ops & compliance)

### Added
- **LICENSE** file (Unlicense) closing audit finding F-001; third-party EPG data explicitly excluded.
- Dedicated admin jobs API at `/api/admin/jobs` with pagination, status filtering, and aggregate status counts (JWT-protected).
- Enhanced `/admin/jobs` panel: status badges, duration column, error details, filter, pagination, and 30s auto-refresh.

## 2026-07-23 — Daily evolution (security, data hygiene & admin hardening)

### Added
- Redis-backed rate limiting on `/api/admin/jobs/trigger` (10 requests/minute per admin actor) with HTTP 429 and audit log on limit breach.
- Shared `@freeepg/db` helpers `replaceCountryGeneratedFile` and `getLatestCountryFileMap` with unit tests.

### Fixed
- `generated_files` table no longer grows unbounded on every country EPG refresh; worker replaces prior country row before insert; UI/API reads resolve the latest row per country.
- Multiple high-severity Next.js advisories (GHSA-6gpp-xcg3-4w24, GHSA-m99w-x7hq-7vfj, GHSA-89xv-2m56-2m9x, GHSA-p9j2-gv94-2wf4) by upgrading to `16.2.11` with root npm override.

### Changed
- Root `package.json` pins `next@16.2.11` via npm overrides to dedupe transitive versions from `next-auth`.

## 2026-07-22 — Daily evolution (admin ops, UX & security)

### Added
- Admin **System Health** panel at `/admin/health` with JWT-protected `/api/admin/health` (DB, Redis, build info, auto-refresh).
- Admin **Audit Log** at `/admin/audit` with `admin_audit_logs` table (migration `0001`) and logging on all job-trigger actions.
- German display names for all 106 EPG countries via `Intl.DisplayNames('de')` fallback in `getCountryName`.
- CI security audit step with `scripts/audit-gate.mjs` (fails on high/critical advisories in workspace direct deps).

### Fixed
- High severity `fast-xml-parser` entity-expansion advisory (GHSA-8r6m-32jq-jx6q) by upgrading to `^5.10.1` in `@freeepg/epg-core`.

### Changed
- Public `/api/health` refactored to shared `system-health` module; admin dashboard links to Health and Audit pages.

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
