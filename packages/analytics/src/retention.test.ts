import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dailyAggregateCutoffDate,
  DEFAULT_DAILY_RETENTION_DAYS,
  DEFAULT_EVENT_RETENTION_DAYS,
} from "./retention.js";

describe("analytics retention helpers", () => {
  it("uses 90-day default for raw events and 365-day default for daily aggregates", () => {
    assert.equal(DEFAULT_EVENT_RETENTION_DAYS, 90);
    assert.equal(DEFAULT_DAILY_RETENTION_DAYS, 365);
  });

  it("computes cutoff date from reference date and retention days", () => {
    const reference = new Date("2026-07-27T12:00:00.000Z");
    assert.equal(dailyAggregateCutoffDate(365, reference), "2025-07-27");
    assert.equal(dailyAggregateCutoffDate(90, reference), "2026-04-28");
  });

  it("rejects invalid retention values", () => {
    assert.throws(() => dailyAggregateCutoffDate(0), RangeError);
    assert.throws(() => dailyAggregateCutoffDate(-1), RangeError);
  });
});
