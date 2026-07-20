import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  EPG_GENERATOR_NAME,
  EPG_OUTPUT_VERSION,
  isCurrentEpgOutput,
} from "./epg-version.js";
import { buildXmltv } from "./xmltv.js";

describe("epg-version", () => {
  it("marks legacy generator output as stale", () => {
    const legacy = `<?xml version="1.0" encoding="UTF-8"?>\n<tv generator-info-name="FreeEPG">`;
    assert.equal(isCurrentEpgOutput(legacy), false);
  });

  it("accepts current generator output", () => {
    const xml = buildXmltv({ channels: [], programmes: [] });
    assert.equal(isCurrentEpgOutput(xml), true);
    assert.match(xml, new RegExp(`generator-info-name="${EPG_GENERATOR_NAME}"`));
    assert.equal(EPG_OUTPUT_VERSION, 2);
  });
});
