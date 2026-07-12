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
};

export default nextConfig;
