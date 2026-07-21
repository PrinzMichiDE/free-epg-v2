"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { MessageKey } from "@/lib/i18n/messages";

export interface NavMoreItem {
  href: string;
  labelKey: MessageKey;
}

interface NavMoreMenuProps {
  items: NavMoreItem[];
}

export function NavMoreMenu({ items }: NavMoreMenuProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const active = items.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2 text-sm transition-colors border-b-2 -mb-px whitespace-nowrap",
          active
            ? "border-[var(--accent)] text-[var(--foreground)] font-medium"
            : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {t("header.moreNav")}
        <ChevronDown
          className={cn("h-3.5 w-3.5 opacity-60 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="menu"
          className={cn(
            "absolute z-50 left-0 top-full mt-1 min-w-[11rem]",
            "rounded-sm border border-[var(--border)] bg-[var(--card)] shadow-md py-1"
          )}
        >
          {items.map((item) => {
            const itemActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-3 py-2 text-sm transition-colors",
                    itemActive
                      ? "bg-[var(--surface-muted)] text-[var(--foreground)] font-medium"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                  )}
                  aria-current={itemActive ? "page" : undefined}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
