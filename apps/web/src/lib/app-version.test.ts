import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getAppVersionInfo } from "./app-version.ts";

describe("app-version", () => {
  it("builds a readable version label", () => {
    process.env.NEXT_PUBLIC_APP_VERSION = "1.2.3";
    process.env.NEXT_PUBLIC_GIT_SHA = "abcdef1234567890";

    const info = getAppVersionInfo();
    assert.equal(info.label, "v1.2.3 · EPG/2 · abcdef1");
  });
});
