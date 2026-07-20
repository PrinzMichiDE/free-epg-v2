import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyChannelAliases } from "./channel-aliases.js";

describe("channel-aliases", () => {
  it("copies programmes from NDR.de to NDRFernsehen.de", () => {
    const doc = applyChannelAliases({
      channels: [{ id: "NDR.de", displayName: "NDR" }],
      programmes: [
        {
          channel: "NDR.de",
          start: "20260720122000 +0200",
          stop: "20260720131000 +0200",
          title: "In aller Freundschaft",
        },
      ],
    });

    const ndr = doc.programmes.filter((programme) => programme.channel === "NDRFernsehen.de");
    assert.equal(ndr.length, 1);
    assert.equal(ndr[0]?.title, "In aller Freundschaft");
    assert.equal(ndr[0]?.start, "20260720122000 +0200");
  });

  it("does not duplicate when target channel already has programmes", () => {
    const doc = applyChannelAliases({
      channels: [{ id: "NDRFernsehen.de", displayName: "NDR Fernsehen" }],
      programmes: [
        {
          channel: "NDRFernsehen.de",
          start: "20260720120000 +0200",
          stop: "20260720130000 +0200",
          title: "Existing",
        },
        {
          channel: "NDR.de",
          start: "20260720122000 +0200",
          stop: "20260720131000 +0200",
          title: "In aller Freundschaft",
        },
      ],
    });

    const ndr = doc.programmes.filter((programme) => programme.channel === "NDRFernsehen.de");
    assert.equal(ndr.length, 1);
    assert.equal(ndr[0]?.title, "Existing");
  });
});
