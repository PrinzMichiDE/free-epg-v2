export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-[var(--muted)]">
        <p>
          FreeEPG — Weltweites EPG als XMLTV ·{" "}
          <a href="https://free-epg.de" className="hover:underline">
            free-epg.de
          </a>
        </p>
        <p className="mt-2">
          Daten aus öffentlichen Quellen (iptv-org, epg.pw, xmltv.se). Keine Garantie auf Vollständigkeit.
        </p>
      </div>
    </footer>
  );
}
