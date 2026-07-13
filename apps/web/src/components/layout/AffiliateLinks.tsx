"use client";

import { Gift, Percent, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AMAZON_SUPPORT_URL,
  SHOOP_AFFILIATE_URL,
  TRADE_RE_AFFILIATE_URL,
} from "@/lib/site";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface AffiliateLinksProps {
  variant?: "primary" | "outline";
  size?: "sm" | "md";
  className?: string;
  stacked?: boolean;
}

const variants = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 shadow-sm",
  outline:
    "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
};

const sizes = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export function AffiliateLinks({
  variant = "outline",
  size = "sm",
  className,
  stacked = false,
}: AffiliateLinksProps) {
  const { t } = useI18n();

  const options = [
    {
      id: "amazon",
      url: AMAZON_SUPPORT_URL,
      label: t("donate.amazon"),
      Icon: Gift,
    },
    {
      id: "shoop",
      url: SHOOP_AFFILIATE_URL,
      label: t("donate.shoop"),
      Icon: Percent,
    },
    {
      id: "tradere",
      url: TRADE_RE_AFFILIATE_URL,
      label: t("donate.tradere"),
      Icon: TrendingUp,
    },
  ] as const;

  return (
    <div
      className={cn(
        stacked
          ? "grid grid-cols-1 xs:grid-cols-3 gap-2 w-full"
          : "inline-flex flex-wrap items-center gap-2",
        className
      )}
    >
      {options.map((option) => (
        <a
          key={option.id}
          href={option.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={option.label}
          className={cn(
            "inline-flex items-center justify-center rounded-lg font-medium transition-opacity duration-200 cursor-pointer min-h-[44px]",
            stacked && "w-full",
            variants[variant],
            sizes[size]
          )}
        >
          <option.Icon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{option.label}</span>
        </a>
      ))}
    </div>
  );
}
