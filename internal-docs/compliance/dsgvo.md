# DSGVO-Dokumentation FreeEPG

## Einleitung

FreeEPG verarbeitet personenbezogene und pseudonymisierte Daten im Rahmen des Betriebs der EPG-Plattform, insbesondere bei interner Analytics, M3U-Uploads und Server-Logistik. Dieses Dokument beschreibt Verarbeitungstätigkeiten, Rechtsgrundlagen, Speicherfristen, Betroffenenrechte, technisch-organisatorische Maßnahmen (TOMs) und eine DSFA-Schwellenwertanalyse.

**Offener Punkt:** Verantwortlicher (Controller) im Sinne der DSGVO ist im Repository nicht benannt (natürliche Person / Organisation hinter `free-epg.de`).

## Geltungsbereich

- Produktionsbetrieb unter `free-epg.de` und Self-Hosting-Instanzen
- Verarbeitung durch `apps/web` (Middleware, API) und `apps/worker` (Analytics-Jobs)
- PostgreSQL-Tabellen mit potenziell personenbezogenen Daten
- Keine Registrierung öffentlicher Endnutzer; Admin-Zugang separat

## Begriffe und Definitionen

| Begriff | Definition |
|---------|------------|
| personenbezogene Daten | Informationen zu identifizierter/identifizierbarer natürlicher Person (Art. 4 Nr. 1 DSGVO) |
| pseudonymisierte Daten | Daten ohne zusätzliche Information nicht zuordenbar (Art. 4 Nr. 5 DSGVO) |
| IP-Hash | SHA256-Hash einer anonymisierten IPv4-/24-Adresse |
| Verarbeitungstätigkeit | Zweckgebundener Umgang mit Daten (Art. 30 DSGVO) |
| DSFA | Datenschutz-Folgenabschätzung (Art. 35 DSGVO) |
| AVV | Auftragsverarbeitungsvertrag (Art. 28 DSGVO) |

## Verantwortlichkeiten

| Aktivität | Verantwortlicher (Controller) | Entwicklung | Betrieb | Datenschutz |
|-----------|:-----------------------------:|:-----------:|:-------:|:-----------:|
| Verzeichnis von Verarbeitungstätigkeiten | A | C | C | R |
| Betroffenenanfragen bearbeiten | A | C | I | R |
| TOM-Umsetzung | I | R | R | A |
| DSFA durchführen | A | C | C | R |
| AVV mit Hosting-Provider | A | I | R | C |

## Detailbeschreibung

### Verzeichnis von Verarbeitungstätigkeiten (Art. 30)

#### VT-1: Interne Betriebs-Analytics

| Feld | Inhalt |
|------|--------|
| Zweck | Messung von Seitenaufrufen und API-Nutzung zur Kapazitätsplanung und Fehleranalyse |
| Datenkategorien | Pseudonymisierter IP-Hash, User-Agent, Referrer, Request-Pfad, HTTP-Methode, Land (aus EPG-Pfad), Response-Zeit |
| Betroffene | Website- und API-Besucher |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Betriebssicherheit und Service-Optimierung) |
| Speicherdauer | Roh-Events: 90 Tage (`cleanupOldEvents(90)`); Tages-Aggregate in `analytics_daily` (Dauer nicht explizit begrenzt im Code) |
| Empfänger | Keine Weitergabe an Dritte; Speicherung in eigener PostgreSQL |
| Drittlandtransfer | Nein (Self-Hosted) |
| TOMs | IP-Anonymisierung vor Hash, Opt-out via `ANALYTICS_ENABLED=false`, TLS in Prod |

Implementierung: `apps/web/src/middleware.ts`, `packages/analytics/src/index.ts`.

#### VT-2: M3U-Playlist-Upload

