"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Radio, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const nav = [
  { href: "/countries", label: "Länder" },
  { href: "/channels", label: "Sender" },
  { href: "/m3u", label: "M3U Matcher" },
  { href: "/lists/new", label: "Listen" },
  { href: "/docs", label: "Docs" },
  { href: "/admin", label: "Admin" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md">
      <div className="page-shell h-[var(--header-height)] flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-[var(--foreground)] hover:opacity-90 transition-opacity"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
            <Radio className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-lg tracking-tight">FreeEPG</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Hauptnavigation">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                  active
                    ? "bg-[var(--surface-muted)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link href="/countries">
            <Button variant="outline" size="sm">
              Feeds durchsuchen
            </Button>
          </Link>
          <Link href="/docs/enigma2">
            <Button size="sm">Enigma2 Setup</Button>
          </Link>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="lg:hidden border-t border-[var(--border)] bg-[var(--card)] px-4 py-4 space-y-1"
          aria-label="Mobile Navigation"
        >
          {nav.map((item) => {
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
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
