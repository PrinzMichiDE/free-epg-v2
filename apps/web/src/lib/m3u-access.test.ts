import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isPlaylistExpired,
  isValidM3uId,
  MAX_M3U_ENTRIES,
} from "./m3u-access.ts";

describe("m3u-access", () => {
  it("accepts compact playlist ids and rejects path traversal", () => {
    assert.equal(isValidM3uId("a1b2c3d4"), true);
    assert.equal(isValidM3uId("play_list-01"), true);
    assert.equal(isValidM3uId("../etc/passwd"), false);
    assert.equal(isValidM3uId("a/b"), false);
    assert.equal(isValidM3uId("ab"), false);
  });

  it("detects expired playlists", () => {
    const now = new Date("2026-07-20T12:00:00.000Z");
    assert.equal(isPlaylistExpired(new Date("2026-07-19T12:00:00.000Z"), now), true);
    assert.equal(isPlaylistExpired(new Date("2026-07-21T12:00:00.000Z"), now), false);
    assert.equal(isPlaylistExpired(null, now), false);
    assert.equal(isPlaylistExpired("2026-07-20T11:59:59.000Z", now), true);
  });

  it("keeps documented entry ceiling", () => {
    assert.equal(MAX_M3U_ENTRIES, 5000);
  });
});
