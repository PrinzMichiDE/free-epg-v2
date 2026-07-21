import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildProgrammePreviewBatch,
  getProgrammePreviewCleanupStrategy,
  PROGRAMME_PREVIEW_CLEANUP,
} from "./programme-preview.js";

describe("programme preview helpers", () => {
  it("uses replace-all cleanup so ended programmes are removed on refresh", () => {
    assert.equal(getProgrammePreviewCleanupStrategy(), PROGRAMME_PREVIEW_CLEANUP);
  });

  it("builds preview rows within the 24h horizon", () => {
    const now = new Date("2026-07-21T12:00:00.000Z");
    const chMap = new Map([["de.ard", 1]]);

    const batch = buildProgrammePreviewBatch(
      [
        {
          channel: "de.ard",
          start: "20260721120000 +0000",
          stop: "20260721130000 +0000",
          title: "Tagesschau",
        },
        {
          channel: "de.ard",
          start: "20260723120000 +0000",
          stop: "20260723130000 +0000",
          title: "Too far ahead",
        },
        {
          channel: "de.zdf",
          start: "20260721140000 +0000",
          stop: "20260721150000 +0000",
          title: "Unknown channel",
        },
      ],
      chMap,
      now
    );

    assert.equal(batch.length, 1);
    assert.equal(batch[0]?.title, "Tagesschau");
    assert.equal(batch[0]?.channelId, 1);
  });

  it("skips programmes with invalid timestamps", () => {
    const now = new Date("2026-07-21T12:00:00.000Z");
    const chMap = new Map([["de.ard", 1]]);

    const batch = buildProgrammePreviewBatch(
      [
        {
          channel: "de.ard",
          start: "invalid",
          stop: "20260721130000 +0000",
          title: "Broken",
        },
      ],
      chMap,
      now
    );

    assert.equal(batch.length, 0);
  });
});
