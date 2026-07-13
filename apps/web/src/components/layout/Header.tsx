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
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { MessageKey } from "@/lib/i18n/messages";

const navItems: { href: string; labelKey: MessageKey }[] = [
  { href: "/countries", labelKey: "nav.countries" },
  { href: "/playlists", labelKey: "nav.playlists" },
  { href: "/player", labelKey: "nav.player" },
  { href: "/channels", labelKey: "nav.channels" },
  { href: "/m3u", labelKey: "nav.m3u" },
  { href: "/lists/new", labelKey: "nav.lists" },
  { href: "/docs", labelKey: "nav.docs" },
];

export function Header() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md">
      <div className="page-shell min-h-[var(--header-height)] h-auto sm:h-[var(--header-height)] flex items-center justify-between gap-2 sm:gap-4 py-2 sm:py-0">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-2.5 font-semibold text-[var(--foreground)] hover:opacity-90 transition-opacity shrink-0 min-w-0"
        >
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] shrink-0">
            <Radio className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-base sm:text-lg tracking-tight hidden xs:inline truncate">
            FreeEPG
          </span>
        </Link>

        <nav
          className="hidden xl:flex items-center gap-1 min-w-0"
          aria-label={t("header.mainNav")}
        >
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap",
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
        </nav>

        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          <DonateButton />
          <Link href="/countries">
            <Button variant="outline" size="sm">
              {t("header.browseFeeds")}
            </Button>
          </Link>
          <Link href="/docs/enigma2">
            <Button size="sm">{t("header.enigma2Setup")}</Button>
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
          className="xl:hidden border-t border-[var(--border)] bg-[var(--card)] px-3 sm:px-4 py-4 space-y-1 max-h-[min(80vh,32rem)] overflow-y-auto overscroll-contain"
          aria-label={t("header.mobileNav")}
        >
          {navItems.map((item) => {
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
            <Link href="/countries" onClick={() => setOpen(false)} className="block">
              <Button variant="outline" size="md" className="w-full">
                {t("header.browseFeeds")}
              </Button>
            </Link>
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
