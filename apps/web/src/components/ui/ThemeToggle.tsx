"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode, toggle } = useTheme();

  const isDark = mode === "dark" || (mode === "system" && getSystemTheme());

  const cycleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mode === "light") setMode("dark");
    else if (mode === "dark") setMode("system");
    else setMode("light");
  };

  return (
    <button
      type="button"
      onClick={cycleNext}
      className={cn(
        "inline-flex items-center justify-center h-9 min-w-[2.25rem] px-2",
        "rounded-sm border border-transparent text-[var(--muted-foreground)]",
        "hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
        "transition-colors duration-150",
        "xl:min-w-[2.75rem] xl:px-3",
        className
      )}
      aria-label={`Theme: ${themeLabel(mode)}`}
      title={themeLabel(mode)}
    >
      {mode === "light" && <Sun className="h-4 w-4" />}
      {mode === "dark" && <Moon className="h-4 w-4" />}
      {mode === "system" && <Monitor className="h-4 w-4" />}
    </button>
  );
}

function getSystemTheme(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function themeLabel(mode: string): string {
  switch (mode) {
    case "light":
      return "Light mode";
    case "dark":
      return "Dark mode";
    default:
      return "System theme";
  }
}
