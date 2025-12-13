
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogIn,
  Search,
  MapPin,
  Heart,
  Home,
  Building,
  Armchair,
  Briefcase,
  Settings,
  HelpCircle,
  Plus,
} from "lucide-react";
import { useUser } from "@/firebase";
import { UserNav } from "@/components/auth/user-nav";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { Input } from "../ui/input";
import { useDoc, useMemoFirebase } from '@/firebase';
import type { User as UserType } from '@/types';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";


const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/properties", label: "Properties", icon: Building },
  { href: "/interiors", label: "Interiors", icon: Armchair },
  { href: "/professionals", label: "Professionals", icon: Briefcase },
];

const secondaryLinks = [
    { href: "/contact", label: "Support", icon: HelpCircle },
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

function StickySearchHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/properties?q=${searchTerm}`);
  };
  
  return (
    <div className="bg-primary text-primary-foreground p-2 flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="hover:bg-primary/80 focus-visible:bg-primary/80">
        <TwoStripesIcon className="h-6 w-6" />
      </Button>
      <form onSubmit={handleSearch} className="flex-grow relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by City, Locality, Project"
          className="bg-background text-foreground h-10 rounded-full pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
    </div>
  );
}


export default function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const { isScrolled } = useOnScroll('offers'); 
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile } = useDoc<UserType>(userDocRef);

  const isProfessional = userProfile?.category && ['listing-property', 'real-estate-agent', 'interior-designer'].includes(userProfile.category);

  const isHomePage = pathname === '/';
  
  const visibleNavLinks = navLinks.filter(link => {
    if (link.label === "My Listings" && !isProfessional) return false;
    if (link.label === "My Listings" && !user) return false;
    return true;
  });

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
    )}>
       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="left" className="p-0">
             <div className="flex h-full flex-col">
                <SheetHeader className="p-6">
                    <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        <span className="sr-only">Close</span>
                    </SheetClose>
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    {isUserLoading ? (
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-4 w-[100px]" />
                            </div>
                        </div>
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                                <AvatarFallback className="text-xl">
                                    {user.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-semibold">Welcome back,</p>
                                <p className="text-2xl font-bold">{user.displayName?.split(' ')[0] || 'User'}</p>
                            </div>
                        </div>
                    ) : (
                        <Logo />
                    )}
                </SheetHeader>
                <div className="flex-1 space-y-2 p-4">
                    <nav className="flex flex-col gap-2">
                      {visibleNavLinks.map((link) => {
                          const isActive = pathname === link.href;
                          return(
                            <SheetClose asChild key={link.href}>
                              <Link
                                href={link.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition-all",
                                  isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted"
                                )}
                              >
                                <link.icon className="h-6 w-6" />
                                <span className="flex-1">{link.label}</span>
                                {isActive && <div className="h-2 w-2 rounded-full bg-primary" />}
                              </Link>
                            </SheetClose>
                          )
                        })}
                    </nav>
                     <Separator className="my-4" />
                     <nav className="flex flex-col gap-2">
                      {secondaryLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                            <Link href={link.href} className="flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium text-muted-foreground transition-all hover:bg-muted">
                                <link.icon className="h-6 w-6" />
                                <span>{link.label}</span>
                            </Link>
                        </SheetClose>
                      ))}
                    </nav>
                </div>
                 <SheetFooter className="p-4 mt-auto">
                    <Button asChild variant="outline" className="w-full h-12 text-base">
                        <Link href="/profile?tab=listings">
                            <Plus className="mr-2 h-5 w-5" />
                            Post a Listing
                        </Link>
                    </Button>
                     <p className="text-xs text-muted-foreground text-center pt-2">Version 2.4.0</p>
                </SheetFooter>
             </div>
          </SheetContent>

        {isHomePage && isScrolled ? (
          <StickySearchHeader onMenuClick={() => setIsSheetOpen(true)} />
        ) : (
          <div className="container p-2">
            <div className={cn(
              "h-14 items-center rounded-full p-2 md:px-4",
              "bg-background shadow-md",
              "grid grid-cols-3"
            )}>
              <div className="flex items-center gap-2">
                  <SheetTrigger asChild>
                    <Button variant="default" size="icon" className="rounded-full md:hidden">
                      <TwoStripesIcon className="h-6 w-6" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </SheetTrigger>
                   <div className="hidden md:flex items-center gap-2">
                    <Separator orientation="vertical" className="h-6" />
                   </div>
                  <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
                    {visibleNavLinks.slice(1,3).map((link) => (
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
                    {navLinks.filter(l => l.label !== 'Home' && l.label !== 'Properties' && l.label !== 'Interiors').map((link) => (
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
                     {user && isProfessional && (
                      <Link
                        href="/profile#listings"
                        className={cn(
                          "px-4 py-1.5 rounded-full transition-colors",
                          "text-muted-foreground hover:text-foreground",
                           pathname === "/profile"
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        )}
                      >
                        My Listings
                      </Link>
                    )}
                  </nav>
                  {isUserLoading ? (
                    <Skeleton className="h-10 w-10 rounded-full" />
                  ) : user ? (
                    <>
                      <Button asChild variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Link href="/profile?tab=wishlist">
                          <Heart />
                        </Link>
                      </Button>
                      <UserNav />
                    </>
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
        )}
      </Sheet>
    </header>
  );
}
