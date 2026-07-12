import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@freeepg/db",
    "@freeepg/epg-core",
    "@freeepg/epg-sources",
    "@freeepg/analytics",
    "@freeepg/m3u-matcher",
    "country-flag-icons",
  ],
  output: "standalone",
  serverExternalPackages: ["postgres", "ioredis", "bullmq"],
  async rewrites() {
    return [
      {
        source: "/api/epg/rytec/:country.xml.gz",
        destination: "/api/epg/rytec/:country?format=gz",
      },
      {
        source: "/api/epg/rytec/:country.xml",
        destination: "/api/epg/rytec/:country",
      },
      {
        source: "/api/epg/rytec/channels/:country.xml",
        destination: "/api/epg/rytec/channels/:country",
      },
      {
        source: "/api/epg/:country.xml.gz",
        destination: "/api/epg/:country?format=gz",
      },
      {
        source: "/api/epg/:country.xml",
        destination: "/api/epg/:country",
      },
      {
        source: "/api/playlists/:country.m3u",
        destination: "/api/playlists/:country",
      },
    ];
  },
};

export default nextConfig;
