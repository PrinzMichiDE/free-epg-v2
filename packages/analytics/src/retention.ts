/** Default retention for raw analytics events (matches worker cron). */
export const DEFAULT_EVENT_RETENTION_DAYS = 90;

/** Default retention for daily aggregates (longer horizon for trend reporting). */
export const DEFAULT_DAILY_RETENTION_DAYS = 365;

/**
 * Returns an ISO date string (YYYY-MM-DD) for rows older than `retentionDays`
 * relative to `referenceDate` (defaults to now).
 */
export function dailyAggregateCutoffDate(
  retentionDays: number,
  referenceDate: Date = new Date()
): string {
  if (!Number.isFinite(retentionDays) || retentionDays < 1) {
    throw new RangeError("retentionDays must be a positive number");
  }
  const cutoff = new Date(referenceDate);
  cutoff.setUTCDate(cutoff.getUTCDate() - retentionDays);
  return cutoff.toISOString().slice(0, 10);
}
