import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAYPAL_DONATE_LABEL, PAYPAL_DONATE_URL } from "@/lib/site";

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
  return (
    <a
      href={PAYPAL_DONATE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Spenden — ${PAYPAL_DONATE_LABEL}`}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-opacity duration-200 cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
    >
      <Heart className="h-4 w-4 shrink-0" aria-hidden />
      <span>Spenden</span>
      {showAmount && (
        <span className="text-[var(--muted-foreground)] font-normal">
          ({PAYPAL_DONATE_LABEL})
        </span>
      )}
    </a>
  );
}
