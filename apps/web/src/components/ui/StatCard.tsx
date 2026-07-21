import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
}

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div className={cn("py-4 sm:py-0 sm:px-6 first:pl-0 last:pr-0", className)}>
      <p className="text-xs text-[var(--muted-foreground)] mb-1">{label}</p>
      <p className="font-serif text-2xl sm:text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
