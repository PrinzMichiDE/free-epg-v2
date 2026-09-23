import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  classifyEpgFreshness,
  buildEpgCountryStatuses,
  EPG_FRESH_MAX_AGE_HOURS,
} from "./epg-status.ts";

const now = new Date("2026-09-23T12:00:00Z");

describe("classifyEpgFreshness", () => {
  it("classifies a recent generation as fresh", () => {
    const generatedAt = new Date("2026-09-23T06:00:00Z");
    assert.equal(classifyEpgFreshness(generatedAt, now), "fresh");
  });

  it("classifies an old generation as stale", () => {
    const generatedAt = new Date("2026-09-21T06:00:00Z");
    assert.equal(classifyEpgFreshness(generatedAt, now), "stale");
  });

  it("classifies a future generation as fresh", () => {
    const generatedAt = new Date("2026-09-23T13:00:00Z");
    assert.equal(classifyEpgFreshness(generatedAt, now), "fresh");
  });

  it("classifies missing data as missing", () => {
    assert.equal(classifyEpgFreshness(null, now), "missing");
  });

  it("honours a custom max age", () => {
    const generatedAt = new Date("2026-09-23T10:00:00Z");
    assert.equal(classifyEpgFreshness(generatedAt, now, 1), "stale");
    assert.equal(classifyEpgFreshness(generatedAt, now, EPG_FRESH_MAX_AGE_HOURS), "fresh");
  });
});

describe("buildEpgCountryStatuses", () => {
  it("reports status for every requested country", () => {
    const statuses = buildEpgCountryStatuses(
      new Map([["DE", new Date("2026-09-23T05:00:00Z")]]),
      ["DE", "AT"],
      now
    );

    assert.deepEqual(
      statuses.map((s) => [s.country, s.status]),
      [
        ["DE", "fresh"],
        ["AT", "missing"],
      ]
    );

    const de = statuses[0];
    assert.equal(de.name, "Deutschland");
    assert.equal(de.lastUpdated, "2026-09-23T05:00:00.000Z");
    assert.equal(de.ageHours, 7);

    const at = statuses[1];
    assert.equal(at.lastUpdated, null);
    assert.equal(at.ageHours, null);
  });
});
