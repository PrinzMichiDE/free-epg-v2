import { hasFlag } from "country-flag-icons";
import * as FlagComponents from "country-flag-icons/react/3x2";
import { cn } from "@/lib/utils";
import { getCountryName } from "@/lib/countries";

const sizeClasses = {
  sm: "h-5 w-[1.67rem]",
  md: "h-9 w-12",
  lg: "h-12 w-16",
} as const;

interface CountryFlagProps {
  code: string;
  className?: string;
  size?: keyof typeof sizeClasses;
  showLabel?: boolean;
}

export function CountryFlag({
  code,
  className,
  size = "md",
  showLabel = false,
}: CountryFlagProps) {
  const cc = code.toUpperCase();
  const name = getCountryName(cc);
  const sizeClass = sizeClasses[size];

  const fallback = (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md bg-[var(--surface-muted)] font-mono text-xs font-semibold text-[var(--primary)]",
        sizeClass,
        className
      )}
      role="img"
      aria-label={name}
    >
      {cc}
    </span>
  );

  if (!hasFlag(cc)) {
    return showLabel ? (
      <span className="inline-flex items-center gap-2">
        {fallback}
        <span>{name}</span>
      </span>
    ) : (
      fallback
    );
  }

  const Flag = FlagComponents[cc as keyof typeof FlagComponents];

  const flagEl = (
    <Flag
      className={cn(
        "inline-block shrink-0 rounded-md object-cover border border-[var(--border)] shadow-sm",
        sizeClass,
        className
      )}
      role="img"
      aria-label={name}
    />
  );

  if (!showLabel) return flagEl;

  return (
    <span className="inline-flex items-center gap-2.5 min-w-0">
      {flagEl}
      <span className="truncate">{name}</span>
    </span>
  );
}
