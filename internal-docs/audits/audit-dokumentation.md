# Audit-Dokumentation FreeEPG

## Einleitung

Diese Audit-Dokumentation definiert Prüfumfang, Auditkriterien, Evidence-Pfade, Stichprobenmethodik sowie den Umgang mit Feststellungen und Abweichungen für das FreeEPG-Projekt. Sie dient internen und externen Prüfern als Leitfaden zur Nachverfolgbarkeit von Kontrollen.

## Geltungsbereich

- Quellcode-Repository `freeepg` (Monorepo)
- CI/CD-Pipelines (GitHub Actions)
- Container-Deployment (Docker Compose Dev/Prod)
- Compliance-Dokumentation unter `/internal-docs`
- Betrieb der öffentlichen Instanz `free-epg.de` (sofern Prüfer Zugriff erhalten)

## Begriffe und Definitionen

| Begriff | Definition |
|---------|------------|
| Audit | Systematische Prüfung gegen definierte Kriterien |
| Finding | Festgestellte Abweichung oder Verbesserungspotenzial |
| Evidence | Nachweisartefakt (Code, Config, Log, Dokument) |
| Stichprobe | Repräsentative Auswahl von Kontrollen/Commits |
| Severity | Kritikalität: kritisch / hoch / mittel / niedrig |

## Verantwortlichkeiten

| Aktivität | Audit-Leitung | Entwicklung | Betrieb | Compliance |
|-----------|:-------------:|:-----------:|:-------:|:----------:|
| Audit planen | R | C | C | A |
| Evidence bereitstellen | I | R | R | C |
| Findings dokumentieren | R | C | C | A |
| Massnahmen umsetzen | I | R | R | C |
| Abschluss-Review | A | C | C | R |

## Detailbeschreibung

### Auditumfang

| Bereich | In Scope | Priorität |
|---------|----------|-----------|
| Authentifizierung Admin | ja | hoch |
| Öffentliche API (EPG, M3U) | ja | mittel |
| Datenschutz / Analytics | ja | hoch |
| Lizenz-Compliance EPG-Quellen | ja | hoch |
| Infrastruktur / Netzwerk | ja (Prod) | hoch |
| Backup / DR | ja | mittel |
| CI/CD Security | ja | mittel |
| Penetrationstest | optional | niedrig |

### Auditkriterien

1. **Compliance-Gesamtkonzept** – Schutzbedarfe adressiert
2. **ISO 27001 Mapping** – relevante Kontrollen mit Evidence
3. **DSGVO** – Verarbeitungstätigkeiten, TOMs, Retention
4. **Sicherheitsrichtlinien** – Auth, Secrets, TLS, Logging
5. **Lizenzdokumentation** – OSS + EPG-Quellen
6. **Architektur-Dokumentation** – aktuell und konsistent mit Code

### Prüffragen (Auswahl)

#### Authentifizierung & Autorisierung

| ID | Prüffrage | Evidence-Pfad | Erwartetes Ergebnis |
|----|-----------|---------------|---------------------|
| AUTH-01 | Sind Admin-APIs ohne Session blockiert? | `apps/web/src/app/api/admin/**/*.ts` | HTTP 401 ohne Session |
| AUTH-02 | Werden Prod-Secrets nicht defaulted? | `docker-compose.prod.yml`, `.env` (Betrieb) | Keine Hardcoded-Defaults für Secret/Admin |
| AUTH-03 | Ist NEXTAUTH_SECRET gesetzt? | Prod Env | Zufälliger Wert ≠ Dev-Default |

#### Datenschutz

| ID | Prüffrage | Evidence-Pfad | Erwartetes Ergebnis |
|----|-----------|---------------|---------------------|
| DSGVO-01 | Werden IPs anonymisiert vor Speicherung? | `packages/analytics/src/index.ts` | `anonymizeIp()` aktiv |
| DSGVO-02 | Gibt es Retention für Analytics? | Worker Cron `analytics-cleanup` | 90 Tage |
| DSGVO-03 | Kann Analytics deaktiviert werden? | `ANALYTICS_ENABLED=false` | Kein Tracking |

#### Sicherheit Infrastruktur

| ID | Prüffrage | Evidence-Pfad | Erwartetes Ergebnis |
|----|-----------|---------------|---------------------|
| INFRA-01 | Ist DB nicht öffentlich erreichbar? | `docker-compose.prod.yml` | Nur `freeepg-internal` |
| INFRA-02 | TLS für öffentlichen Zugriff? | Traefik-Labels | HTTPS `free-epg.de` |
| INFRA-03 | Web-Container non-root? | `apps/web/Dockerfile` | USER nextjs |

#### EPG & Lizenzen

| ID | Prüffrage | Evidence-Pfad | Erwartetes Ergebnis |
|----|-----------|---------------|---------------------|
| EPG-01 | Sind Quellen dokumentiert? | `lizenzdokumentation.md`, Footer | Attribution vorhanden |
| EPG-02 | Multi-Source-Fallback? | `apps/worker/src/index.ts` | Adapter-Merge |

#### CI/CD

| ID | Prüffrage | Evidence-Pfad | Erwartetes Ergebnis |
|----|-----------|---------------|---------------------|
| CI-01 | Build bei PR? | `.github/workflows/ci.yml` | Lint, Typecheck, Docker build |
| CI-02 | Secrets in GitHub Actions? | `docker-publish.yml` | DOCKERHUB_* als Secrets |

