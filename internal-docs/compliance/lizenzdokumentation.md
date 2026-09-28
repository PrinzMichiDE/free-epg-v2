# Lizenzdokumentation FreeEPG

## Einleitung

Dieses Dokument erfasst alle im FreeEPG-Projekt eingesetzten Open-Source-Komponenten, Drittanbieter-EPG-Datenquellen sowie deren Lizenztypen, Pflichten, Risiken und Freigabestatus. Die Auswertung basiert auf den `package.json`-Dateien im Monorepo sowie dem Quellcode der EPG-Quellen-Adapter.

## Geltungsbereich

- Root-Monorepo und alle Workspaces (`apps/*`, `packages/*`)
- Container-Basisimages (Node, PostgreSQL, Redis)
- Externe EPG- und Metadaten-Quellen (epg.pw, xmltv.se, iptv-org)
- CI/CD-Tools (GitHub Actions, Docker)

## Begriffe und Definitionen

| Begriff | Definition |
|---------|------------|
| OSS | Open Source Software mit expliziter Lizenz |
| SPDX | Standard zur Kennzeichnung von Software-Lizenzen |
| Copyleft | Lizenzpflicht zur Weitergabe abgeleiteter Werke unter gleichen Bedingungen |
| Permissive License | Lizenz mit minimalen Nutzungsbeschränkungen (z. B. MIT, Apache-2.0) |
| Unlicense | Public-Domain-ähnliche Lizenz ohne Copyleft |
| EPG-Quelle | Externer Anbieter von Sendezeitenplan-Daten |

## Verantwortlichkeiten

| Aktivität | Product Owner | Entwicklung | Compliance | Legal |
|-----------|:-------------:|:-----------:|:----------:|:-----:|
| Dependency-Inventar pflegen | I | R | C | I |
| Lizenz-Compliance prüfen | A | C | R | C |
| EPG-Quellen-Freigabe | A | C | R | C |
| SBOM / Lockfile-Pflege | I | R | I | I |
| Freigabe neuer Dependencies | C | R | A | C |

## Detailbeschreibung

### Projekt-Lizenz

| Aspekt | Status |
|--------|--------|
| README-Angabe | „Unlicense (EPG data from third-party sources)" |
| LICENSE-Datei im Repository | **Vorhanden** (`LICENSE`, Unlicense, 2026-07-24) |
| Empfehlung | `LICENSE`-Datei mit Unlicense-Text ergänzen; EPG-Daten separat als Drittinhalte kennzeichnen |

### Direkte npm-Abhängigkeiten (Produktion)

Ausgewertet aus `package.json`-Dateien (Stand Repository):

| Paket | Version (Range) | Lizenz | Verwendung | Copyleft | Freigabe |
|-------|-----------------|--------|------------|----------|----------|
| next | 16.2.10 | MIT | Web-Framework | nein | freigegeben |
| react / react-dom | 19.2.4 | MIT | UI | nein | freigegeben |
| next-auth | ^4.24.11 | ISC | Admin-Authentifizierung | nein | freigegeben |
| drizzle-orm | ^0.44.2 | Apache-2.0 | ORM / DB-Zugriff | nein | freigegeben |
| postgres | ^3.4.7 | Unlicense | PostgreSQL-Client | nein | freigegeben |
| bullmq | ^5.53.2 | MIT | Job-Queue | nein | freigegeben |
| ioredis | ^5.6.1 | MIT | Redis-Client | nein | freigegeben |
| node-cron | ^4.1.0 | ISC | Worker-Cron | nein | freigegeben |
| fast-xml-parser | ^5.2.5 | MIT | XMLTV-Parsing | nein | freigegeben |
| recharts | ^2.15.3 | MIT | Admin-Charts | nein | freigegeben |
| lucide-react | ^0.511.0 | ISC | Icons | nein | freigegeben |
| clsx / tailwind-merge | MIT | CSS-Utilities | nein | freigegeben |
| tailwindcss | ^4 | MIT | Styling | nein | freigegeben |

**Hinweis:** Vollständige transitive Abhängigkeiten erfordern `npm ls --all` bzw. SBOM-Generierung; hier nur direkte Dependencies dokumentiert.

### Dev-Abhängigkeiten

| Paket | Lizenz | Verwendung |
|-------|--------|------------|
| typescript | Apache-2.0 | Typisierung |
| turbo | MIT | Monorepo-Build |
| eslint / eslint-config-next | MIT | Linting |
| drizzle-kit | Apache-2.0 | Migrationen |
| tsx | MIT | TS-Ausführung |

### Container-Images

| Image | Tag | Lizenz / Hinweis |
|-------|-----|------------------|
| node | 22-alpine | MIT (Node.js) |
| postgres | 16-alpine | PostgreSQL License |
| redis | 7-alpine | BSD-3-Clause (Redis) |

