"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sections = [
  { href: "/docs", title: "Übersicht" },
  { href: "/docs/xmltv", title: "XMLTV Format" },
  { href: "/docs/m3u", title: "M3U + tvg-id" },
  { href: "/docs/kodi", title: "Kodi Integration" },
  { href: "/docs/enigma2", title: "Enigma2 / Rytec" },
  { href: "/docs/api", title: "API Referenz" },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell py-10 sm:py-14 flex flex-col lg:flex-row gap-10 lg:gap-14">
      <aside className="lg:w-56 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-4">
          Dokumentation
        </p>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0" aria-label="Docs Navigation">
          {sections.map((s) => (
            <DocsNavLink key={s.href} href={s.href}>
              {s.title}
            </DocsNavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0 prose-docs">{children}</div>
    </div>
  );
}

function DocsNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "whitespace-nowrap lg:whitespace-normal px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
        active
          ? "bg-[var(--surface-muted)] text-[var(--foreground)]"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
