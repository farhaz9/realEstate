"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Palette, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/interiors", label: "Designs", icon: Palette },
  { href: "/", label: "Home", icon: Home },
  { href: "/contact", label: "Contact", icon: Phone },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur-sm">
      <div className="flex h-full items-center justify-around">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors w-20",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                link.label === "Home" && "relative -top-3 bg-background rounded-full p-2 border-t-4 border-primary shadow-lg"
              )}
            >
              <div className={cn(
                "flex items-center justify-center h-12 w-12 rounded-full",
                isActive && link.label === "Home" ? "bg-primary text-primary-foreground" : ""
              )}>
                <link.icon className="h-6 w-6" />
              </div>
              <span className={cn(
                link.label === "Home" && "absolute -bottom-1"
              )}>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
