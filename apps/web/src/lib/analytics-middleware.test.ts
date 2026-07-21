import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldTrackAnalytics } from "./analytics-middleware.ts";

describe("analytics middleware helpers", () => {
  it("tracks page and api routes", () => {
    assert.equal(shouldTrackAnalytics("/"), true);
    assert.equal(shouldTrackAnalytics("/countries/DE"), true);
    assert.equal(shouldTrackAnalytics("/api/health"), true);
  });

  it("skips static assets and internal beacons", () => {
    assert.equal(shouldTrackAnalytics("/_next/static/chunk.js"), false);
    assert.equal(shouldTrackAnalytics("/favicon.ico"), false);
    assert.equal(shouldTrackAnalytics("/api/internal/analytics/track"), false);
  });
});
