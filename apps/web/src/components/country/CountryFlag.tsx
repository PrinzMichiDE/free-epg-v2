"use client";

import AU from "country-flag-icons/react/3x2/AU";
import BR from "country-flag-icons/react/3x2/BR";
import CA from "country-flag-icons/react/3x2/CA";
import CN from "country-flag-icons/react/3x2/CN";
import DE from "country-flag-icons/react/3x2/DE";
import FR from "country-flag-icons/react/3x2/FR";
import GB from "country-flag-icons/react/3x2/GB";
import HK from "country-flag-icons/react/3x2/HK";
import ID from "country-flag-icons/react/3x2/ID";
import IN from "country-flag-icons/react/3x2/IN";
import JP from "country-flag-icons/react/3x2/JP";
import MY from "country-flag-icons/react/3x2/MY";
import NZ from "country-flag-icons/react/3x2/NZ";
import PH from "country-flag-icons/react/3x2/PH";
import RU from "country-flag-icons/react/3x2/RU";
import SG from "country-flag-icons/react/3x2/SG";
import TW from "country-flag-icons/react/3x2/TW";
import US from "country-flag-icons/react/3x2/US";
import VN from "country-flag-icons/react/3x2/VN";
import ZA from "country-flag-icons/react/3x2/ZA";
import { cn } from "@/lib/utils";
import { getCountryName } from "@/lib/countries";

const FLAGS = {
  AU,
  BR,
  CA,
  CN,
  DE,
  FR,
  GB,
  HK,
  ID,
  IN,
  JP,
  MY,
  NZ,
  PH,
  RU,
  SG,
  TW,
  US,
  VN,
  ZA,
} as const;

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
  const Flag = FLAGS[cc as keyof typeof FLAGS];

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

  const flagEl = Flag ? (
    <Flag
      title={name}
      className={cn(
        "inline-block shrink-0 rounded-md object-cover border border-[var(--border)] shadow-sm",
        sizeClass,
        className
      )}
      role="img"
      aria-label={name}
    />
  ) : (
    fallback
  );

  if (!showLabel) return flagEl;

  return (
    <span className="inline-flex items-center gap-2.5 min-w-0">
      {flagEl}
      <span className="truncate">{name}</span>
    </span>
  );
}
