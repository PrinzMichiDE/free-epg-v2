import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { adminTitleForPath } from "./admin-nav.ts";

describe("adminTitleForPath", () => {
  it("returns page titles for known admin routes", () => {
    assert.equal(adminTitleForPath("/admin"), "Dashboard");
    assert.equal(adminTitleForPath("/admin/health"), "System Health");
    assert.equal(adminTitleForPath("/admin/jobs"), "Job-Historie");
  });

  it("falls back for unknown admin paths", () => {
    assert.equal(adminTitleForPath("/admin/login"), "Operations");
  });
});
