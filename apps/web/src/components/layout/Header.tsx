"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DonateButton } from "@/components/layout/DonateButton";
import { AffiliateLinks } from "@/components/layout/AffiliateLinks";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { NavMoreMenu } from "@/components/layout/NavMoreMenu";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { MessageKey } from "@/lib/i18n/messages";

const primaryNav: { href: string; labelKey: MessageKey }[] = [
  { href: "/countries", labelKey: "nav.countries" },
  { href: "/playlists", labelKey: "nav.playlists" },
  { href: "/player", labelKey: "nav.player" },
  { href: "/channels", labelKey: "nav.channels" },
];

const secondaryNav: { href: string; labelKey: MessageKey }[] = [
  { href: "/programmes", labelKey: "nav.programmes" },
  { href: "/m3u", labelKey: "nav.m3u" },
  { href: "/lists/new", labelKey: "nav.lists" },
  { href: "/docs", labelKey: "nav.docs" },
];

const allNavItems = [...primaryNav, ...secondaryNav];

export function Header() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="page-shell min-h-[var(--header-height)] flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 text-[var(--foreground)] hover:opacity-80 transition-opacity"
        >
          <span
            className="h-2 w-2 rounded-full bg-[var(--accent)] shrink-0"
            aria-hidden
          />
          <span className="font-serif text-lg sm:text-xl font-semibold tracking-tight">
            FreeEPG
          </span>
        </Link>

        <nav
          className="hidden xl:flex items-center gap-1 min-w-0"
          aria-label={t("header.mainNav")}
        >
          {primaryNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm transition-colors border-b-2 -mb-px",
                  active
                    ? "border-[var(--accent)] text-[var(--foreground)] font-medium"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                aria-current={active ? "page" : undefined}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
          <NavMoreMenu items={secondaryNav} />
        </nav>

        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <LanguageSwitcher compact />
          <Link href="/docs/enigma2">
            <Button size="sm" variant="outline" className="whitespace-nowrap">
              <span className="hidden 2xl:inline">{t("header.enigma2Setup")}</span>
              <span className="2xl:hidden">{t("header.enigma2Short")}</span>
            </Button>
          </Link>
        </div>

        <div className="flex xl:hidden items-center gap-1 shrink-0">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[44px] min-w-[44px]"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("header.closeMenu") : t("header.openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="xl:hidden border-t border-[var(--border)] bg-[var(--background)] px-4 py-3 space-y-0.5 max-h-[min(80vh,32rem)] overflow-y-auto overscroll-contain"
          aria-label={t("header.mobileNav")}
        >
          {allNavItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-2 py-3 text-sm min-h-[44px] flex items-center border-l-2",
                  active
                    ? "border-[var(--accent)] text-[var(--foreground)] font-medium pl-3"
                    : "border-transparent text-[var(--muted-foreground)]"
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
          <div className="pt-4 mt-2 border-t border-[var(--border)] space-y-3">
            <DonateButton variant="outline" size="md" className="w-full" showAmount stacked />
            <AffiliateLinks variant="outline" size="md" className="w-full" stacked />
            <Link href="/docs/enigma2" onClick={() => setOpen(false)} className="block">
              <Button size="md" className="w-full">
                {t("header.enigma2Setup")}
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
