"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { MessageKey } from "@/lib/i18n/messages";
import type { ReactNode } from "react";

const footerLinks: { href: string; labelKey: MessageKey }[] = [
  { href: "/docs", labelKey: "footer.docs" },
  { href: "/docs/api", labelKey: "footer.api" },
  { href: "/docs/enigma2", labelKey: "footer.enigma2" },
  { href: "/countries", labelKey: "footer.countryFeeds" },
];

export function Footer({ versionSlot }: { versionSlot: ReactNode }) {
  const { t } = useI18n();

  return (
    <footer className="border-t border-[var(--border)] mt-auto">
      <div className="page-shell py-10 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-serif text-lg font-semibold mb-2">FreeEPG</p>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-sm">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--foreground)] mb-3">
              {t("footer.resources")}
            </p>
            <ul className="space-y-2 text-sm">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--foreground)] mb-3">
              {t("footer.project")}
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://free-epg.de"
                  className="text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
                >
                  free-epg.de
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/PrinzMichiDE/free-epg-v2"
                  className="text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="page-shell py-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-[var(--muted-foreground)] font-mono">
          <p>
            © {new Date().getFullYear()} FreeEPG · {t("footer.copyright")}
          </p>
          {versionSlot}
        </div>
      </div>
    </footer>
  );
}
