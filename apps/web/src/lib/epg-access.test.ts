import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isSupportedEpgCountry,
  isValidListId,
  normalizeEpgCountryParam,
} from "./epg-access.ts";

describe("epg-access", () => {
  it("normalizes country params from xml paths", () => {
    assert.equal(normalizeEpgCountryParam("de.xml"), "DE");
    assert.equal(normalizeEpgCountryParam("de.xml.gz"), "DE");
  });

  it("accepts supported countries and rejects traversal", () => {
    assert.equal(isSupportedEpgCountry("DE"), true);
    assert.equal(isSupportedEpgCountry("de"), true);
    assert.equal(isSupportedEpgCountry("../etc"), false);
    assert.equal(isSupportedEpgCountry("ZZ"), false);
  });

  it("validates custom list ids", () => {
    assert.equal(isValidListId("a1b2c3d4"), true);
    assert.equal(isValidListId("../secret"), false);
    assert.equal(isValidListId("not-a-uuid-slice"), false);
  });
});