### Externe EPG- und Metadaten-Quellen

| Quelle | URL / Endpoint | Datentyp | Lizenz (bekannt) | Nutzung in FreeEPG | Risiko |
|--------|----------------|----------|------------------|-------------------|--------|
| epg.pw | `https://epg.pw/xmltv/epg_{CC}.xml`, `epg_lite.xml` | XMLTV EPG | **Offener Punkt:** Keine explizite Lizenz im Code referenziert | Primäre EPG-Quelle (Adapter `EpgPwAdapter`, priority 2) | Nutzungsbedingungen prüfen |
| xmltv.se | `https://xmltv.se/almanac/*FULL.xml` | XMLTV EPG | **Offener Punkt:** Lizenz nicht im Repo dokumentiert | Sekundäre Quelle für DE/AT/CH/GB/FR/NL | Verfügbarkeit + Lizenz |
| iptv-org API | `https://iptv-org.github.io/api/*.json` | Kanal-Metadaten | Unlicense (iptv-org Projekt) | Seed (`IptvOrgApiAdapter`), Kanal-Katalog | niedrig |
| iptv-org/epg | Grabber-Projekt (GitHub) | EPG via Grab | Unlicense (typisch iptv-org) | In `epg_sources` registriert, **Worker-Integration nicht vollständig implementiert** | Implementierung ausstehend |

Attribution im UI: Footer verweist auf „iptv-org, epg.pw, xmltv.se" (`apps/web/src/components/layout/Footer.tsx`).

### Lizenzpflichten (Zusammenfassung)

| Lizenztyp | Pflichten für FreeEPG |
|-----------|----------------------|
| MIT / ISC / Apache-2.0 / BSD | Copyright-Hinweis bei Weitergabe; NOTICE-Datei empfohlen |
| Unlicense | Keine Copyleft-Pflichten |
| PostgreSQL License | Ähnlich BSD/MIT |
| Drittanbieter-EPG | Quellen nennen; kommerzielle Nutzung der Rohdaten **klärungsbedürftig** |

### Prüfprozess für neue Abhängigkeiten

1. Dependency in `package.json` nur nach Lizenz-Check hinzufügen.
2. Copyleft-Lizenzen (GPL, AGPL) vermeiden oder Legal einschalten.
3. Lockfile (`package-lock.json`) committen und in CI bauen.
4. EPG-Quellen-Änderungen in diesem Dokument und `gesamtkonzept.md` nachziehen.

## Nachweise und Artefakte

| Artefakt | Pfad |
|----------|------|
| Root package.json | `package.json` |
| Web-Dependencies | `apps/web/package.json` |
| Worker-Dependencies | `apps/worker/package.json` |
| Package-Dependencies | `packages/*/package.json` |
| Lockfile | `package-lock.json` |
| EPG-Quellen-Code | `packages/epg-sources/src/index.ts` |
| Seed-Quellen | `packages/db/src/seed.ts` |
| UI-Attribution | `apps/web/src/components/layout/Footer.tsx` |

## Risiken und Kontrollen

| Risiko | Auswirkung | Eintrittswahrscheinlichkeit | Massnahme | Kontrolle | Nachweis |
|--------|------------|----------------------------|-----------|-----------|----------|
| Unklare EPG-Daten-Lizenz | Abmahnung / Nutzungsverbot | mittel | Quellen-TOS recherchieren, Legal konsultieren | Dokumentierte Freigabe | Dieses Dokument, Offene Punkte |
| Fehlende LICENSE-Datei | Unklare OSS-Weitergabe | mittel | Unlicense-Datei ergänzen | Repository-Review | **Offener Punkt** |
| GPL-Dependency eingeschleust | Copyleft-Pflichten | niedrig | npm audit + Lizenz-Check in PR | CI-Review | PR-Checkliste |
| iptv-org/epg nicht implementiert | Falsche Quellen-Dokumentation | mittel | Worker-Integration oder Eintrag entfernen | Code-Review | `seed.ts` vs. `worker` |
| Veraltete Dependency-Lizenzen | Compliance-Lücke | niedrig | Jährlicher Dependency-Review | `npm outdated` | Lockfile-Diff |

## Pflegeprozess

1. Bei jedem Dependency-Update Lizenzfeld in npm prüfen (`npm view <pkg> license`).
2. Neue EPG-Quellen nur nach dokumentierter Freigabe aktivieren.
3. Halbjährlich SBOM oder `npm ls --production` exportieren und archivieren.
4. Offene Punkte (epg.pw/xmltv.se TOS) priorisiert klären.

## Revisionshistorie

| Datum | Autor/Rolle | Änderung | Anlass |
|-------|-------------|----------|--------|
| 2026-07-12 | Cursor Agent / Dokumentation | Erstversion | Lizenz-Inventar aus package.json und EPG-Quellen-Code |
