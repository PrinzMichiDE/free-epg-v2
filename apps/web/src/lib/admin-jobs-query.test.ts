import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatJobDuration,
  jobStatusBadgeVariant,
  jobStatusBadgeVariantForUnknown,
  parseAdminJobsQuery,
  summarizeJobStatuses,
} from "./admin-jobs-query.ts";

describe("parseAdminJobsQuery", () => {
  it("applies defaults and clamps pagination", () => {
    const query = parseAdminJobsQuery(new URLSearchParams());
    assert.equal(query.page, 1);
    assert.equal(query.pageSize, 25);
    assert.equal(query.status, undefined);
  });

  it("accepts valid status filter", () => {
    const query = parseAdminJobsQuery(new URLSearchParams("status=failed&page=2&pageSize=200"));
    assert.equal(query.status, "failed");
    assert.equal(query.page, 2);
    assert.equal(query.pageSize, 100);
  });

  it("rejects unknown status values", () => {
    const query = parseAdminJobsQuery(new URLSearchParams("status=unknown"));
    assert.equal(query.status, undefined);
  });
});

describe("jobStatusBadgeVariant", () => {
  it("maps known statuses to badge variants", () => {
    assert.equal(jobStatusBadgeVariant("completed"), "success");
    assert.equal(jobStatusBadgeVariant("running"), "warning");
    assert.equal(jobStatusBadgeVariant("failed"), "default");
    assert.equal(jobStatusBadgeVariant("pending"), "muted");
    assert.equal(jobStatusBadgeVariantForUnknown("other"), "muted");
  });
});

describe("formatJobDuration", () => {
  it("formats seconds and minutes", () => {
    const start = "2026-07-24T10:00:00.000Z";
    const end = "2026-07-24T10:00:45.000Z";
    assert.equal(formatJobDuration(start, end), "45s");
    assert.equal(formatJobDuration(start, "2026-07-24T10:02:30.000Z"), "2m 30s");
  });

  it("returns null when timestamps are invalid", () => {
    assert.equal(formatJobDuration(null, null), null);
    assert.equal(formatJobDuration("invalid", "2026-07-24T10:00:00.000Z"), null);
  });
});

describe("summarizeJobStatuses", () => {
  it("counts jobs by status", () => {
    const summary = summarizeJobStatuses([
      { status: "pending" },
      { status: "running" },
      { status: "failed" },
      { status: "failed" },
      { status: "completed" },
    ]);
    assert.deepEqual(summary, {
      pending: 1,
      running: 1,
      completed: 1,
      failed: 2,
    });
  });
});
