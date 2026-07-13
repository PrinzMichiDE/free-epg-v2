"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALES, type LocaleCode } from "@/lib/i18n/locales";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale)!;

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
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-sm font-medium",
          "border border-[var(--border)] bg-transparent text-[var(--foreground)]",
          "hover:bg-[var(--surface-muted)] transition-colors"
        )}
        aria-label={t("lang.select")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
        <span className="max-w-[5.5rem] truncate hidden sm:inline">
          {current.nativeName}
        </span>
        <span className="sm:hidden uppercase text-xs font-semibold">{locale}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 opacity-60 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("lang.label")}
          className={cn(
            "absolute z-50 max-h-72 overflow-y-auto overscroll-contain",
            "rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-md py-1",
            "right-0 top-full mt-1 w-[min(100vw-1.5rem,14rem)] sm:min-w-[11rem]"
          )}
        >
          {LOCALES.map((item) => (
            <li key={item.code} role="option" aria-selected={item.code === locale}>
              <button
                type="button"
                onClick={() => {
                  setLocale(item.code as LocaleCode);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm transition-colors",
                  item.code === locale
                    ? "bg-[var(--surface-muted)] text-[var(--foreground)] font-medium"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                )}
              >
                <span className="font-medium">{item.nativeName}</span>
                <span className="ml-2 text-xs uppercase opacity-50">{item.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
