
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building, Palette, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 48 48"
    fill="currentColor"
    {...props}>
    <path d="M36.1,31.2C35.1,30.7,33,29.6,32,29.1s-1.8-0.8-2.6,0.8s-3.1,3.9-3.8,4.7s-1.3,0.9-2.5,0.3s-4.9-1.8-9.3-5.5 c-3.5-3-5.8-6.7-6.5-7.8s-0.7-1.7,0.1-2.7c0.7-0.8,1.5-2,2.3-3s1.1-1.6,1.7-2.8c0.6-1.2,0.3-2.3-0.4-3.2S11.5,8.9,10.9,7.8 C10.3,6.7,9.7,6.8,9.2,6.8s-1.8,0.2-2.7,1.2s-3.7,3.6-3.7,8.7s3.8,10.1,4.3,10.8s7.5,11.5,18.2,16.2c9.2,4,9.2,2.7,10.9,2.5 c1.7-0.2,5.3-2.2,6-4.3C38.1,33.5,38.1,32.4,37.6,31.9C37.1,31.3,36.6,31.5,36.1,31.2z"></path><path d="M24,4C13,4,4,13,4,24s9,20,20,20c11,0,20-9,20-20S35,4,24,4z M24,41.4c-9.6,0-17.4-7.8-17.4-17.4S14.4,6.6,24,6.6 c9.6,0,17.4,7.8,17.4,17.4C41.4,33.6,33.6,41.4,24,41.4z"></path>
  </svg>
);


const navLinks = [
  { href: "/properties", label: "Properties", icon: Building },
  { href: "/interiors", label: "Interiors", icon: Palette },
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
