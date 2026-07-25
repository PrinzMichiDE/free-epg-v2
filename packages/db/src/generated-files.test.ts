import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getLatestCountryFileMap } from "./generated-files.js";

describe("getLatestCountryFileMap", () => {
  it("keeps only the newest row per country", async () => {
    const rows = [
      {
        id: 2,
        country: "DE",
        listId: null,
        m3uId: null,
        path: "/new/de.xml",
        gzipPath: "/new/de.xml.gz",
        size: 200,
        checksum: "b",
        generatedAt: new Date("2026-07-23T00:00:00Z"),
      },
      {
        id: 1,
        country: "DE",
        listId: null,
        m3uId: null,
        path: "/old/de.xml",
        gzipPath: "/old/de.xml.gz",
        size: 100,
        checksum: "a",
        generatedAt: new Date("2026-07-20T00:00:00Z"),
      },
      {
        id: 3,
        country: "AT",
        listId: null,
        m3uId: null,
        path: "/at.xml",
        gzipPath: "/at.xml.gz",
        size: 50,
        checksum: "c",
        generatedAt: new Date("2026-07-22T00:00:00Z"),
      },
    ];

    const db = {
      select: () => ({
        from: () => ({
          where: () => ({
            orderBy: async () => rows,
          }),
        }),
      }),
    };

    const map = await getLatestCountryFileMap(db as never);
    assert.equal(map.size, 2);
    assert.equal(map.get("DE")?.path, "/new/de.xml");
    assert.equal(map.get("AT")?.path, "/at.xml");
  });
});
