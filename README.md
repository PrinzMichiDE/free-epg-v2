# FreeEPG

Weltweite EPG-Daten im XMLTV-Format — self-hosted Next.js Plattform.

## Features

- **XMLTV API** — EPG pro Land (`/api/epg/de.xml`, gzip, ETag/304)
- **M3U Matcher** — Upload, auto tvg-id matching, angereicherte M3U
- **Custom Lists** — personalisierte EPG-URLs
- **Admin Dashboard** — Quellen, Jobs, Analytics
- **Docker Compose** — Web + Worker + PostgreSQL + Redis
- **Traefik** — Prod-Deployment via `proxy-public` / `free-epg.de`

## Quickstart (Dev)

```bash
cp .env.example .env
docker compose up -d --build
# → http://localhost:3000
```

## Prod (Docker Hub + Traefik)

```bash
cp .env.example .env
# NEXTAUTH_SECRET, ADMIN_PASSWORD setzen
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
# → https://free-epg.de
```

## Monorepo

```
apps/web      — Next.js 15 (UI + API)
apps/worker   — BullMQ EPG Fetch + Analytics
packages/db   — Drizzle Schema
packages/epg-core, epg-sources, analytics, m3u-matcher
```

## API

| Endpoint | Beschreibung |
|----------|--------------|
| `GET /api/epg/{country}.xml` | Land-EPG |
| `GET /api/epg/{country}.xml.gz` | gzip |
| `POST /api/m3u/upload` | M3U Matching |
| `GET /api/health` | Health Check |

## Seed

```bash
npm run db:migrate
npm run db:seed
```

## License

Unlicense (EPG data from third-party sources — see `/internal-docs`)
