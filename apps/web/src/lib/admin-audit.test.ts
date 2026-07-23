import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

function hashIp(ip: string | null): string | undefined {
  if (!ip) return undefined;
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

describe("admin-audit helpers", () => {
  it("hashes IP addresses for storage", () => {
    const hashed = hashIp("203.0.113.10");
    assert.ok(hashed);
    assert.equal(hashed?.length, 16);
    assert.equal(hashIp(null), undefined);
  });
});
