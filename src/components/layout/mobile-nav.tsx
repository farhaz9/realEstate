
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, User, Plus, Armchair } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function MobileNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/profile?tab=wishlist", label: "Saved", icon: Heart },
    { href: "/interiors", label: "Interiors", icon: Armchair },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16">
      <div className="relative h-full bg-background/95 backdrop-blur-sm border-t">
        <div className="grid h-full grid-cols-5 items-center">
          {navLinks.slice(0, 2).map((link) => {
            const isActive =
              (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.split("?")[0])) &&
              (link.href.includes("?") ? pathname.includes(link.href.split("?")[1]) : true);
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
                  className={cn("h-6 w-6", isActive ? 'fill-current' : 'fill-muted-foreground/50')}
                  strokeWidth={0}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
          
          <div /> 

          {navLinks.slice(2).map((link) => {
            const isActive = pathname.startsWith(link.href.split("?")[0]);
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
                  className={cn("h-6 w-6", isActive ? 'fill-current' : 'fill-muted-foreground/50')}
                  strokeWidth={0}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <Button asChild className="rounded-full w-16 h-16 shadow-lg" size="icon">
                 <Link href="/profile?tab=listings">
                    <Plus className="w-8 h-8" />
                    <span className="sr-only">Add Listing</span>
                 </Link>
            </Button>
        </div>
      </div>
    </nav>
  );
}
