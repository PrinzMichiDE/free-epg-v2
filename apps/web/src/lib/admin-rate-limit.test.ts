import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("admin rate limit constants", () => {
  it("exports checkAdminRateLimit function", async () => {
    const mod = await import("./admin-rate-limit.ts");
    assert.equal(typeof mod.checkAdminRateLimit, "function");
  });
});
