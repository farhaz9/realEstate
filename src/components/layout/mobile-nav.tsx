"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Palette, MessageCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 512 512"
    fill="currentColor"
    {...props}>
    <path d="M414.73 97.1A222.14 222.14 0 00256.94 34C133.32 34 35.15 132.16 35.15 255.79c0 40.45 10.88 78.58 30.88 112.33L32 480l115.39-30.29a220.61 220.61 0 00108.62 27.58h.91c123.63 0 222.79-98.17 222.79-221.8S380.57 97.1 256.94 97.1zM256.94 443.13h-.72a185.73 185.73 0 01-91-24.58l-6.52-3.83-67.59 17.61 17.93-65.8-4.2-6.86a185.34 185.34 0 01-28.32-95.27C76.45 152.12 158.22 70 257.13 70c48.67 0 94.49 19 129.17 53.68s53.68 80.5 53.68 129.17c-.01 98.9-81.87 180.28-183.04 180.28z"></path>
    <path d="M352.88 309c-4.8-2.39-28.32-13.9-32.69-15.54s-7.56-2.39-10.74.8c-3.18 3.18-12.35 15.54-15.14 18.72-2.8 3.18-5.6 3.58-10.4 1.19s-20.66-7.56-39.33-24.28-29.89-35.84-33.07-41.83-2.39-9 .8-11.58c2.8-2.39 5.6-6 8.39-8.79s3.58-5.19 5.19-8.79.4-6.78-1.2-11.58-10.74-25.86-14.72-35.44-7.96-7.97-10.74-8.39-5.99-.4-9.17-.4-7.56 1.19-11.58 5.99-15.54 15.14-15.54 36.63S160 259s15.94 37 18.33 39.8c2.4 2.8 31.57 48.24 76.54 67.42 10.4 4.39 19 6.78 25.86 8.79 12.35 3.58 23.49 3 32.28-1.59 10-5.2 28.32-23.09 32.28-31.47 4-8.39 4-15.54 2.8-18.72s-4.39-3.58-9.17-5.98z"></path>
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
          const isActive = pathname === link.href && link.href !== "/";
          if (link.href === "/") {
            return (
               <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center text-xs font-medium w-16 h-16 rounded-full p-2 border-t-4 shadow-lg transition-all duration-300",
                  pathname === "/" 
                    ? "text-primary border-primary -translate-y-3 bg-background" 
                    : "text-muted-foreground border-transparent -translate-y-2 bg-background/80 hover:text-primary"
                )}
              >
                <link.icon className="h-6 w-6" />
                <span>{link.label}</span>
              </Link>
            )
          }

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
