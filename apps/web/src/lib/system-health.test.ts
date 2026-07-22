import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateOverallHealth } from "./system-health-utils.ts";

describe("system-health", () => {
  it("reports healthy when all checks pass", () => {
    assert.equal(
      evaluateOverallHealth({ app: "ok", database: "ok", redis: "ok" }),
      "healthy"
    );
  });

  it("reports degraded when any check fails", () => {
    assert.equal(
      evaluateOverallHealth({ app: "ok", database: "error", redis: "ok" }),
      "degraded"
    );
    assert.equal(
      evaluateOverallHealth({ app: "ok", database: "ok", redis: "error" }),
      "degraded"
    );
  });
});
