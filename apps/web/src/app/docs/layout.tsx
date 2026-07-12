import Link from "next/link";

const sections = [
  { href: "/docs", title: "Übersicht" },
  { href: "/docs/xmltv", title: "XMLTV Format" },
  { href: "/docs/m3u", title: "M3U + tvg-id" },
  { href: "/docs/kodi", title: "Kodi Integration" },
  { href: "/docs/api", title: "API Referenz" },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex gap-8">
      <aside className="w-48 shrink-0">
        <nav className="space-y-2 sticky top-24">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              {s.title}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 prose prose-slate dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
}
