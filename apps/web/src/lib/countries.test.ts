import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources";
import { COUNTRY_NAMES, getCountryName } from "./countries.ts";

describe("countries", () => {
  it("returns curated overrides for common regions", () => {
    assert.equal(getCountryName("DE"), "Deutschland");
    assert.equal(getCountryName("US"), "USA");
    assert.equal(getCountryName("GB"), "Vereinigtes Königreich");
  });

  it("falls back to German Intl.DisplayNames for all supported EPG countries", () => {
    for (const code of SUPPORTED_EPG_COUNTRIES) {
      const name = getCountryName(code);
      assert.notEqual(name, code, `missing display name for ${code}`);
      assert.match(name, /\p{L}/u, `expected letters in name for ${code}`);
    }
  });

  it("prefers world playlist names over Intl fallback", () => {
    assert.equal(
      getCountryName("AE", { AE: "Custom UAE" }),
      "Custom UAE"
    );
  });

  it("keeps override map keys uppercase", () => {
    for (const code of Object.keys(COUNTRY_NAMES)) {
      assert.equal(code, code.toUpperCase());
    }
  });
});
