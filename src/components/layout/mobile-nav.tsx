
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Armchair, Heart, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/interiors", label: "Design", icon: Armchair },
    { href: "/profile?tab=wishlist", label: "Saved", icon: Heart },
    { href: "/contact", label: "Chat", icon: MessageSquare },
    { href: "/profile", label: "Profile", icon: User },
  ];
  
  // A simple check for the base path without query params
  const isInteriorsActive = pathname === '/interiors';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur-sm">
      <div className="grid h-full grid-cols-5 items-center">
        {navLinks.map((link) => {
          if (!link) return null;
          
          // Custom logic for active state to handle the "Design" tab specifically
          const isActive = link.href === '/interiors' ? isInteriorsActive : pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <link.icon className={cn("h-6 w-6")} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
