import Link from "next/link";

const nav = [
  { href: "/countries", label: "Länder" },
  { href: "/channels", label: "Sender" },
  { href: "/m3u", label: "M3U Matcher" },
  { href: "/lists/new", label: "Listen" },
  { href: "/docs", label: "Docs" },
  { href: "/admin", label: "Admin" },
];

export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-[var(--primary)]">
          FreeEPG
        </Link>
        <nav className="hidden md:flex gap-6 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
