import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn("surface-card p-5 flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--muted-foreground)]">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--primary)]">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}
