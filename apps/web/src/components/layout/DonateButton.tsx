"use client";

import { Coffee, Gift, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAYPAL_DONATE_URL, KOFI_DONATE_URL, AMAZON_SUPPORT_URL } from "@/lib/site";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface DonateButtonProps {
  variant?: "primary" | "outline";
  size?: "sm" | "md";
  className?: string;
  showAmount?: boolean;
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

export function DonateButton({
  variant = "outline",
  size = "sm",
  className,
  showAmount = false,
}: DonateButtonProps) {
  const { t } = useI18n();

  const options = [
    {
      id: "paypal",
      url: PAYPAL_DONATE_URL,
      label: t("donate.paypal"),
      amountLabel: showAmount ? "5 €" : null,
      Icon: Heart,
    },
    {
      id: "kofi",
      url: KOFI_DONATE_URL,
      label: t("donate.kofi"),
      amountLabel: null,
      Icon: Coffee,
    },
    {
      id: "amazon",
      url: AMAZON_SUPPORT_URL,
      label: t("donate.amazon"),
      amountLabel: null,
      Icon: Gift,
    },
  ] as const;

  return (
    <div className={cn("inline-flex flex-wrap items-center gap-2", className)}>
      {options.map((option) => (
        <a
          key={option.id}
          href={option.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={option.label}
          className={cn(
            "inline-flex items-center justify-center rounded-lg font-medium transition-opacity duration-200 cursor-pointer",
            variants[variant],
            sizes[size]
          )}
        >
          <option.Icon className="h-4 w-4 shrink-0" aria-hidden />
          <span>{option.label}</span>
          {option.amountLabel && (
            <span className="text-[var(--muted-foreground)] font-normal">
              ({option.amountLabel})
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