| Feld | Inhalt |
|------|--------|
| Zweck | Matching von IPTV-Kanalnamen zu XMLTV-IDs und Generierung personalisierter EPG |
| Datenkategorien | Kanalnamen, Stream-URLs, tvg-id, group-title, Upload-Metadaten |
| Betroffene | Nutzer, die M3U hochladen (nicht registriert; keine Kontodaten) |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. b DSGVO (Vertrag/ vorvertragliche Maßnahme) bzw. lit. f (Servicebereitstellung) |
| Speicherdauer | 30 Tage (`expiresAt` bei Upload) – **automatische Löschung nicht im Code verifiziert** (Offener Punkt) |
| Empfänger | Keine Weitergabe; lokale DB und Dateisystem |
| Drittlandtransfer | Nein |
| TOMs | Kein öffentliches Listing fremder URLs; ID-basierter Zugriff |

Implementierung: `apps/web/src/app/api/m3u/upload/route.ts`, Tabellen `m3u_playlists`, `m3u_entries`.

#### VT-3: Admin-Authentifizierung

| Feld | Inhalt |
|------|--------|
| Zweck | Schutz des Admin-Dashboards |
| Datenkategorien | E-Mail (Admin), JWT-Session (serverseitig NextAuth) |
| Betroffene | Administrator(en) |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. f DSGVO |
| Speicherdauer | Session-basiert (JWT); Credentials in Env-Variablen |
| Empfänger | Keine |
| TOMs | HTTPS, Secret-Rotation empfohlen |

#### VT-4: EPG-Metadaten (Kanäle/Programme)

| Feld | Inhalt |
|------|--------|
| Zweck | Bereitstellung öffentlicher TV-Programminformationen |
| Datenkategorien | Sendername, Sendungstitel, Beschreibung – **keine natürlichen Personen als Hauptgegenstand** |
| Betroffene | Theoretisch Personen in Sendungsbeschreibungen (Drittinhalte) |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. f DSGVO / Informationsfreiheit |
| Speicherdauer | Bis zur nächsten EPG-Aktualisierung (Worker-Cron 6h) |
| Hinweis | Inhalte stammen von Drittanbietern |

### Kategorien personenbezogener Daten (Zusammenfassung)

| Kategorie | Sensibilität | Verarbeitung |
|-----------|--------------|--------------|
| IP (roh) | mittel | Nur transient in Middleware, nicht persistiert |
| IP-Hash | niedrig-mittel | Persistiert in `analytics_events.ip_hash` |
| User-Agent / Referrer | niedrig | Analytics |
| M3U Stream-URLs | mittel | Können Hinweise auf Nutzungsverhalten geben |
| Admin-E-Mail | mittel | Env + Session |

### Betroffenenrechte (Art. 12–22)

| Recht | Umsetzung FreeEPG |
|-------|-------------------|
| Auskunft | Analytics/M3U-Daten über Admin-DB abfragbar; kein Self-Service-Portal |
| Löschung | Analytics: automatisch nach 90 Tagen; M3U: manuell/Expiry – **Cleanup-Job für M3U offen** |
| Widerspruch | Analytics deaktivierbar (`ANALYTICS_ENABLED=false`) |
| Datenübertragbarkeit | Kein Nutzerkonto; M3U-Download via API möglich |
| Beschwerde | An zuständige Aufsichtsbehörde – **Offener Punkt:** Controller-Adresse fehlt |

### Technisch-organisatorische Maßnahmen (TOMs)

| Bereich | Massnahme | Evidence |
|---------|-----------|----------|
| Vertraulichkeit | TLS via Traefik (Prod), internes Docker-Netzwerk | `docker-compose.prod.yml` |
| Pseudonymisierung | IPv4 /24 + SHA256 | `anonymizeIp()` |
| Integrität | Drizzle ORM, parametrisierte Queries | `packages/db` |
| Verfügbarkeit | Healthchecks, Redis/Postgres Volumes | Docker Compose |
| Trennung | Admin-API mit Session-Check | `/api/admin/*` |
| Datenminimierung | Keine Nutzer-Registrierung, Analytics abschaltbar | Env-Flags |

