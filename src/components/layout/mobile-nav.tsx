
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building, Palette, MessageCircle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/properties", label: "Properties", icon: Building },
  { href: "/interiors", label: "Interiors", icon: Palette },
  { href: "/", label: "Home", icon: Home },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/contact", label: "Contact", icon: MessageCircle },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur-sm">
      <div className="grid h-full grid-cols-5 items-center">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <link.icon className={cn("h-6 w-6", link.className)} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
