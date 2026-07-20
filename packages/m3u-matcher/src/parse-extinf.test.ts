import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseM3u } from "./index.js";

describe("parseM3u", () => {
  it("parses tvg attributes without nested regex backtracking", () => {
    const content = [
      "#EXTM3U",
      '#EXTINF:-1 tvg-id="ARD.de" tvg-name="Das Erste" tvg-logo="http://example.com/a.png" group-title="DE",Das Erste',
      "http://example.com/stream",
    ].join("\n");

    const entries = parseM3u(content);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].tvgId, "ARD.de");
    assert.equal(entries[0].tvgName, "Das Erste");
    assert.equal(entries[0].tvgLogo, "http://example.com/a.png");
    assert.equal(entries[0].groupTitle, "DE");
    assert.equal(entries[0].streamUrl, "http://example.com/stream");
  });

  it("handles missing optional attributes", () => {
    const content = ["#EXTM3U", "#EXTINF:-1,Plain Channel", "http://example.com/b"].join("\n");
    const entries = parseM3u(content);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].tvgName, "Plain Channel");
    assert.equal(entries[0].tvgId, undefined);
  });
});
