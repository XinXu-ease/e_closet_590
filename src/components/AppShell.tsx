"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Grid2X2, Layers3, UserRound } from "lucide-react";

const navItems = [
  { href: "/closet", label: "Closet", icon: Grid2X2 },
  { href: "/create", label: "Create", icon: Layers3 },
  { href: "/outfits", label: "Saved", icon: Bookmark },
  { href: "/settings", label: "Me", icon: UserRound },
];

export function AppShell({ children, showNavigation = true }: { children: React.ReactNode; showNavigation?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="device-stage">
      <div className="phone-shell">
        <div className="status-bar" aria-hidden="true">
          <span>9:41</span>
          <span className="status-dots">● ● ▰</span>
        </div>
        <main className={showNavigation ? "app-content with-nav" : "app-content"}>{children}</main>
        {showNavigation && (
          <nav className="bottom-nav" aria-label="Primary navigation">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href === "/outfits" && pathname.startsWith("/outfits/"));
              return (
                <Link className={active ? "nav-item active" : "nav-item"} href={href} key={href}>
                  <Icon size={20} strokeWidth={1.8} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
