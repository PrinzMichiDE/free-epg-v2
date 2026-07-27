export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true, title: "Dashboard" },
  { href: "/admin/health", label: "Health", title: "System Health" },
  { href: "/admin/analytics", label: "Analytics", title: "Analytics" },
  { href: "/admin/jobs", label: "Jobs", title: "Job-Historie" },
  { href: "/admin/audit", label: "Audit", title: "Audit-Log" },
] as const;

export function adminTitleForPath(pathname: string): string {
  const match = ADMIN_NAV_ITEMS.find((link) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href)
  );
  return match?.title ?? "Operations";
}
