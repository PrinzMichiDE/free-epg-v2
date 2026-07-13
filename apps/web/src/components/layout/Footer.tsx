"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import { DonateButton } from "@/components/layout/DonateButton";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { MessageKey } from "@/lib/i18n/messages";

const footerLinks: { href: string; labelKey: MessageKey }[] = [
  { href: "/docs", labelKey: "footer.docs" },
  { href: "/docs/api", labelKey: "footer.api" },
  { href: "/docs/enigma2", labelKey: "footer.enigma2" },
  { href: "/countries", labelKey: "footer.countryFeeds" },
];

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-auto">
      <div className="page-shell py-8 sm:py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-semibold text-[var(--foreground)] mb-2">FreeEPG</p>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xs mb-4">
            {t("footer.tagline")}
          </p>
          <DonateButton variant="outline" size="sm" showAmount stacked className="max-w-full" />
          <p className="text-xs text-[var(--muted-foreground)] mt-2">{t("donate.hint")}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
            {t("footer.resources")}
          </p>
          <ul className="space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
            {t("footer.project")}
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
          © {new Date().getFullYear()} FreeEPG · {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
