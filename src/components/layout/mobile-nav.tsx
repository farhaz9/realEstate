"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Palette, MessageCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/interiors", label: "Interiors", icon: Palette },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/", label: "Home", icon: Home },
  { href: "/contact", label: "Contact", icon: MessageCircle, target:"_self" },
  { href: "https://wa.me/910000000000", label: "WhatsApp", icon: MessageCircle, target:"_blank" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur-sm">
      <div className="flex h-full items-center justify-around">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const isHome = link.label === "Home";
          return (
            <Link
              key={link.href}
              href={link.href}
              target={link.target}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors w-16 relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className={cn(
                "flex items-center justify-center h-12 w-12 rounded-full",
                 isHome && isActive ? "bg-primary text-primary-foreground -translate-y-3 shadow-lg border-2 border-background" : ""
              )}>
                <link.icon className="h-6 w-6" />
              </div>
              <span className={cn(
                isHome ? "absolute -bottom-0.5" : ""
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
