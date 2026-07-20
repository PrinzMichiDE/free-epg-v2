import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildXmltv, parseXmltv } from "./xmltv.js";

const XMLTV_TIMESTAMP = /^\d{14} [+-]\d{4}$/;

describe("xmltv", () => {
  it("parses category elements with lang attributes", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<tv>
  <channel id="76748"><display-name>NDR</display-name></channel>
  <programme start="20260720122000 +0200" stop="20260720131000 +0200" channel="76748">
    <title lang="de">In aller Freundschaft</title>
    <category lang="de">Serie</category>
  </programme>
</tv>`;

    const doc = parseXmltv(xml);
    assert.equal(doc.programmes[0]?.category, "Serie");
    assert.equal(doc.programmes[0]?.title, "In aller Freundschaft");
  });

  it("does not emit [object Object] for categories when rebuilding XML", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<tv>
  <channel id="76748"><display-name>NDR</display-name></channel>
  <programme start="20260720122000 +0200" stop="20260720131000 +0200" channel="76748">
    <title lang="de">In aller Freundschaft</title>
    <category lang="de">Serie</category>
  </programme>
</tv>`;

    const rebuilt = buildXmltv(parseXmltv(xml));
    assert.doesNotMatch(rebuilt, /\[object Object\]/);
    assert.match(rebuilt, /<category>Serie<\/category>/);
  });

  it("parses empty desc elements with lang attributes as undefined", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<tv>
  <channel id="FCHeidenheim.de"><display-name>FC Heidenheim</display-name></channel>
  <programme start="20260720122000 +0200" stop="20260720131000 +0200" channel="FCHeidenheim.de">
    <title>No Match Today</title>
    <desc lang="en"/>
  </programme>
</tv>`;

    const doc = parseXmltv(xml);
    assert.equal(doc.programmes[0]?.desc, undefined);
    const rebuilt = buildXmltv(doc);
    assert.doesNotMatch(rebuilt, /\[object Object\]/);
    assert.doesNotMatch(rebuilt, /<desc>/);
  });
});

describe("xmltv client compatibility (Dispatcharr, Emby)", () => {
  const sample = buildXmltv({
    channels: [
      { id: "76748", displayName: "NDR" },
      { id: "ARD.de", displayName: "Das Erste" },
    ],
    programmes: [
      {
        channel: "76748",
        start: "20260720122000 +0200",
        stop: "20260720131000 +0200",
        title: "In aller Freundschaft",
        category: "Serie",
      },
      {
        channel: "ARD.de",
        start: "20260720120000 +0200",
        stop: "20260720121500 +0200",
        title: "Tagesschau",
      },
    ],
  });

  it("uses UTF-8 XML declaration", () => {
    assert.match(sample, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });

  it("uses XMLTV timestamp format required by Dispatcharr and Emby", () => {
    const starts = [...sample.matchAll(/start="([^"]+)"/g)].map((match) => match[1]);
    assert.ok(starts.length > 0);
    for (const start of starts) {
      assert.match(start, XMLTV_TIMESTAMP, `invalid timestamp: ${start}`);
    }
  });

  it("includes stop times for all programmes", () => {
    const programmeCount = (sample.match(/<programme /g) ?? []).length;
    const stopCount = (sample.match(/stop="/g) ?? []).length;
    assert.equal(programmeCount, stopCount);
  });

  it("references only declared channel ids (Emby mapping requirement)", () => {
    const doc = parseXmltv(sample);
    const channelIds = new Set(doc.channels.map((channel) => channel.id));
    for (const programme of doc.programmes) {
      assert.ok(
        channelIds.has(programme.channel),
        `missing channel definition for ${programme.channel}`
      );
    }
  });

  it("keeps numeric epg.pw channel ids like 76748", () => {
    assert.match(sample, /channel id="76748"/);
    assert.match(sample, /channel="76748"/);
  });
});
