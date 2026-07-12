# Sicherheitsrichtlinien FreeEPG

## Einleitung

Diese Sicherheitsrichtlinien definieren Anforderungen und Ist-Umsetzung für Authentifizierung, Autorisierung, Secrets-Management, Netzwerkzonierung, Verschlüsselung, Logging, Monitoring, Backup und Vulnerability-Management im FreeEPG-Projekt. Sie basieren auf dem tatsächlichen Code- und Infrastrukturstand.

## Geltungsbereich

- Anwendungscode (`apps/web`, `apps/worker`, `packages/*`)
- Docker-Compose-Konfigurationen (Dev und Prod)
- GitHub Actions CI/CD
- Produktionsdomain `free-epg.de` mit Traefik
- Admin-Zugang und öffentliche API-Endpunkte

## Begriffe und Definitionen

| Begriff | Definition |
|---------|------------|
| NextAuth | Authentifizierungs-Bibliothek für Next.js |
| JWT Session | Token-basierte Admin-Session ohne serverseitige Session-DB |
| Traefik | Edge-Reverse-Proxy mit automatischem TLS (Let's Encrypt) |
| Internal Network | Docker-Netzwerk ohne externe Routing-Möglichkeit |
| Secret | Geheimnis (Passwort, Token, DB-URL mit Credentials) |
| ETag | HTTP-Validator für Conditional Requests (304 Not Modified) |

## Verantwortlichkeiten

| Aktivität | Entwicklung | Betrieb | Security Officer |
|-----------|:-----------:|:-------:|:----------------:|
| Auth-Implementierung | R | I | C |
| Secrets-Rotation Prod | C | R | A |
| Netzwerk-Härtung | C | R | A |
| Vulnerability-Patching | R | R | C |
| Incident Response | R | R | A |
| Security-Review bei Releases | R | C | A |

## Detailbeschreibung

### Authentifizierung

| Aspekt | Umsetzung | Datei/Config |
|--------|-----------|--------------|
| Provider | NextAuth CredentialsProvider (Single Admin) | `apps/web/src/lib/auth.ts` |
| Credentials-Quelle | Env: `ADMIN_EMAIL`, `ADMIN_PASSWORD` | `.env.example` |
| Session | JWT-Strategy | `session: { strategy: "jwt" }` |
| Secret | `NEXTAUTH_SECRET` | Env, Dev-Default `dev-secret-change-me` |
| Login-UI | `/admin` mit Client-Side `signIn()` | `apps/web/src/app/admin/page.tsx` |
| Sign-In-Page | `/admin/login` (konfiguriert, Redirect über Admin) | `pages.signIn` in authOptions |

**Schwachstellen / Offene Punkte:**
- Kein MFA
- Kein Rate-Limiting auf Login im App-Code
- Dev-Defaults (`admin`/`admin`) in Compose-Dev

### Autorisierung

| Ressource | Schutz |
|-----------|--------|
| `/api/admin/*` | `getServerSession(authOptions)` → 401 ohne Session |
| `/api/epg/*`, `/api/m3u/*` | Öffentlich (by design) |
| `/api/health` | Öffentlich |
| Admin-UI | Client-seitige Session-Prüfung |

Beispiel: `apps/web/src/app/api/admin/analytics/route.ts`.

**Offener Punkt:** Kein serverseitiger Middleware-Schutz für `/admin`-Routen (nur Client-Check).

### Passwort- und MFA-Regeln

| Regel | Status |
|-------|--------|
| Mindestlänge Admin-Passwort | Nicht im Code erzwungen; `.env.example` empfiehlt `change-me-in-production` |
| MFA | Nicht implementiert |
| Passwort-Hashing | Nicht applicable (Plain-Vergleich mit Env-Variable) |
| Rotation | Organisatorisch bei Kompromittierung |

Empfehlung: Starkes Passwort in Prod; langfristig bcrypt-Hash in Env oder OAuth-Provider.

### Rollenmodell

| Rolle | Rechte |
|-------|--------|
| Öffentlicher Nutzer | EPG abrufen, M3U uploaden, Docs lesen |
| Admin | Dashboard, Analytics, Job-Trigger |

Kein feingranulares RBAC im Schema.

### Netzwerkzonierung

```text
[Internet] --TLS--> [Traefik / proxy-public]
                          |
                    [web :3000]
                          |
              [freeepg-internal (internal in Prod)]
                    /     |     \
            [postgres] [redis] [worker]
```

| Zone | Services | Exposition |
|------|----------|------------|
| Edge | Traefik | 443/80 öffentlich |
| DMZ/App | web | Nur via Traefik in Prod |
| Internal | postgres, redis, worker | Kein externer Zugriff in Prod |

Evidence: `docker-compose.prod.yml` – `freeepg-internal: internal: true`.

### Secrets-Management

| Secret | Speicherort | Dev | Prod |
|--------|-------------|-----|------|
| `NEXTAUTH_SECRET` | Env | Default in Compose | Pflicht via Env |
| `ADMIN_PASSWORD` | Env | Default `admin` | Pflicht |
| `POSTGRES_PASSWORD` | Env | Default `freeepg` | `${POSTGRES_PASSWORD}` |
| Docker Hub | GitHub Secrets | — | `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` |

Kein Vault/Sealed-Secrets im Repository.

### Verschlüsselung

| Kontext | Mechanismus |
|---------|-------------|
| In Transit (Prod) | TLS via Traefik (`websecure`, `certresolver=myresolver`) |
| In Transit (Dev) | HTTP localhost |
| DB/Redis intern | Kein TLS zwischen Containern |
| At Rest | Docker Volume Default (Host-FS) – **keine explizite Verschlüsselung konfiguriert** |
| IP in Analytics | SHA256 nach /24-Anonymisierung |

### Logging und Monitoring

| Quelle | Inhalt | Speicher |
|--------|--------|----------|
| Worker stdout | Job-Status, EPG-Fetch-Ergebnisse | Container-Logs |
| Web | Next.js Standard | Container-Logs |
| Analytics DB | Request-Metadaten | `analytics_events` |
| Health | `/api/health` | HTTP 200 |

Docker Healthchecks: web, postgres, redis in Compose.

**Offener Punkt:** Kein zentrales Log-Management (ELK, Loki) definiert.

### Backup

| Asset | Methode im Repo |
|-------|-----------------|
| PostgreSQL | Named Volume `pgdata` |
| EPG-Dateien | Volume `epg-data` |
| Redis | Volume `redisdata` (ephemeral-freundlich) |

**Offener Punkt:** Kein dokumentiertes Backup-/Restore-Script.

### Patch- und Vulnerability-Management

| Ebene | Prozess |
|-------|---------|
| npm Dependencies | Manuell / Dependabot **nicht im Repo konfiguriert** |
| Base Images | Rebuild bei `docker compose build`; Tags `postgres:16-alpine`, `node:22-alpine` |
| CI | Build + Lint + Typecheck on push/PR | `.github/workflows/ci.yml` |

Empfehlung: `npm audit` in CI, regelmäßige Image-Updates.

### API-Sicherheit

| Endpoint | Massnahmen |
|----------|------------|
| EPG XML | ETag/304, Cache-Control 3600s | `xml-response.ts` |
| M3U Upload | Max 5000 Einträge, Timeout 30s bei URL-Fetch | `m3u-matcher`, upload route |
| Admin Jobs | Session required | `/api/admin/jobs/trigger` |

Kein WAF im Repository; Traefik kann Middleware ergänzen.

## Nachweise und Artefakte

| Artefakt | Pfad |
|----------|------|
| Auth | `apps/web/src/lib/auth.ts` |
| Middleware | `apps/web/src/middleware.ts` |
| Docker Prod | `docker-compose.prod.yml` |
| Dockerfiles | `apps/web/Dockerfile`, `apps/worker/Dockerfile` |
| Env-Vorlage | `.env.example` |
| CI | `.github/workflows/ci.yml` |
| Health API | `apps/web/src/app/api/health/route.ts` |

## Risiken und Kontrollen

| Risiko | Auswirkung | Eintrittswahrscheinlichkeit | Massnahme | Kontrolle | Nachweis |
|--------|------------|----------------------------|-----------|-----------|----------|
| Schwaches Admin-Passwort | Admin-Kompromittierung | mittel | Strong password policy in Prod | Env-Review | Deployment-Checklist |
| Fehlendes MFA | Account-Takeover | mittel | OAuth/MFA einführen | Security-Roadmap | **Offener Punkt** |
| Dev-Secrets in Prod | Vollständige Kompromittierung | niedrig | Separate `.env` Prod | Pre-Deploy-Review | `.env.example` |
| Öffentliche M3U-API Missbrauch | DoS, Speicherfüllung | mittel | Rate-Limit Traefik, Upload-Limits | Monitoring | Upload-Limits im Code |
| Ungepatchte CVEs | Exploit | mittel | Dependabot + npm audit | CI | **Offener Punkt** |
| Kein Backup | Datenverlust | mittel | pg_dump Cron | Restore-Test | **Offener Punkt** |
| Redis ohne Auth | Internes Lateral Movement | niedrig | Internal network only | Network inspect | `docker-compose.prod.yml` |

## Pflegeprozess

1. Security-relevante Änderungen in PR mit explizitem Review.
2. Prod-Secrets mindestens jährlich rotieren (`NEXTAUTH_SECRET`, DB-Passwort).
3. Nach CVE-Alerts: Dependency-Update innerhalb definierter SLA (organisatorisch festlegen).
4. Dokument bei Architekturänderungen synchron halten.

## Revisionshistorie

| Datum | Autor/Rolle | Änderung | Anlass |
|-------|-------------|----------|--------|
| 2026-07-12 | Cursor Agent / Dokumentation | Erstversion | Sicherheits-Ist-Analyse aus Codebase |
