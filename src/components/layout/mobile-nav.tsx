"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Palette, MessageCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      d="M12.04 2C6.58 2 2.15 6.44 2.15 11.9c0 1.74.45 3.38 1.25 4.81L2 22l5.44-1.42c1.39.75 2.99 1.18 4.6 1.18h.01c5.46 0 9.89-4.44 9.89-9.89S17.5 2 12.04 2m.01 1.67c4.55 0 8.23 3.68 8.23 8.23s-3.68 8.23-8.23 8.23h-.01c-1.46 0-2.86-.38-4.1-1.05L5.1 20.9l1.6-2.94c-.75-1.32-1.18-2.83-1.18-4.41.01-4.55 3.69-8.23 8.24-8.23m4.49 11.16c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2s-1.4-1.85-1.57-2.15-.03-.28.09-.39c.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42s-.54-1.3-.74-1.78c-.2-.48-.4-.42-.54-.42h-.47c-.16 0-.42.06-.64.3s-.89.87-.89 2.12.91 2.46 1.04 2.64c.12.18 1.77 2.7 4.29 3.78 2.52 1.08 2.52.72 2.97.69.45-.03 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"
    ></path>
  </svg>
);


const navLinks = [
  { href: "/interiors", label: "Interiors", icon: Palette },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/", label: "Home", icon: Home },
  { href: "https://wa.me/910000000000", label: "WhatsApp", icon: WhatsAppIcon, target:"_blank", className: "animate-blink" },
  { href: "/contact", label: "Contact", icon: MessageCircle, target:"_self" },
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
              target={link.target || "_self"}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                link.className
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