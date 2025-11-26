
"use client";

import { useState }from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "../ui/sheet";
import {
  Github,
  Twitter,
  Linkedin,
  X,
  LogIn,
} from "lucide-react";
import { useUser } from "@/firebase";
import { UserNav } from "@/components/auth/user-nav";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import { useOnScroll } from "@/hooks/use-on-scroll";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/interiors", label: "Interiors" },
  { href: "/professionals", label: "Professionals" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
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
  const { isScrollingUp } = useOnScroll();

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
       isScrollingUp ? "translate-y-0" : "-translate-y-full",
    )}>
      <div className="container p-2">
        <div className={cn(
          "h-14 items-center rounded-full p-2 md:px-4",
          "bg-background shadow-md",
          "grid grid-cols-3"
        )}>
          <div className="flex items-center gap-2">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="default" size="icon" className="rounded-full md:hidden">
                    <TwoStripesIcon className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                   <SheetHeader className="sr-only">
                    <SheetTitle>Mobile Menu</SheetTitle>
                    <SheetDescription>Site navigation</SheetDescription>
                  </SheetHeader>
                  
                    <Button variant="default" size="icon" className="md:hidden rounded-full absolute top-3 right-3" onClick={() => setIsSheetOpen(false)}>
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close navigation menu</span>
                    </Button>
                  
                  <div className="flex flex-col h-full">
                    <div className="flex justify-center mt-12">
                      <Logo />
                    </div>
                    <Separator />
                    <nav className="mt-4 flex-1 flex flex-col items-center justify-center">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsSheetOpen(false)}
                          className={cn(
                            "uppercase rounded-lg px-3 py-3 text-4xl font-medium text-muted-foreground transition-all hover:text-primary"
                          )}
                        >
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
                  </div>
                </SheetContent>
              </Sheet>
               <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
                {navLinks.slice(1,3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-1.5 rounded-full transition-colors",
                      "text-muted-foreground hover:text-foreground",
                      pathname === link.href
                        ? "bg-primary/10 text-primary font-semibold"
                        : ""
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
          </div>
          <div className="flex justify-center">
             <Logo />
          </div>
          <div className="flex items-center gap-2 justify-end">
             <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
                {navLinks.slice(3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-1.5 rounded-full transition-colors",
                      "text-muted-foreground hover:text-foreground",
                      pathname === link.href
                        ? "bg-primary/10 text-primary font-semibold"
                        : ""
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              {isUserLoading ? (
                <Skeleton className="h-10 w-10 rounded-full" />
              ) : user ? (
                <UserNav />
              ) : (
                <Button asChild variant="ghost" size="icon" className="rounded-full">
                  <Link href="/login">
                    <LogIn />
                    <span className="sr-only">Login</span>
                  </Link>
                </Button>
              )}
            </div>
        </div>
      </div>
    </header>
  );
}
