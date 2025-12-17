
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Building, Mail, Armchair, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/properties", label: "Properties", icon: Building },
    { href: "/interiors", label: "Interiors", icon: Armchair },
    { href: "/", label: "Home", icon: Home },
    { href: "/professionals", label: "Pro's", icon: Briefcase },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-sm">
      <div className="grid h-full grid-cols-5 items-center">
        {navLinks.map((link) => {
          const isActive =
            link.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(link.href.split("?")[0]);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <link.icon
                className={cn("h-6 w-6")}
              />
              <span className={cn(isActive && "font-bold")}>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