### Auftragsverarbeiter und Drittlandtransfer

| Dienst | Rolle | AVV | Drittland |
|--------|-------|-----|-----------|
| Hosting-Server (Self-Hosted) | Eigenbetrieb | n/a | **Offener Punkt:** Standort nicht im Repo |
| GitHub | Code-Hosting, CI | GitHub DPA erforderlich bei Nutzung | USA möglich |
| Docker Hub | Container-Registry | Docker DPA | USA möglich |
| epg.pw / xmltv.se | Datenquelle (kein AV nötig bei reinem Abruf öffentlicher Daten) | — | Unbekannt |

### DSFA-Schwellenwertanalyse (Art. 35)

| Kriterium | Bewertung | Begründung |
|-----------|-----------|------------|
| Systematische umfangreiche Überwachung | **nein** | Keine Profilbildung, kein Tracking über Sites |
| Sensible Daten (Art. 9) | **nein** | Keine Gesundheits-/Biometrie-Daten |
| Großtechnische Verarbeitung | **nein** | Kleine Self-Hosted-Instanz |
| Neue Technologie mit hohem Risiko | **nein** | Standard-Webstack |
| **Ergebnis** | **Formelle DSFA derzeit nicht zwingend** | Bei Analytics-Erweiterung (Cookies, Cross-Site) neu bewerten |

Empfehlung: Kurze dokumentierte DSFA-Vorprüfung jährlich wiederholen.

## Nachweise und Artefakte

| Nachweis | Pfad |
|----------|------|
| Analytics-Implementierung | `packages/analytics/src/index.ts` |
| Middleware-Tracking | `apps/web/src/middleware.ts` |
| DB-Schema Analytics/M3U | `packages/db/src/schema.ts` |
| M3U-Upload-Logik | `apps/web/src/app/api/m3u/upload/route.ts` |
| Env-Konfiguration | `.env.example` (`ANALYTICS_ENABLED`) |
| Datenschutz-Hinweis UI | **Offener Punkt:** Keine dedizierte Privacy-Policy-Seite im Repo gefunden |

## Risiken und Kontrollen

| Risiko | Auswirkung | Eintrittswahrscheinlichkeit | Massnahme | Kontrolle | Nachweis |
|--------|------------|----------------------------|-----------|-----------|----------|
| Fehlende Privacy Policy | Transparenzmangel, Abmahnung | mittel | Datenschutzerklärung auf Website veröffentlichen | Legal-Review | **Offener Punkt** |
| M3U-Daten nach 30 Tagen nicht gelöscht | Speicherung über Zweck hinaus | mittel | Expiry-Cleanup-Job implementieren | Cron + DB-Query | `expiresAt` in Schema |
| IP als personenbezogen eingestuft | Auskunftspflichten | mittel | Dokumentierte Anonymisierung | Code-Review | `anonymizeIp()` |
| GitHub/Docker Hub US-Transfer | DSGVO-Kapitel-V-Risiko | niedrig | AVV/SCCs mit Anbietern | Vertragsprüfung | Anbieter-DPA |
| Admin-E-Mail in Logs | Unnötige PII | niedrig | Log-Redaction | Log-Review | Worker/Web Logs |

## Pflegeprozess

1. Bei neuen Features mit Datenerhebung VT-Eintrag ergänzen.
2. Jährliche Review der Speicherfristen und Löschjobs.
3. Betroffenenanfragen innerhalb von 30 Tagen bearbeiten (organisatorischer Prozess).
4. Privacy Policy synchron mit diesem Dokument halten.

## Revisionshistorie

| Datum | Autor/Rolle | Änderung | Anlass |
|-------|-------------|----------|--------|
| 2026-07-12 | Cursor Agent / Dokumentation | Erstversion | DSGVO-Analyse basierend auf Schema und Analytics-Code |
