/**
 * Shared BullMQ job description for per-country EPG refreshes.
 *
 * Both the web app (`queueCountryEpgRefresh`) and the worker
 * (`fetch-all-countries`, startup warm-up) enqueue the same `fetch-country`
 * job so every caller collapses into the same deduplication window.
 *
 * Historical bug: jobs were added with a persistent `jobId` and no
 * `removeOnComplete`/`removeOnFail`. BullMQ treats a `jobId` as unique for the
 * entire lifetime of the job record, so the retained completed job silently
 * swallowed every later `add()` with the same id. After the first full run,
 * scheduled refreshes enqueued nothing and the country EPG files froze (this is
 * why countries kept their 2026-07-20 timestamp). A failed job retained via
 * `removeOnFail: <count>` had the exact same blocking effect.
 *
 * The options below fix that:
 *  - `jobId` still collapses concurrent requests for a country while the job
 *    exists (waiting/active/delayed);
 *  - `removeOnComplete`/`removeOnFail` drop the record when the job finishes so
 *    a later run can enqueue it again;
 *  - `deduplication` adds a bounded TTL throttle so a burst of requests right
 *    after a job finishes does not immediately restart it.
 */

/** Prefix of every per-country refresh job id. */
export const COUNTRY_REFRESH_JOB_PREFIX = "country-refresh";

/** How long duplicate refresh requests for one country are collapsed. */
export const COUNTRY_REFRESH_DEDUP_TTL_MS = 15 * 60 * 1000;

/** BullMQ job name handled by the worker for a single-country refresh. */
export const COUNTRY_FETCH_JOB_NAME = "fetch-country";

export interface CountryRefreshJobOptions {
  jobId: string;
  deduplication: { id: string; ttl: number };
  priority: number;
  attempts: number;
  removeOnComplete: boolean;
  removeOnFail: boolean;
}

export function countryRefreshJobId(country: string): string {
  return `${COUNTRY_REFRESH_JOB_PREFIX}-${country.toUpperCase()}`;
}

/**
 * Options for a single-country refresh job. `jobId` and the deduplication id are
 * the same string; they live in different Redis namespaces, so the job stays
 * unique while it exists and the throttle outlives a finished job for a while.
 */
export function buildCountryRefreshJobOptions(
  country: string,
  priority = 5
): CountryRefreshJobOptions {
  const id = countryRefreshJobId(country);
  return {
    jobId: id,
    deduplication: { id, ttl: COUNTRY_REFRESH_DEDUP_TTL_MS },
    priority,
    attempts: 2,
    removeOnComplete: true,
    removeOnFail: true,
  };
}
