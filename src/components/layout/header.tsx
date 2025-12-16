
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
  SheetHeader,
  SheetTrigger,
} from "../ui/sheet";
import {
  LogIn,
  MapPin,
  Home,
  Building,
  Armchair,
  Briefcase,
  HelpCircle,
  Plus,
  Settings,
  X,
  User as UserIcon,
  Megaphone,
  Mail,
  Shield,
} from "lucide-react";
import { useUser } from "@/firebase";
import { UserNav } from "@/components/auth/user-nav";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { Input } from "../ui/input";
import { useDoc, useMemoFirebase } from '@/firebase';
import type { User as UserType, AppSettings } from '@/types';
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
    { href: "/support", label: "Support", icon: HelpCircle },
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

function StickySearchHeader({ onMenuClick, searchAction }: { onMenuClick: () => void, searchAction: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchAction(searchTerm);
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button variant="default" size="icon" onClick={onMenuClick} className="rounded-full">
        <TwoStripesIcon className="h-6 w-6" />
      </Button>
      <form onSubmit={handleSearch} className="flex-grow relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by City, Locality, Project"
          className="bg-muted text-foreground h-10 rounded-full pl-10 border-transparent focus-visible:bg-background focus-visible:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
    </div>
  );
}


function AnnouncementBanner() {
    const firestore = useFirestore();
    const appSettingsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'app_settings', 'config');
    }, [firestore]);

    const { data: appSettings } = useDoc<AppSettings>(appSettingsRef);

    const announcement = appSettings?.announcement;

    if (!announcement || !announcement.enabled || !announcement.text) {
        return null;
    }

    const BannerContent = () => (
        <div className="flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2">
            <Megaphone className="h-4 w-4 flex-shrink-0" />
            <p className="truncate">{announcement.text}</p>
        </div>
    );
    
    if (announcement.url) {
        return (
            <a href={announcement.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-primary/90 transition-colors">
                <BannerContent />
            </a>
        )
    }

    return <BannerContent />;
}

export default function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  const isHomePage = pathname === '/';
  const isInteriorsPage = pathname === '/interiors';
  const isProfessionalsPage = pathname === '/professionals';

  const scrollTriggerId = isHomePage ? 'offers' : (isInteriorsPage ? 'top-designers' : (isProfessionalsPage ? 'professionals-search' : ''));
  const { isScrolled } = useOnScroll(scrollTriggerId); 
  
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile } = useDoc<UserType>(userDocRef);

  const isProfessional = userProfile?.category && ['listing-property', 'real-estate-agent', 'interior-designer', 'vendor'].includes(userProfile.category);
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const handleSearch = (searchTerm: string) => {
    let targetPath = '/properties';
    if (isInteriorsPage) targetPath = '/interiors';
    if (isProfessionalsPage) targetPath = '/professionals';

    const params = new URLSearchParams(window.location.search);
    params.set('q', searchTerm);
    
    if (pathname === targetPath) {
      router.replace(`${targetPath}?${params.toString()}`);
    } else {
      router.push(`${targetPath}?${params.toString()}`);
    }
  };
  
  const visibleNavLinks = navLinks.filter(link => {
    if (link.label === "My Listings" && !isProfessional) return false;
    if (link.label === "My Listings" && !user) return false;
    return true;
  });

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
    )}>
       <AnnouncementBanner />
       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="left" className="p-0 flex flex-col">
             <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                 {isUserLoading ? (
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[120px]" />
                        </div>
                    </div>
                 ) : user ? (
                    <SheetClose asChild>
                        <Link href="/settings" className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                                <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                                    {user.displayName?.split(' ').map(n => n[0]).join('') || <UserIcon />}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-base font-bold text-left">{user.displayName?.split(' ')[0] || 'User'}</p>
                                <p className="text-sm text-muted-foreground text-left">View Settings</p>
                            </div>
                        </Link>
                    </SheetClose>
                 ) : (
                    <SheetClose asChild>
                        <Logo />
                    </SheetClose>
                 )}
             </SheetHeader>

                <div className="flex-1 space-y-2 p-4">
                    <nav className="flex flex-col gap-1">
                      {visibleNavLinks.map((link) => {
                          const isActive = pathname === link.href;
                          return(
                            <SheetClose asChild key={link.href}>
                              <Link
                                href={link.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold transition-all",
                                  isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-foreground hover:bg-muted"
                                )}
                              >
                                <link.icon className="h-5 w-5" />
                                <span className="flex-1">{link.label}</span>
                                {isActive && <div className="h-2 w-2 rounded-full bg-primary" />}
                              </Link>
                            </SheetClose>
                          )
                        })}
                    </nav>
                     <Separator className="my-4" />
                     <nav className="flex flex-col gap-1">
                      {secondaryLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                            <Link href={link.href} className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold text-foreground transition-all hover:bg-muted">
                                <link.icon className="h-5 w-5" />
                                <span>{link.label}</span>
                            </Link>
                        </SheetClose>
                      ))}
                      {isAdmin && (
                        <SheetClose asChild>
                            <Link href="/admin" className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold text-foreground transition-all hover:bg-muted">
                                <Shield className="h-5 w-5" />
                                <span>Admin</span>
                            </Link>
                        </SheetClose>
                      )}
                    </nav>
                </div>
                 <SheetFooter className="p-4 mt-auto border-t">
                    <SheetClose asChild>
                        <Button asChild variant="default" className="w-full h-12 text-base">
                            <Link href="/settings?tab=listings">
                                <Plus className="mr-2 h-5 w-5" />
                                Post Property
                            </Link>
                        </Button>
                    </SheetClose>
                </SheetFooter>
          </SheetContent>

        <div className="container p-2">
          <div className={cn(
                "h-14 items-center rounded-full p-2 md:px-4",
                "bg-background shadow-md",
          )}>
            {(isHomePage || isInteriorsPage || isProfessionalsPage) && isScrolled ? (
              <StickySearchHeader onMenuClick={() => setIsSheetOpen(true)} searchAction={handleSearch}/>
            ) : (
            <div className="grid grid-cols-3 h-full items-center">
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
                            href="/settings?tab=listings"
                            className={cn(
                            "px-4 py-1.5 rounded-full transition-colors",
                            "text-muted-foreground hover:text-foreground",
                            pathname === "/settings"
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
            )}
          </div>
        </div>
      </Sheet>
    </header>
  );
}
