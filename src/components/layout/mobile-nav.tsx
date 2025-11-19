
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building, Palette, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}>
    <path d="M16.75 13.96c.25.13.43.2.5.25.13.06.14.38-.06.75-.18.35-.9.85-1.18.91-.4.1-.75.15-1.13.06-.5-.13-1.03-.3-1.53-.56-.95-.5-1.76-1.18-2.48-1.9-1.1-1.08-1.88-2.4-2-2.73-.06-.13-.06-.25,0-.38.06-.13.3-.38.44-.5.18-.18.3-.3.44-.5.18-.25.28-.5.18-.75-.1-.25-.5-.13-.63-.13-.13 0-1.03.06-1.18.06-.14 0-.3.06-.44.06-.18 0-.35.06-.5.18-.18.13-.3.2-.44.3-.18.13-.3.25-.38.38-.06.13-.13.25-.13.37-.03.25-.03.5 0 .75.02.25.06.5.12.75.1.25.2.5.3.75.25.5.56 1 .9 1.5.03.05.06.1.09.15.4.56.85 1.08 1.38 1.5.75.56 1.56 1.06 2.44 1.44.9.38 1.8.56 2.75.56.25 0 .5-.03.75-.06.25-.03.5-.06.75-.13.5-.13.98-.31 1.44-.56.5-.25.9-.56 1.25-.9.25-.25.44-.5.56-.75.13-.25.2-.5.25-.75.03-.25.03-.5.03-.75s-.03-.5-.06-.75c-.03-.25-.06-.5-.13-.75-.06-.13-.13-.25-.2-.3l-.08-.1zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"></path>
  </svg>
);


const navLinks = [
  { href: "/properties", label: "Properties", icon: Building },
  { href: "/interiors", label: "Interiors", icon: Palette },
  { href: "/", label: "Home", icon: Home },
  { href: "https://wa.me/910000000000", label: "WhatsApp", icon: WhatsAppIcon, target: "_blank", className: "text-green-500 hover:text-green-600" },
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

