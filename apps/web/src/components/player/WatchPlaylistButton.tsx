"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface WatchPlaylistButtonProps {
  href: string;
  className?: string;
  size?: "sm" | "md";
}

export function WatchPlaylistButton({
  href,
  className,
  size = "md",
}: WatchPlaylistButtonProps) {
  const { t } = useI18n();

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium",
        "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity",
        size === "md" ? "h-10 px-4" : "h-9 px-3",
        className
      )}
    >
      <Play className="h-4 w-4" aria-hidden />
      {t("player.watch")}
    </Link>
  );
}
