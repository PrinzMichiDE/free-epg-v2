import { Coffee, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { DONATE_OPTIONS } from "@/lib/site";

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

const icons = {
  paypal: Heart,
  kofi: Coffee,
} as const;

export function DonateButton({
  variant = "outline",
  size = "sm",
  className,
  showAmount = false,
}: DonateButtonProps) {
  return (
    <div className={cn("inline-flex flex-wrap items-center gap-2", className)}>
      {DONATE_OPTIONS.map((option) => {
        const Icon = icons[option.id];
        return (
          <a
            key={option.id}
            href={option.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={option.ariaLabel}
            className={cn(
              "inline-flex items-center justify-center rounded-lg font-medium transition-opacity duration-200 cursor-pointer",
              variants[variant],
              sizes[size]
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{option.label}</span>
            {showAmount && option.amountLabel && (
              <span className="text-[var(--muted-foreground)] font-normal">
                ({option.amountLabel})
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}
