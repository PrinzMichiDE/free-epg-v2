import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  correctEpgPwTimestamp,
  formatXmltvDateUtc,
  parseXmltvDateString,
} from "./xmltv-dates.js";

describe("xmltv-dates", () => {
  it("parses XMLTV timestamps with explicit timezone", () => {
    const date = parseXmltvDateString("20260715033000 +0000");
    assert.equal(date?.toISOString(), "2026-07-15T03:30:00.000Z");
  });

  it("formats UTC timestamps for XMLTV output", () => {
    const formatted = formatXmltvDateUtc(new Date("2026-07-15T03:30:00.000Z"));
    assert.equal(formatted, "20260715033000 +0000");
  });

  it("corrects epg.pw +8h false UTC offset (ARD Morgenmagazin)", () => {
    assert.equal(
      correctEpgPwTimestamp("20260715113000 +0000"),
      "20260715033000 +0000"
    );
    assert.equal(
      correctEpgPwTimestamp("20260715150000 +0000"),
      "20260715070000 +0000"
    );
  });

  it("corrects epg.pw +8h false UTC offset (RTL Deutschland am Morgen)", () => {
    assert.equal(
      correctEpgPwTimestamp("20260715120000 +0000"),
      "20260715040000 +0000"
    );
    assert.equal(
      correctEpgPwTimestamp("20260715150000 +0000"),
      "20260715070000 +0000"
    );
  });

  it("handles day rollover when subtracting eight hours", () => {
    assert.equal(
      correctEpgPwTimestamp("20260719000500 +0000"),
      "20260718160500 +0000"
    );
  });
});
