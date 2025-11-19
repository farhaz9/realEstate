"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Palette, MessageCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/interiors", label: "Interiors", icon: Palette },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/", label: "Home", icon: Home },
  { href: "https://wa.me/910000000000", label: "WhatsApp", icon: MessageCircle, target:"_blank" },
  { href: "/contact", label: "Contact", icon: MessageCircle, target:"_self" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur-sm">
      <div className="grid grid-cols-5 h-full items-center">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              target={link.target || "_self"}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <link.icon className="h-6 w-6" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
