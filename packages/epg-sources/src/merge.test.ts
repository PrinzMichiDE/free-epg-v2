import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyChannelAliases } from "./channel-aliases.js";
import { localizeXmltvTimestamps } from "@freeepg/epg-core";
import { getCountryOutputTimeZone } from "./country-timezones.js";

describe("merged DE output for NDR.de", () => {
  it("localizes In aller Freundschaft to 12:20–13:10 CEST on 2026-07-20", () => {
    const merged = applyChannelAliases({
      channels: [{ id: "NDR.de", displayName: "NDR" }],
      programmes: [
        {
          channel: "NDR.de",
          start: "20260720102000 +0000",
          stop: "20260720111000 +0000",
          title: "In aller Freundschaft",
        },
      ],
    });

    const timeZone = getCountryOutputTimeZone("DE");
    assert.ok(timeZone);
    const localized = localizeXmltvTimestamps(merged, timeZone);

    const iaf = localized.programmes.find(
      (programme) =>
        programme.channel === "NDR.de" &&
        programme.title === "In aller Freundschaft"
    );
    assert.ok(iaf);
    assert.equal(iaf.start, "20260720122000 +0200");
    assert.equal(iaf.stop, "20260720131000 +0200");
  });

  it("localizes epg.pw channel 76748 to 12:20–13:10 CEST on 2026-07-20", () => {
    const timeZone = getCountryOutputTimeZone("DE");
    assert.ok(timeZone);

    const localized = localizeXmltvTimestamps(
      {
        channels: [{ id: "76748", displayName: "NDR" }],
        programmes: [
          {
            channel: "76748",
            start: "20260720102000 +0000",
            stop: "20260720111000 +0000",
            title: "In aller Freundschaft",
          },
        ],
      },
      timeZone
    );

    const iaf = localized.programmes.find((programme) => programme.channel === "76748");
    assert.ok(iaf);
    assert.equal(iaf.start, "20260720122000 +0200");
    assert.equal(iaf.stop, "20260720131000 +0200");
  });

  it("localizes epg.pw channel 76748 to 14:00–15:00 CEST for Camping am Salzhaff on 2026-07-20", () => {
    const timeZone = getCountryOutputTimeZone("DE");
    assert.ok(timeZone);

    const localized = localizeXmltvTimestamps(
      {
        channels: [{ id: "76748", displayName: "NDR" }],
        programmes: [
          {
            channel: "76748",
            start: "20260720120000 +0000",
            stop: "20260720130000 +0000",
            title: "Camping am Salzhaff",
          },
        ],
      },
      timeZone
    );

    const camping = localized.programmes.find((programme) => programme.channel === "76748");
    assert.ok(camping);
    assert.equal(camping.start, "20260720140000 +0200");
    assert.equal(camping.stop, "20260720150000 +0200");
  });
});
