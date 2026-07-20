import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { getServerAppVersionLabel } from "./app-version-server.ts";

describe("app-version-server", () => {
  it("reads build-info.json at runtime", async () => {
    const publicDir = path.join(process.cwd(), "public");
    mkdirSync(publicDir, { recursive: true });
    writeFileSync(
      path.join(publicDir, "build-info.json"),
      JSON.stringify({
        appVersion: "1.2.3",
        gitSha: "abcdef1",
        epgOutputVersion: 2,
      })
    );

    const label = await getServerAppVersionLabel();
    assert.equal(label, "v1.2.3 · EPG/2 · abcdef1");
  });
});
