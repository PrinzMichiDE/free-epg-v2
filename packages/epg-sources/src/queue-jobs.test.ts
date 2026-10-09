import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildCountryRefreshJobOptions,
  countryRefreshJobId,
  COUNTRY_REFRESH_DEDUP_TTL_MS,
} from "./queue-jobs.js";

describe("countryRefreshJobId", () => {
  it("normalizes the country code", () => {
    assert.equal(countryRefreshJobId("de"), "country-refresh-DE");
  });
});

describe("buildCountryRefreshJobOptions", () => {
  it("removes finished jobs so a later run can enqueue the country again", () => {
    const opts = buildCountryRefreshJobOptions("DE");
    assert.equal(opts.removeOnComplete, true);
    assert.equal(opts.removeOnFail, true);
  });

  it("keeps a bounded deduplication throttle instead of a permanent jobId lock", () => {
    const opts = buildCountryRefreshJobOptions("DE");
    assert.deepEqual(opts.deduplication, {
      id: "country-refresh-DE",
      ttl: COUNTRY_REFRESH_DEDUP_TTL_MS,
    });
    assert.equal(opts.jobId, opts.deduplication.id);
  });

  it("honours the requested priority", () => {
    assert.equal(buildCountryRefreshJobOptions("DE", 1).priority, 1);
    assert.equal(buildCountryRefreshJobOptions("DE").priority, 5);
  });
});
