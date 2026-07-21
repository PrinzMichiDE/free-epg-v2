import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] border border-[var(--primary)]",
  secondary:
    "bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--border)] border border-transparent",
  ghost:
    "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] border border-transparent",
  outline:
    "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:border-[var(--foreground)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-10 px-5 text-sm gap-2",
};

export function buttonStyles(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
) {
  return cn(
    "inline-flex items-center justify-center rounded-sm font-medium transition-colors duration-150 cursor-pointer no-underline",
    variants[variant],
    sizes[size],
    className
  );
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  external?: boolean;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  external,
  download,
  children,
  ...props
}: ButtonLinkProps) {
  const classes = buttonStyles(variant, size, className);
  const useNativeAnchor =
    download !== undefined ||
    external ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("/api/");

  if (useNativeAnchor) {
    return (
      <a
        href={href}
        className={classes}
        target={external || href.startsWith("/api/") ? "_blank" : undefined}
        rel={external || href.startsWith("/api/") ? "noopener noreferrer" : undefined}
        download={download}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
