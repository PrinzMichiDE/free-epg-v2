import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyChannelAliases } from "./channel-aliases.js";
import { fetchMergedCountryEpg } from "./merge.js";
import type { EpgSourceAdapter } from "./types.js";
import { localizeXmltvTimestamps, type XmltvDocument } from "@freeepg/epg-core";
import { getCountryOutputTimeZone } from "./country-timezones.js";

function fakeAdapter(
  name: string,
  priority: number,
  doc: XmltvDocument | null,
  delayMs = 0,
  fail = false
): EpgSourceAdapter {
  return {
    name,
    type: "http",
    priority,
    async fetchCountry() {
      if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
      if (fail) throw new Error("adapter failure");
      return doc;
    },
  };
}

describe("fetchMergedCountryEpg", () => {
  it("lets lower priority numbers win regardless of fetch order", async () => {
    const adapters = [
      fakeAdapter(
        "slow-base",
        5,
        {
          channels: [{ id: "CH1", displayName: "Base" }],
          programmes: [],
        },
        40
      ),
      fakeAdapter(
        "fast-refined",
        2,
        {
          channels: [{ id: "CH1", displayName: "Refined" }, { id: "CH2", displayName: "Only" }],
          programmes: [
            {
              channel: "CH1",
              start: "20260923120000 +0000",
              stop: "20260923130000 +0000",
              title: "Only in refined",
            },
          ],
        },
        5
      ),
    ];

    const result = await fetchMergedCountryEpg("XX", adapters);
    assert.ok(result);
    assert.equal(result.doc.channels.find((c) => c.id === "CH1")?.displayName, "Refined");
    assert.ok(result.doc.channels.some((c) => c.id === "CH2"));
    assert.ok(result.doc.programmes.some((p) => p.title === "Only in refined"));
    assert.deepEqual(
      result.sources.map((s) => s.name),
      ["slow-base", "fast-refined"]
    );
  });

  it("continues when an adapter throws", async () => {
    const adapters = [
      fakeAdapter("broken", 2, null, 0, true),
      fakeAdapter("good", 5, { channels: [{ id: "CH1", displayName: "Good" }], programmes: [] }),
    ];

    const result = await fetchMergedCountryEpg("XX", adapters);
    assert.ok(result);
    assert.equal(result.doc.channels.length, 1);
    assert.deepEqual(result.sources, [{ name: "good", channels: 1, programmes: 0 }]);
  });

  it("returns null when no adapter yields channels", async () => {
    const result = await fetchMergedCountryEpg("XX", [
      fakeAdapter("broken", 1, null, 0, true),
      fakeAdapter("empty", 2, { channels: [], programmes: [] }),
    ]);
    assert.equal(result, null);
  });
});

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
