# Compliance-Gesamtkonzept FreeEPG

## Einleitung

FreeEPG ist eine self-hosted Plattform zur Bereitstellung weltweiter EPG-Daten (Electronic Program Guide) im XMLTV-Format. Die Anwendung aggregiert öffentlich verfügbare Metadaten und Sendezeitenpläne von Drittanbietern (epg.pw, xmltv.se, iptv-org), speichert generierte XMLTV-Dateien lokal und stellt sie über eine Next.js-API sowie eine Web-Oberfläche bereit. Zusätzlich bietet FreeEPG einen M3U-Matcher zur Anreicherung von IPTV-Playlists mit passenden tvg-id-Werten und personalisierten EPG-URLs.

Dieses Gesamtkonzept beschreibt die strategische Compliance-Ausrichtung, das Risikoakzeptanzniveau, Schutzbedarfe, Datenflüsse und das Zusammenspiel der weiteren Richtlinien unter `/internal-docs/compliance/`.

## Geltungsbereich

Dieses Dokument gilt für:

- den Quellcode und die Betriebsartefakte im Monorepo `freeepg` (`apps/web`, `apps/worker`, `packages/*`)
- lokale Entwicklungsumgebungen (`docker-compose.yml`)
- Produktionsbetrieb über `docker-compose.prod.yml` mit Traefik, Domain `free-epg.de`
- alle internen und externen Schnittstellen (XMLTV-API, M3U-Upload, Admin-Dashboard)
- eingebundene Drittanbieter-EPG-Quellen und deren Lizenzbedingungen

Nicht im Scope: Inhalte der IPTV-Stream-URLs in hochgeladenen M3U-Dateien (Nutzer verantworten Rechte an Streams selbst).

## Begriffe und Definitionen

| Begriff | Definition |
|---------|------------|
| EPG | Electronic Program Guide; Sendezeitenplan im XMLTV-Format |
| XMLTV | Standard-XML-Schema für TV-Programmdaten (`<tv>`, `<channel>`, `<programme>`) |
| M3U | Playlist-Format für IPTV-Kanäle mit `#EXTINF`-Zeilen |
| tvg-id | XMLTV-Kanal-ID zur Verknüpfung von M3U-Einträgen mit EPG-Daten |
| Worker | Hintergrunddienst (`apps/worker`) für EPG-Fetch, Job-Queue und Analytics-Aggregation |
| BullMQ | Redis-basierte Job-Queue für asynchrone Worker-Aufgaben |
| Traefik | Reverse Proxy mit TLS-Terminierung in der Produktionsumgebung |
| Interne Analytics | Betriebseigene Nutzungsstatistik ohne externe Tracker (Google Analytics o.ä.) |
| iptv-org | Open-Source-Projekt mit Kanal-Metadaten (`channels.json`, `guides.json`) |

## Verantwortlichkeiten

| Aktivität | Product Owner | Entwicklung | Betrieb/DevOps | Compliance |
|-----------|:-------------:|:-----------:|:--------------:|:----------:|
| Strategische Compliance-Ziele | A | C | I | R |
| Technische Umsetzung Sicherheitskontrollen | I | R | C | A |
| Betrieb Produktion (Docker, Traefik) | I | C | R | I |
| DSGVO-Verarbeitungsverzeichnis | A | C | C | R |
| Lizenzprüfung Drittanbieter-EPG | A | C | I | R |
| Incident Response | A | R | R | C |
| Dokumentationspflege `/internal-docs` | C | R | C | A |

Legende: R = Responsible, A = Accountable, C = Consulted, I = Informed

**Offener Punkt:** Konkrete Personen/Rollen im Betriebsteam sind im Repository nicht hinterlegt und müssen organisatorisch ergänzt werden.

## Detailbeschreibung

### Systemzweck und Betriebsmodell

FreeEPG wird als Container-Stack betrieben:

| Komponente | Technologie | Funktion |
|------------|-------------|----------|
| Web | Next.js 16 (`apps/web`) | UI, REST-API, NextAuth-Admin |
| Worker | Node.js + BullMQ (`apps/worker`) | EPG-Fetch, Analytics-Jobs |
| PostgreSQL 16 | Drizzle ORM | Persistenz (Kanäle, Jobs, M3U, Analytics) |
| Redis 7 | ioredis, BullMQ | Job-Queue, Analytics-Puffer |
| Traefik (Prod) | `docker-compose.prod.yml` | TLS, Routing zu `free-epg.de` |

### Schutzbedarfe nach Datenkategorie

