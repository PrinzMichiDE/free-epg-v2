import Link from "next/link";
import { Github } from "lucide-react";
import { DonateButton } from "@/components/layout/DonateButton";
import { PAYPAL_DONATE_LABEL } from "@/lib/site";

const links = [
  { href: "/docs", label: "Dokumentation" },
  { href: "/docs/api", label: "API" },
  { href: "/docs/enigma2", label: "Enigma2 / Rytec" },
  { href: "/countries", label: "Länder-Feeds" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-auto">
      <div className="page-shell py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-semibold text-[var(--foreground)] mb-2">FreeEPG</p>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xs mb-4">
            Self-hosted EPG-Plattform für XMLTV und Rytec. Daten aus öffentlichen
            Quellen — ohne Garantie auf Vollständigkeit.
          </p>
          <DonateButton variant="outline" size="sm" showAmount />
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Freiwillige Spende ({PAYPAL_DONATE_LABEL}) für Betrieb und Weiterentwicklung.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
            Ressourcen
          </p>
          <ul className="space-y-2 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
            Quellen
          </p>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            <li>iptv-org (Metadaten)</li>
            <li>epg.pw / xmltv.se</li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
            Projekt
          </p>
          <a
            href="https://free-epg.de"
            className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-2 transition-colors"
          >
            free-epg.de
          </a>
          <a
            href="https://github.com/PrinzMichiDE/free-epg-v2"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-4 w-4" aria-hidden />
            GitHub
          </a>
        </div>
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="page-shell py-4 text-xs text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} FreeEPG · Open Source EPG Infrastructure
        </div>
      </div>
    </footer>
  );
}
