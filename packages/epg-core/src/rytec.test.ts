import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildRytecXmltv,
  prepareRytecDocument,
  rytecBaseName,
  rytecCountryCode,
} from "./rytec.js";

describe("rytec", () => {
  it("maps GB to UK for Rytec file names", () => {
    assert.equal(rytecCountryCode("gb"), "UK");
    assert.equal(rytecBaseName("de"), "rytecDE_Basic");
    assert.equal(rytecBaseName("gb"), "rytecUK_Basic");
  });

  it("sorts programmes by channel then start time", () => {
    const doc = prepareRytecDocument({
      channels: [
        { id: "B.de", displayName: "B" },
        { id: "A.de", displayName: "A" },
      ],
      programmes: [
        { channel: "B.de", start: "20260712120000", stop: "20260712130000", title: "Late B" },
        { channel: "A.de", start: "20260712100000", stop: "20260712110000", title: "Early A" },
        { channel: "B.de", start: "20260712100000", stop: "20260712110000", title: "Early B" },
      ],
    });

    assert.deepEqual(
      doc.programmes.map((p) => `${p.channel}:${p.start}`),
      ["A.de:20260712100000", "B.de:20260712100000", "B.de:20260712120000"]
    );
    assert.deepEqual(doc.channels.map((c) => c.id), ["A.de", "B.de"]);
  });

  it("maps category to sub-title in Rytec XML", () => {
    const xml = buildRytecXmltv({
      channels: [{ id: "ARD.de", displayName: "ARD" }],
      programmes: [
        {
          channel: "ARD.de",
          start: "20260712120000 +0200",
          stop: "20260712130000 +0200",
          title: "Tagesschau",
          category: "Nachrichten",
          desc: "Die Nachrichten",
        },
      ],
    });

    assert.match(xml, /sub-title/);
    assert.match(xml, /Nachrichten/);
    assert.match(xml, /FreeEPG Rytec/);
  });
});