| Kategorie | Beispiele | Schutzbedarf | Begründung |
|-----------|-----------|--------------|------------|
| Öffentliche EPG-Daten | XMLTV pro Land | niedrig | Aggregierte Drittanbieter-Daten, öffentlich abrufbar |
| Betriebsmetadaten | Job-Status, Quellen-Health | mittel | Integrität für Service-Verfügbarkeit |
| Admin-Zugangsdaten | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXTAUTH_SECRET` | hoch | Vollzugriff auf Admin-Funktionen |
| M3U-Uploads | Stream-URLs, Kanalnamen | mittel | Nutzerinhalte, 30-Tage-Ablauf (`expiresAt`) |
| Analytics-Rohdaten | IP-Hash, User-Agent, Referrer | mittel | Pseudonymisierte Nutzungsdaten, 90-Tage-Retention |

### Risikoakzeptanzniveau

FreeEPG akzeptiert ein **moderates Restrisiko** bei:

- Abhängigkeit von externen EPG-Quellen (Verfügbarkeit, Lizenzänderungen)
- Einzeladmin-Authentifizierung ohne MFA (technische Schuld; siehe Sicherheitsrichtlinien)
- Fehlende formale AV-Verträge mit Drittanbietern, solange nur öffentliche HTTP-APIs ohne personenbezogene Weitergabe genutzt werden

Nicht akzeptiert werden:

- Speicherung unverschlüsselter Produktions-Secrets im Repository
- Weitergabe roher IP-Adressen an Dritte
- Betrieb ohne TLS in Produktion

### Datenflüsse (Überblick)

```mermaid
flowchart LR
  subgraph extern [Externe Quellen]
    EPGPW[epg.pw]
    XMLTVSE[xmltv.se]
    IPTV[iptv-org API]
  end
  subgraph freeepg [FreeEPG Stack]
    WEB[Next.js Web]
    WRK[Worker]
    PG[(PostgreSQL)]
    RD[(Redis)]
    FS[/data/epg]
  end
  subgraph clients [Clients]
    KODI[Kodi/Plex/IPTV-Apps]
    BROWSER[Browser]
  end
  TRAEFIK[Traefik TLS]
  EPGPW --> WRK
  XMLTVSE --> WRK
  IPTV --> WRK
  WRK --> FS
  WRK --> PG
  WRK --> RD
  BROWSER --> TRAEFIK --> WEB
  KODI --> TRAEFIK --> WEB
  WEB --> FS
  WEB --> PG
  WEB --> RD
```

### Zusammenspiel der Richtlinien

| Dokument | Schwerpunkt |
|----------|-------------|
| `iso-27001.md` | Kontroll-Mapping ISO 27001/27002 |
| `dsgvo.md` | Verarbeitungstätigkeiten, Betroffenenrechte |
| `sicherheitsrichtlinien.md` | Auth, Secrets, Netzwerk, Logging |
| `lizenzdokumentation.md` | OSS- und EPG-Quellen-Lizenzen |
| `../architektur/architektur-uebersicht.md` | Technische Architektur |
| `../audits/audit-dokumentation.md` | Prüfplan und Evidence-Pfade |

## Nachweise und Artefakte

| Nachweis | Pfad / Quelle |
|----------|---------------|
| Docker-Compose Dev/Prod | `docker-compose.yml`, `docker-compose.prod.yml` |
| Umgebungsvariablen-Vorlage | `.env.example` |
| Datenbankschema | `packages/db/src/schema.ts`, `packages/db/drizzle/0000_init.sql` |
| CI-Pipeline | `.github/workflows/ci.yml` |
| Docker-Publish | `.github/workflows/docker-publish.yml` |
| Auth-Konfiguration | `apps/web/src/lib/auth.ts` |
| Analytics-Implementierung | `packages/analytics/src/index.ts`, `apps/web/src/middleware.ts` |
| EPG-Quellen-Adapter | `packages/epg-sources/src/index.ts` |

## Risiken und Kontrollen

| Risiko | Auswirkung | Eintrittswahrscheinlichkeit | Massnahme | Kontrolle | Nachweis |
|--------|------------|----------------------------|-----------|-----------|----------|
| Ausfall externer EPG-Quelle | Unvollständige EPG-Daten | mittel | Multi-Source-Merge (epg.pw + xmltv.se), On-Demand-Fetch in API | Worker-Cron alle 6h, Fallback in `ensureEpgFile` | `apps/worker/src/index.ts`, `epg_jobs`-Tabelle |
| Kompromittierung Admin-Credentials | Unbefugter Admin-Zugriff | niedrig | Starke Passwörter via Env, TLS in Prod | NextAuth JWT, Session-Check in Admin-APIs | `auth.ts`, `/api/admin/*` |
| DSGVO-Verstoss durch Analytics | Bußgeldrisiko | niedrig | IP-Anonymisierung (SHA256 /24), Opt-out via `ANALYTICS_ENABLED=false`, 90-Tage-Löschung | `anonymizeIp()`, `cleanupOldEvents(90)` | `packages/analytics/src/index.ts` |
| Lizenzverletzung EPG-Daten | Rechtsrisiko | mittel | Lizenzdokumentation, Quellenattribution im Footer | Regelmäßige Lizenz-Review | `lizenzdokumentation.md`, Footer-Komponente |
| Secret-Leak via Git | Systemkompromittierung | niedrig | `.env` nicht committen, Secrets in CI via GitHub Secrets | `.env.example` ohne echte Werte | Repository-Scan, `.env.example` |
| Unbefugter DB-Zugriff | Datenleck | niedrig | Internes Docker-Netzwerk in Prod (`freeepg-internal: internal: true`) | Netzwerk-Isolation | `docker-compose.prod.yml` |

## Pflegeprozess

1. **Bei jeder Architektur- oder Security-relevanten Änderung:** Prüfung, ob betroffene Compliance-Dokumente aktualisiert werden müssen.
2. **Vierteljährlich:** Review der EPG-Quellen-Lizenzen und Verfügbarkeit.
3. **Bei Major-Releases:** Aktualisierung des Gesamtkonzepts und der ISO-Mappings.
4. **Verantwortlich:** Entwicklungsteam (Erstellung), Compliance (Review), Betrieb (Betriebsaspekte).
5. **Freigabe:** Product Owner bzw. definierter Compliance-Verantwortlicher (organisatorisch festzulegen).

## Revisionshistorie

| Datum | Autor/Rolle | Änderung | Anlass |
|-------|-------------|----------|--------|
| 2026-07-12 | Cursor Agent / Dokumentation | Erstversion | Initiale Erstellung der `/internal-docs`-Struktur auf Basis des Codebase-Standes |
