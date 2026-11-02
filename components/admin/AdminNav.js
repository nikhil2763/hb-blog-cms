"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "▦", match: (p) => p === "/admin" || p.startsWith("/admin/edit") },
  { href: "/admin/new", label: "New blog", icon: "+", match: (p) => p === "/admin/new" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="side-nav" aria-label="CMS">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={`side-link${l.match(pathname) ? " is-current" : ""}`} aria-current={l.match(pathname) ? "page" : undefined}>
          <span className="side-icon" aria-hidden="true">{l.icon}</span>
          {l.label}
        </Link>
      ))}
      <a href="/blog" target="_blank" rel="noopener noreferrer" className="side-link">
        <span className="side-icon" aria-hidden="true">↗</span>
        View site
      </a>
    </nav>
  );
}
