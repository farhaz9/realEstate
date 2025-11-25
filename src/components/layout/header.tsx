
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import {
  Home,
  Building,
  Palette,
  Users,
  Briefcase,
  Mail,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { useUser } from "@/firebase";
import { UserNav } from "@/components/auth/user-nav";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/properties", label: "Properties", icon: Building },
  { href: "/interiors", label: "Interiors", icon: Palette },
  { href: "/professionals", label: "Professionals", icon: Users },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/contact", label: "Contact", icon: Mail },
];

const TwoStripesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="3" y1="8" x2="21" y2="8" />
    <line x1="3" y1="16" x2="21" y2="16" />
  </svg>
);


export default function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, isUserLoading } = useUser();

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm md:px-6">
      <Logo />
      <nav className="hidden items-center gap-1 text-sm font-medium md:flex bg-muted/50 p-1 rounded-full border">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-4 py-1.5 rounded-full transition-colors text-muted-foreground hover:text-foreground",
              pathname === link.href
                ? "bg-background text-foreground font-semibold shadow-sm"
                : ""
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex">
          {isUserLoading ? (
            <Skeleton className="h-10 w-24 rounded-md" />
          ) : user ? (
            <UserNav />
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
         <div className="flex items-center gap-2 md:hidden">
          {isUserLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <UserNav />
          ) : (
             <Button asChild size="sm" variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="default" size="icon" className="md:hidden rounded-full">
              <TwoStripesIcon className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col">
            <SheetHeader>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Logo />
              <SheetDescription>
                 Navigate through our exclusive real estate and design services.
              </SheetDescription>
            </SheetHeader>
            <Separator />
            <nav className="mt-4 grid gap-2 flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsSheetOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-lg font-medium text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary",
                    pathname === link.href && "bg-primary/10 text-primary font-semibold"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
            </nav>
            <SheetFooter>
              <div className="flex flex-col items-center w-full gap-4 pt-4 border-t">
                <div className="flex space-x-4">
                  <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                  <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                  <Link href="#" className="text-muted-foreground hover:text-primary"><Github className="h-5 w-5" /></Link>
                </div>
                <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Farhaz Homes</p>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