### Stichprobenmethodik

1. **Code-Stichprobe:** Mindestens 10 % der API-Routen unter `apps/web/src/app/api/` manuell prüfen.
2. **Commit-Stichprobe:** Letzte 20 Commits auf Security-relevante Änderungen (Auth, Env, Dependencies).
3. **Config-Review:** Vollständige Prüfung von `docker-compose*.yml`, `.env.example`, Dockerfiles.
4. **Dokumenten-Abgleich:** Architektur-Diagramm vs. tatsächliche Services.
5. **Runtime-Check (Prod):** HTTPS-Zertifikat, `/api/health`, Header `ETag` auf EPG-Response.

### Feststellungen (Initial-Review 2026-07-12)

| ID | Severity | Finding | Massnahme | Verantwortlich | Status |
|----|----------|---------|-----------|----------------|--------|
| F-001 | hoch | Keine LICENSE-Datei trotz README-Unlicense | LICENSE hinzufügen | Entwicklung | offen |
| F-002 | hoch | M3U `expiresAt` ohne automatischen Cleanup-Job | Worker-Cron `m3u-cleanup` + HTTP 410 bei abgelaufenen Reads | Entwicklung | geschlossen (2026-07-20) |
| F-009 | hoch | SSRF über M3U-URL-Import und Stream-Proxy | `url-safety` mit DNS-/Private-IP-Checks und Redirect-Revalidierung | Entwicklung | geschlossen (2026-07-20) |
| F-010 | hoch | Unauthentifizierter Write in globale `m3u_match_overrides` | Rematch nur playlist-scoped | Entwicklung | geschlossen (2026-07-20) |
| F-003 | mittel | Kein dokumentiertes Backup-Verfahren | pg_dump + Volume-Backup dokumentieren | Betrieb | offen |
| F-004 | mittel | Admin-Login ohne Rate-Limit / MFA | Traefik rate limit + MFA-Roadmap | Betrieb/Entwicklung | offen |
| F-005 | mittel | iptv-org/epg in DB registriert, nicht im Worker | Implementieren oder deaktivieren | Entwicklung | offen |
| F-006 | mittel | Keine Privacy-Policy-Seite | Datenschutzerklärung veröffentlichen | Product/Legal | offen |
| F-007 | niedrig | Kein npm audit in CI | CI-Step ergänzen | Entwicklung | offen |
| F-008 | niedrig | analytics_daily ohne Retention-Policy | Cleanup definieren | Entwicklung | offen |

### Abweichungs-Management

1. Finding in Tabelle erfassen (ID, Severity, Status).
2. Massnahme mit Verantwortlichem und Frist versehen.
3. Nach Umsetzung Evidence aktualisieren und Status auf „geschlossen".
4. Kritische Findings blockieren Prod-Release bis Behebung oder dokumentierte Risikoakzeptanz.

## Nachweise und Artefakte

| Evidence-Typ | Speicherort |
|--------------|-------------|
| Compliance-Dokumente | `/internal-docs/compliance/` |
| Architektur | `/internal-docs/architektur/` |
| CI-Logs | GitHub Actions Run History |
| DB-Migrations | `packages/db/drizzle/` |
| Job-Historie | PostgreSQL `epg_jobs` |
| Generated EPG | Volume `epg-data`, Tabelle `generated_files` |
| Diese Findings-Tabelle | Dieses Dokument |

## Risiken und Kontrollen

| Risiko | Auswirkung | Eintrittswahrscheinlichkeit | Massnahme | Kontrolle | Nachweis |
|--------|------------|----------------------------|-----------|-----------|----------|
| Audit ohne Prod-Zugriff | Unvollständige INFRA-Prüfung | mittel | Read-only SSH/Docker-Zugriff für Prüfer | Audit-Plan | Zugriffsprotokoll |
| Findings nicht geschlossen | Dauerhafte Compliance-Lücken | mittel | Quartals-Review offener Findings | Status-Meeting | Finding-Tabelle |
| Veraltete Evidence-Pfade | Falsche Audit-Ergebnisse | niedrig | Pfade bei Refactoring aktualisieren | Doc-Review in PR | Git-Diff |
| Stichprobe zu klein | Übersehene Schwachstellen | mittel | Erweiterte Stichprobe bei Major-Release | Audit-Checkliste | Audit-Bericht |

## Pflegeprozess

1. **Jährliches Internal Audit** oder vor Major-Releases.
2. Findings-Tabelle bei jedem Audit aktualisieren.
3. Prüffragen bei neuen Features ergänzen (z. B. neue API).
4. Abschlussbericht an Product Owner und Compliance (Rollen organisatorisch).

## Revisionshistorie

| Datum | Autor/Rolle | Änderung | Anlass |
|-------|-------------|----------|--------|
| 2026-07-20 | Cursor Agent / Daily Evolution | F-002 geschlossen; F-009/F-010 (SSRF, globale Match-Overrides) erfasst und geschlossen | CHG-2026-018 |
| 2026-07-12 | Cursor Agent / Dokumentation | Erstversion inkl. Initial-Findings | Erstaudit-Vorbereitung auf Codebase-Basis |
