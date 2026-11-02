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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "media-src 'self' blob: https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
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
      {
        source: "/api/epg/m3u/:id.xml.gz",
        destination: "/api/epg/m3u/:id?format=gz",
      },
      {
        source: "/api/epg/m3u/:id.xml",
        destination: "/api/epg/m3u/:id",
      },
    ];
  },
};

export default nextConfig;
