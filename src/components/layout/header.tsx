"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/builders", label: "Builders" },
  { href: "/interiors", label: "Interiors" },
  { href: "/recommendations", label: "AI Finder" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between bg-background/80 px-4 shadow-sm backdrop-blur-md md:px-6">
      <Logo />
      <nav className="flex items-center gap-6 text-sm font-medium">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-muted-foreground transition-colors hover:text-foreground",
              pathname === link.href && "text-primary font-semibold"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
