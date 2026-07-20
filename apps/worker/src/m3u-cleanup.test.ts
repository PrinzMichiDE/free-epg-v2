import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { m3uArtifactPaths, M3U_ID_PATTERN } from "./m3u-cleanup.js";

describe("m3u-cleanup helpers", () => {
  it("builds xml and gzip artifact paths for valid ids", () => {
    const paths = m3uArtifactPaths("/data/epg", "a1b2c3d4");
    assert.deepEqual(paths, [
      path.join("/data/epg", "m3u", "a1b2c3d4.xml"),
      path.join("/data/epg", "m3u", "a1b2c3d4.xml.gz"),
    ]);
  });

  it("refuses path traversal ids", () => {
    assert.equal(M3U_ID_PATTERN.test("../secret"), false);
    assert.deepEqual(m3uArtifactPaths("/data/epg", "../secret"), []);
    assert.deepEqual(m3uArtifactPaths("/data/epg", "a/b"), []);
  });
});
