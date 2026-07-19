"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Radio, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md">
      <div className="page-shell min-h-[var(--header-height)] grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3 xl:gap-4 py-2 xl:py-0">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-[var(--foreground)] hover:opacity-90 transition-opacity shrink-0 min-w-0"
        >
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] shrink-0">
            <Radio className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-base sm:text-lg tracking-tight hidden xs:inline truncate">
            FreeEPG
          </span>
        </Link>

        <nav
          className="hidden xl:flex items-center justify-center gap-0.5 min-w-0"
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
                  "px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap shrink-0",
                  active
                    ? "bg-[var(--surface-muted)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                )}
                aria-current={active ? "page" : undefined}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
          <NavMoreMenu items={secondaryNav} />
        </nav>

        <div className="hidden xl:flex items-center justify-end gap-2 shrink-0">
          <LanguageSwitcher compact />
          <Link href="/docs/enigma2">
            <Button size="sm" className="whitespace-nowrap">
              <span className="hidden 2xl:inline">{t("header.enigma2Setup")}</span>
              <span className="2xl:hidden">{t("header.enigma2Short")}</span>
            </Button>
          </Link>
        </div>

        <div className="flex xl:hidden items-center justify-end gap-1 shrink-0">
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
          className="xl:hidden border-t border-[var(--border)] bg-[var(--card)] px-3 sm:px-4 py-4 space-y-1 max-h-[min(80vh,32rem)] overflow-y-auto overscroll-contain"
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
                  "block px-3 py-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center",
                  active
                    ? "bg-[var(--surface-muted)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
          <div className="pt-3 mt-2 border-t border-[var(--border)] space-y-3">
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
