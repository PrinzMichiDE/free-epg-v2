import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ADMIN_LOGIN_RATE_LIMIT, checkAdminLoginRateLimit } from "./admin-rate-limit.ts";

describe("admin login rate limit", () => {
  it("exports checkAdminLoginRateLimit function", () => {
    assert.equal(typeof checkAdminLoginRateLimit, "function");
  });

  it("uses a 15-minute window and five attempts per IP", () => {
    assert.equal(ADMIN_LOGIN_RATE_LIMIT.windowSec, 900);
    assert.equal(ADMIN_LOGIN_RATE_LIMIT.maxRequests, 5);
    assert.equal(ADMIN_LOGIN_RATE_LIMIT.keyPrefix, "admin:login:rate:");
  });
});
