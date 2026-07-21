import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-[var(--surface-muted)] text-[var(--foreground)]",
  success: "bg-[var(--success-muted)] text-[var(--success)]",
  warning: "bg-[var(--warning-muted)] text-[var(--warning)]",
  muted: "bg-transparent text-[var(--muted-foreground)] border border-[var(--border)]",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide tabular-nums",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
