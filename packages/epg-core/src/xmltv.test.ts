import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildXmltv, parseXmltv } from "./xmltv.js";

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

  it("does not emit [object Object] when rebuilding XML", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<tv>
  <channel id="76748"><display-name>NDR</display-name></channel>
  <programme start="20260720122000 +0200" stop="20260720131000 +0200" channel="76748">
    <title lang="de">In aller Freundschaft</title>
    <category lang="de">Serie</category>
    <desc lang="en"/>
  </programme>
</tv>`;

    const rebuilt = buildXmltv(parseXmltv(xml));
    assert.doesNotMatch(rebuilt, /\[object Object\]/);
  });
});
