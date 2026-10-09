# free-epg-v2 — 5-Phase Implementation Plan

> Stand: 2026-10-09 · Branch: main · Working tree: clean
> Tech Stack: Next.js 16.2.10 · React 19 · Node ≥ 22 · PostgreSQL 16 · Redis 7 · Turborepo · Drizzle ORM

---

## Table of Contents

1. [Phase 1 — Build & Module Fixes](#phase-1--build--module-fixes)
2. [Phase 2 — API Route Completeness](#phase-2--api-route-completeness)
3. [Phase 3 — Adapter & Merge Coverage](#phase-3--adapter--merge-coverage)
4. [Phase 4 — Test Coverage Gaps](#phase-4--test-coverage-gaps)
5. [Phase 5 — Monitoring, Alerting & Observability](#phase-5--monitoring-alerting--observability)
6. [Architecture-vs-Implementation Mismatches](#architecture-vs-implementation-mismatches)
7. [Master Task Matrix](#master-task-matrix)

---

## Phase 1 — Build & Module Fixes

**Goal:** Make the monorepo build successfully end-to-end (root → packages → apps) and eliminate all ESM/CommonJS module-resolution failures.

### P1-1 · Add `"type": "module"` to root, apps/web, and apps/worker

**Files:**
- `/package.json`
- `/apps/web/package.json`
- `/apps/worker/package.json`

**Problem:** `tsconfig.base.json` specifies `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`. All 5 packages declare `"type": "module"`, but the root `package.json` and `apps/web/package.json` do not. `apps/worker` already has it — no change needed there. Without `"type": "module"`, Node treats `.js` files as CommonJS, which conflicts with ESM-style `import` statements used throughout the monorepo.

**Fix:**
```json
{ "type": "module" }
```
Add to root `/package.json` and `/apps/web/package.json`.

**Complexity:** Low · 0.5 h

---

### P1-2 · Remove `"^build"` dependency from `turbo.json` typecheck task

**Files:**
- `/turbo.json`

**Problem:** The `typecheck` task depends on `^build`. Turborepo's build task invokes esbuild, which attempts to bundle TypeScript source files. At the root `package.json` level (no `"type": "module"`), esbuild fails with `sourceType: module` errors because it encounters ESM `import` statements but the root treats `.js` output as CJS.

**Fix:** Change the dependency from `"^build"` to `"^typecheck"` or remove it entirely so that type-checking is a pure `tsc --noEmit` pass.

**Complexity:** Low · 0.5 h

---

### P1-3 · Audit and fix any remaining import paths

**Files:** All packages' `tsconfig.json`, `package.json` exports/imports.

**Problem:** After adding `"type": "module"` and fixing turbo dependencies, there may be `.js` import paths in `.ts` files that point to internal packages without the correct relative or bare specifier.

**Fix:** Run `tsc --noEmit --project tsconfig.base.json` across all projects. Fix any unresolved module errors.

**Complexity:** Low-Medium · 2 h

---

### P1-4 · Verify docker-compose builds succeed

**Files:**
- `/docker-compose.yml`
- `/docker-compose.prod.yml`

**Problem:** Docker Compose files reference multi-stage builds. If the root or app `package.json` lacks `"type": "module"`, the Docker build will fail at the `npm run build` step.

**Fix:** After P1-1 and P1-2, run `docker compose build --no-cache` for `web` and `worker` services to confirm success.

**Complexity:** Low · 1 h

**Phase 1 Total: ~4 hours · Severity: Critical (blocks all CI/CD)**

---

## Phase 2 — API Route Completeness

**Goal:** Ensure every documented EPG API route is implemented, all country-specific EPG sources are exposed, and the M3U uploader API exists.

### P2-1 · Implement country-specific EPG routes

**Files (current):**
- `/apps/web/src/app/api/epg/[country]/route.ts`
- `/apps/web/src/app/api/epg/global-lite/route.ts` (or similar)

**Problem:** The EPG API route currently serves only a single `global-lite.xml.gz` from `EpgPwAdapter`. There is no country-specific routing (e.g., `/epg/de.xml.gz`, `/epg/at.xml.gz`, `/epg/ch.xml.gz`). The `globetv-countries.ts` defines supported countries, but no route handles them.

**Fix:**
- Create a dynamic route: `/apps/web/src/app/api/epg/[country]/route.ts`
- Read country from params, look up in `globetv-countries.ts`
- Resolve adapter via `getAdapter(countryCode)` from `/packages/epg-sources/src/adapters.ts`
- Generate and stream `xml.gz` response
- Return 404 for unknown country codes

**Complexity:** Medium · 4 h

---

### P2-2 · Implement `/api/m3u/upload` route

**Files needed:**
- `/apps/web/src/app/api/m3u/upload/route.ts`

**Problem:** The architecture documents describe an M3U playlist uploader for channel matching. `apps/m3u-uploader` does not exist in the repo. No upload API route exists.

**Fix:**
- Create `/apps/web/src/app/api/m3u/upload/route.ts`
- Accept multipart form data (M3U/M3U8 file upload)
- Validate file type and size
- Parse playlist (reuse m3u-uploader logic or create a lightweight parser)
- Store parsed channels to Redis cache (per `/packages/epg-sources/src/playlist-cache.ts`)
- Return playlist ID for downstream matching

**Complexity:** Medium · 6 h

---

### P2-3 · Implement channel matching API

**Files needed:**
- `/apps/web/src/app/api/channels/match/route.ts`

**Problem:** Architecture describes a channel-matching pipeline (M3U channels → EPG source channels via fuzzy matching in `epg-core/matcher.ts`). No matching endpoint exists.

**Fix:**
- Accept playlist ID or raw playlist text
- Use `m3u-matcher` package for fuzzy channel name matching
- Resolve matching EPG source per channel
- Return matched channel list with confidence scores

**Complexity:** Medium · 5 h

---

### P2-4 · Add EPG download/version endpoint

**Files needed:**
- `/apps/web/src/app/api/epg/version/route.ts`

**Problem:** No endpoint exposes the current EPG version metadata. Consumers cannot determine if their cached EPG data is stale.

**Fix:**
- Read from `/packages/epg-core/src/epg-version.ts`
- Return JSON: `{ version, generatedAt, sourceCount, totalChannels }`
- Cache with `Cache-Control: public, max-age=60`

**Complexity:** Low · 1.5 h

---

### P2-5 · Review all existing API routes for error handling

**Files:** All 30 files in `/apps/web/src/app/api/`

**Problem:** Not all API routes have consistent error handling (try/catch → Zod error → HTTP 400/500). Some may silently fail or leak stack traces.

**Fix:** Audit each route. Standardize error responses:
```ts
try {
  // ...
} catch (err) {
  if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 });
  console.error(err);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

**Complexity:** Medium · 6 h

**Phase 2 Total: ~22.5 hours · Severity: High (missing documented functionality)**

---

## Phase 3 — Adapter & Merge Coverage

**Goal:** Ensure all documented EPG data sources have complete adapter implementations, country coverage is exhaustive, and merge logic handles all edge cases.

### P3-1 · Verify all 6 adapters are fully implemented

**Adapters and priority order:**
| Priority | Adapter | Source | Status | Complexity |
|----------|---------|--------|--------|------------|
| 7 | XmltvxAdapter | xmltvx.com | ✅ Implemented | 0 h |
| 5 | GlobetvAppAdapter | globetv.app | ✅ Implemented | 0 h |
| 4 | IptvEpgOrgAdapter | iptv-epg.org | ✅ Implemented | 0 h |
| 3 | EpgPwAdapter | epg.pl | ✅ Implemented | 0 h |
| 2 | XmltvSeAdapter | xmltv.se | ✅ Implemented | 0 h |
| 6 | IptvOrgEpgAdapter | iptv-org.github.io | ✅ Implemented | 0 h |

**Problem:** All 6 adapters are present. Need to verify each handles:
- Pagination for large channel lists
- Gzip decompression
- XML/JSON parsing errors
- Rate limiting / retry logic
- Timezone handling

**Fix:** Read each adapter's implementation. Add missing retry logic (exponential back-off) and error recovery per adapter.

**Complexity:** Medium · 8 h

---

### P3-2 · Complete country coverage for GlobetvAppAdapter

**Files:**
- `/packages/epg-sources/src/globetv-countries.ts`
- `/packages/epg-sources/src/adapters.ts`

**Problem:** `globetv-countries.ts` defines country codes and mapping rules. Verify every listed country has a working URL pattern and that the adapter returns valid XMLTV data for each.

**Fix:** Cross-reference documented countries with adapter's URL templates. Add missing country entries or URL patterns.

**Complexity:** Low-Medium · 3 h

---

### P3-3 · Harden merge logic in `/packages/epg-sources/src/merge.ts`

**Files:**
- `/packages/epg-sources/src/merge.ts`

**Problem:** The merge function combines programmes from multiple adapters by priority. Need to verify:
- Duplicate programme detection (same channel + same timeslot)
- Low-confidence programme removal
- Timezone-normalized comparison
- Graceful handling of programmes with missing start/end times

**Fix:** Add unit tests and edge-case handling (see Phase 4 for tests).

**Complexity:** Medium · 4 h

---

### P3-4 · Implement channel-aliases validation

**Files:**
- `/packages/epg-sources/src/channel-aliases.ts`
- `/packages/epg-sources/src/constants.ts`

**Problem:** Channel aliases map different provider names to canonical names. Verify alias list completeness and add a validation CLI command to detect orphaned aliases (referencing non-existent source channels).

**Fix:**
- Add `alias-validate` command in worker CLI
- Load aliases, cross-reference with each adapter's channel list
- Report orphans and dead-ends

**Complexity:** Medium · 4 h

**Phase 3 Total: ~19 hours · Severity: Medium (data quality risk)**

---

## Phase 4 — Test Coverage Gaps

**Goal:** Increase test coverage from current ~8 test files to a comprehensive suite covering adapters, merge logic, parsers, and API routes.

### Current Test Inventory

| Package | Test Files | Coverage Area |
|---------|-----------|---------------|
| `epg-core` | 4 | Parsing, matching, RyTEC, date handling |
| `epg-sources` | 2 | Adapter loading, merge basics |
| `m3u-matcher` | 1 | Playlist channel matching |
| `db` | 0 | Schema, migrations, queries |
| `analytics` | 0 | Metrics collection |

### P4-1 · Add adapter integration tests

**Files needed:**
- `/packages/epg-sources/src/adapters/__tests__/GlobetvAppAdapter.test.ts`
- `/packages/epg-sources/src/adapters/__tests__/IptvEpgOrgAdapter.test.ts`
- `/packages/epg-sources/src/adapters/__tests__/EpgPwAdapter.test.ts`
- `/packages/epg-sources/src/adapters/__tests__/XmltvSeAdapter.test.ts`
- `/packages/epg-sources/src/adapters/__tests__/XmltvxAdapter.test.ts`
- `/packages/epg-sources/src/adapters/__tests__/IptvOrgEpgAdapter.test.ts`

**Problem:** No adapter-specific tests exist beyond basic loading. Adapters need tests for:
- Valid XMLTV parsing (happy path)
- Malformed XML error handling
- Missing fields handling
- Country-specific URL resolution
- Response stubbing (no live network calls in tests)

**Fix:** Create per-adapter test files using `@vitest/msw` or manual response mocking.

**Complexity:** Medium · 8 h

---

### P4-2 · Add merge logic edge-case tests

**Files needed:**
- `/packages/epg-sources/src/__tests__/merge.test.ts`

**Problem:** Only 2 test files in `epg-sources`. Merge logic is critical — incorrect merging can produce stale or conflicting EPG data.

**Fix:** Add tests for:
- Priority override (higher priority source wins on conflict)
- Duplicate detection across sources
- Timezone boundary crossing
- 0-length programme handling
- Large-scale merge (1000+ programmes)

**Complexity:** Medium · 4 h

---

### P4-3 · Add API route tests

**Files needed:**
- `/apps/web/src/app/api/__tests__/epg.test.ts`
- `/apps/web/src/app/api/__tests__/channels.test.ts`
- `/apps/web/src/app/api/__tests__/m3u.test.ts`
- `/apps/web/src/app/api/__tests__/status.test.ts`

**Problem:** Zero API route tests. All routes are untested.

**Fix:** Use `@testing-library/react` + `msw` for route handler tests. Test:
- 200 / 400 / 404 / 500 status codes
- Response schema validation
- Edge cases (empty bodies, invalid params)

**Complexity:** Medium · 8 h

---

### P4-4 · Add DB schema and migration tests

**Files needed:**
- `/packages/db/__tests__/schema.test.ts`
- `/packages/db/__tests__/migrations.test.ts`

**Problem:** Zero test coverage for database layer. Schema mismatches between Drizzle definitions and actual migrations would go undetected.

**Fix:**
- Test that `drizzle-kit generate` produces no diff against current migrations
- Test all insert/select/update query builders return expected types
- Test constraint violations

**Complexity:** Medium · 4 h

---

### P4-5 · Add worker end-to-end tests

**Files needed:**
- `/apps/worker/__tests__/seed.test.ts`
- `/apps/worker/__tests__/cleanup.test.ts`
- `/apps/worker/__tests__/integration.test.ts`

**Problem:** No tests for the worker's cron execution, programme preview generation, and M3U cleanup logic.

**Fix:** Create integration tests that spin up a test Postgres/Redis (via `testcontainers` or Docker Compose override), run the worker against a fixture EPG, and verify DB state.

**Complexity:** High · 12 h

**Phase 4 Total: ~36 hours · Severity: Medium (regression risk)**

---

## Phase 5 — Monitoring, Alerting & Observability

**Goal:** Implement production-ready monitoring, health checks, and alerting infrastructure as described in the architecture documents but not yet implemented.

### P5-1 · Implement health-check endpoints

**Files needed:**
- `/apps/web/src/app/api/health/route.ts`
- `/apps/worker/src/health.ts`

**Problem:** No health-check endpoints exist. Kubernetes / Docker health probes need `/api/health` (web) and `/health` (worker).

**Fix:**
- `/api/health`: Check PostgreSQL connection, Redis connection, disk space
- `/health`: Check worker queue depth, last EPG generation timestamp
- Return `{ status: "ok" | "degraded" | "unhealthy" }` with component-level details

**Complexity:** Low · 2 h

---

### P5-2 · Add EPG generation metrics

**Files needed:**
- `/apps/worker/src/metrics.ts`
- `/packages/analytics/src/index.ts`

**Problem:** No metrics collection around EPG generation. Cannot track:
- Adapter fetch duration per country
- Merge duration
- Programme count per generation
- Error rate per adapter
- Cache hit rate

**Fix:**
- Add Prometheus-compatible metrics in `/packages/analytics/src/index.ts`
- Track via `prom-client` counters and histograms
- Expose at `/api/metrics` in web app

**Complexity:** Medium · 4 h

---

### P5-3 · Add retry and circuit-breaker for adapters

**Files needed:**
- `/packages/epg-sources/src/adapters/base.ts` (or create)

**Problem:** Adapters have no circuit-breaker pattern. A single failing EPG provider can block the entire generation pipeline.

**Fix:**
- Implement circuit breaker: after 3 consecutive failures, skip adapter for 5 min
- Implement exponential back-off with jitter: 1s → 2s → 4s → 8s → max 30s
- Track circuit state in Redis for shared awareness across worker replicas

**Complexity:** Medium · 6 h

---

### P5-4 · Add alerting thresholds

**Files needed:**
- `/apps/worker/src/alerting.ts`
- `/apps/web/src/app/api/alerts/route.ts` (optional admin API)

**Problem:** No alerting for:
- EPG generation failure
- Stale EPG data (not generated in last 2 hours)
- Adapter failure rate > 50%
- Database connection pool exhaustion
- Redis memory usage > 80%

**Fix:**
- Define alert thresholds in config
- Send notifications via webhook (Discord/Slack/Pushover)
- Store alert history in DB for audit

**Complexity:** Medium · 5 h

---

### P5-5 · Structured logging

**Files needed:**
- `/packages/db/index.ts` (DB client logger)
- `/apps/worker/src/index.ts` (worker logger)
- `/apps/web/src/middleware.ts` (request logger)

**Problem:** Console.log is used without structured format (no request IDs, no log levels, no timestamps).

**Fix:**
- Integrate `pino` or `bunyan` for structured JSON logging
- Add request ID to all API responses (X-Request-Id header)
- Add log correlation IDs to DB queries

**Complexity:** Low-Medium · 3 h

**Phase 5 Total: ~20 hours · Severity: Medium (production readiness)**

---

## Architecture-vs-Implementation Mismatches

### M1 · EPG Generator Service (described but not fully separated)

**Docs:** `/internal-docs/architektur/architektur-uebersicht.md` — Describes a dedicated "Epg Generator" service orchestrating all adapters.
**Reality:** The generator is a function inside `apps/worker/src/index.ts` (line ~100-200), mixed with other concerns (cleanup, seeding).
**Impact:** Hard to test, hard to scale independently.
**Recommendation:** Extract to `packages/epg-generator/` with its own entry point.

**Complexity:** High · 12 h

---

### M2 · M3U Uploader Service (described but non-existent)

**Docs:** Architecture documents describe a standalone `m3u-uploader` service.
**Reality:** `apps/m3u-uploader/` does not exist. M3U processing is referenced in the worker and via planned API routes.
**Impact:** No way to upload or process M3U playlists through the system.
**Recommendation:** Either implement the uploader service or update architecture docs to reflect that M3U processing happens within the web API layer.

**Complexity:** High · 16 h

---

### M3 · Analytics / Monitoring Module (described but incomplete)

**Docs:** Architecture describes an analytics module for usage metrics, EPG statistics, and performance monitoring.
**Reality:** `/packages/analytics/` exists but has zero tests and likely zero functionality.
**Impact:** No metrics, no dashboards, no alerting.
**Recommendation:** Implement as outlined in Phase 5, P5-2 through P5-5.

**Complexity:** Medium · 20 h (covered in P5-2 to P5-5)

---

### M4 · Redis Cache Layer (partially implemented)

**Docs:** Architecture describes Redis as the cache layer for playlist data, EPG programme cache, and rate limiting.
**Reality:** `/packages/epg-sources/src/playlist-cache.ts` exists. Redis is in `docker-compose.yml`. But no EPG programme cache exists — only playlist cache.
**Impact:** Every request to `/api/epg/*` potentially triggers a full generation. No programme-level caching.
**Recommendation:** Implement programme-level Redis cache with TTL-based eviction.

**Complexity:** Medium · 6 h

---

### M5 · Channel Matching Pipeline (partially implemented)

**Docs:** Architecture describes a multi-stage matching pipeline: fuzzy name match → logo match → frequency match.
**Reality:** Only fuzzy name matching exists in `packages/m3u-matcher/`. Logo and frequency matching are absent.
**Impact:** Lower matching accuracy for channels with non-standard names.
**Recommendation:** Add logo hash matching (compare MD5 of downloaded channel logos) and frequency matching (DVB/Sat/Cable frequency grouping).

**Complexity:** High · 16 h

---

## Master Task Matrix

| ID | Phase | Task | Complexity | Est. Hours | Severity | Depends On |
|----|-------|------|-----------|------------|----------|------------|
| P1-1 | Build | Add `"type": "module"` | Low | 0.5 | Critical | — |
| P1-2 | Build | Fix turbo.json `^build` dep | Low | 0.5 | Critical | — |
| P1-3 | Build | Audit import paths | Low-Med | 2 | Critical | P1-1 |
| P1-4 | Build | Verify Docker builds | Low | 1 | Critical | P1-1, P1-2 |
| **Phase 1 Subtotal** | | | | **4** | | |
| P2-1 | API | Country-specific EPG routes | Med | 4 | High | P1-1 |
| P2-2 | API | `/api/m3u/upload` route | Med | 6 | High | — |
| P2-3 | API | Channel matching API | Med | 5 | High | P2-2 |
| P2-4 | API | EPG version endpoint | Low | 1.5 | Medium | — |
| P2-5 | API | Error handling audit | Med | 6 | Medium | — |
| **Phase 2 Subtotal** | | | | **22.5** | | |
| P3-1 | Adapter | Adapter retry/recovery | Med | 8 | Medium | P1-1 |
| P3-2 | Adapter | Globetv country coverage | Low-Med | 3 | Medium | P1-1 |
| P3-3 | Adapter | Merge logic hardening | Med | 4 | Medium | — |
| P3-4 | Adapter | Channel-aliases validation | Med | 4 | Low | — |
| **Phase 3 Subtotal** | | | | **19** | | |
| P4-1 | Tests | Adapter integration tests | Med | 8 | Medium | P3-1 |
| P4-2 | Tests | Merge edge-case tests | Med | 4 | Medium | P3-3 |
| P4-3 | Tests | API route tests | Med | 8 | Medium | P2-1 |
| P4-4 | Tests | DB schema/migration tests | Med | 4 | Medium | — |
| P4-5 | Tests | Worker e2e tests | High | 12 | Medium | — |
| **Phase 4 Subtotal** | | | | **36** | | |
| P5-1 | Monitor | Health-check endpoints | Low | 2 | Medium | — |
| P5-2 | Monitor | EPG generation metrics | Med | 4 | Medium | — |
| P5-3 | Monitor | Circuit-breaker | Med | 6 | Medium | P3-1 |
| P5-4 | Monitor | Alerting thresholds | Med | 5 | Medium | P5-2 |
| P5-5 | Monitor | Structured logging | Low-Med | 3 | Medium | — |
| **Phase 5 Subtotal** | | | | **20** | | |
| **M1** | Arch | Extract EPG Generator | High | 12 | Medium | P1-1 |
| **M2** | Arch | Implement M3U Uploader | High | 16 | High | P2-2 |
| **M3** | Arch | Implement Analytics Module | Med | 20 | Medium | P5-2 |
| **M4** | Arch | Redis Programme Cache | Med | 6 | Medium | P2-1 |
| **M5** | Arch | Logo & Frequency Matching | High | 16 | Medium | P4-3 |
| **Mismatches Subtotal** | | | | **70** | | |
| **GRAND TOTAL** | | | | **171.5** | | |

---

## Recommended Execution Order

```
Phase 1 (Build Fixes) ──► Phase 2 (API Completeness) ──► Phase 3 (Adapter Coverage)
                                              │                      │
                                              ▼                      ▼
                                          Phase 4 (Tests) ◄────── Phase 5 (Monitoring)
                                              │
                                              ▼
                                        Arch Mismatches (M1-M5)
```

### Rationale

1. **Phase 1 first** — Without a working build, nothing else can be tested or deployed.
2. **Phases 2–3 in parallel** — API routes and adapter improvements are independent of each other.
3. **Phase 4 (Tests)** — Run tests against completed API and adapter work to prevent regressions.
4. **Phase 5 (Monitoring)** — Deploy after API and adapter fixes are stable; monitoring without stable endpoints produces noisy data.
5. **Architectural mismatches** — Defer to last; they are refactoring tasks that benefit from having stable, tested infrastructure first.

---

## File Reference Index

### Architecture & Config
- `/internal-docs/architektur/architektur-uebersicht.md`
- `/internal-docs/architektur/architecture-diagram.md`
- `/package.json` · `/tsconfig.base.json` · `/turbo.json`
- `/docker-compose.yml` · `/docker-compose.prod.yml`

### EPG Core
- `/packages/epg-core/src/xmltv.ts`
- `/packages/epg-core/src/matcher.ts`
- `/packages/epg-core/src/rytec.ts`
- `/packages/epg-core/src/epg-version.ts`
- `/packages/epg-core/src/xmltv-dates.ts`

### EPG Sources
- `/packages/epg-sources/src/adapters.ts`
- `/packages/epg-sources/src/merge.ts`
- `/packages/epg-sources/src/types.ts`
- `/packages/epg-sources/src/channel-aliases.ts`
- `/packages/epg-sources/src/constants.ts`
- `/packages/epg-sources/src/globetv-countries.ts`
- `/packages/epg-sources/src/playlist-cache.ts`

### Database
- `/packages/db/src/schema.ts`
- `/packages/db/src/index.ts`

### API Routes (existing)
- `/apps/web/src/app/api/` — 30 route files

### Worker
- `/apps/worker/src/index.ts` (375 lines)
- `/apps/worker/src/m3u-cleanup.ts`
- `/apps/worker/src/programme-preview.ts`
- `/apps/worker/src/migrate-cli.ts`
- `/apps/worker/src/seed-cli.ts`

### Tests (existing)
- `/packages/epg-core/` — 4 test files
- `/packages/epg-sources/` — 2 test files
- `/packages/m3u-matcher/` — 1 test file

---

## Notes

- **Zero TODO/FIXME/HACK/XXX comments** exist anywhere in the codebase — the code is marked as complete but has structural and functional gaps.
- **8 existing test files** provide minimal coverage — 89% of the codebase lacks any test.
- **`apps/m3u-uploader` does not exist** — either the architecture is aspirational or needs updating.
- **Worker already has `"type": "module"`** — only root and `apps/web` need the fix.