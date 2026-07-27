"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ADMIN_NAV_ITEMS, adminTitleForPath } from "@/lib/admin-nav";

export function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title = adminTitleForPath(pathname);

  if (pathname === "/admin/login" || !session) {
    return null;
  }

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">FreeEPG Admin</p>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <nav aria-label="Admin-Navigation" className="flex flex-wrap items-center gap-3 text-sm">
          {ADMIN_NAV_ITEMS.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "font-medium text-[var(--primary)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/admin/login" })}
            className="ml-2 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--background)]"
          >
            Abmelden
          </button>
        </nav>
      </div>
    </header>
  );
}
