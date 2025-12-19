
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
  LogOut,
  Tag,
} from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
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
import { motion, AnimatePresence } from "framer-motion";


const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/properties", label: "Properties", icon: Building },
  { href: "/interiors", label: "Interiors", icon: Armchair },
  { href: "/professionals", label: "Professionals", icon: UserIcon },
  { href: "/pricing", label: "Pricing", icon: Tag },
];

const secondaryLinks = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/support", label: "Support", icon: HelpCircle },
    { href: "/contact", label: "Contact", icon: Mail },
];

const categoryDisplay: Record<string, string> = {
  'user': 'Buyer / Tenant',
  'listing-property': 'Property Owner',
  'real-estate-agent': 'Real Estate Agent',
  'interior-designer': 'Interior Designer',
  'vendor': 'Vendor / Supplier'
};


export const TwoStripesIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const isHomePage = pathname === '/';
  const isPropertiesPage = pathname.startsWith('/properties');
  const isInteriorsPage = pathname === '/interiors';
  const isProfessionalsPage = pathname.startsWith('/professionals');

  const { isScrolled } = useOnScroll("offers"); 
  
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile } = useDoc<UserType>(userDocRef);

  const isProfessional = userProfile?.category && ['listing-property', 'real-estate-agent', 'interior-designer', 'vendor'].includes(userProfile.category);
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isVendor = userProfile?.category === 'vendor';

  const handleSearch = (searchTerm: string) => {
    let targetPath: string;

    if (isProfessionalsPage) {
      targetPath = '/professionals';
    } else if (isInteriorsPage) {
      targetPath = '/interiors';
    } else {
      targetPath = '/properties';
    }

    const params = new URLSearchParams();
    params.set('q', searchTerm);
    
    router.push(`${targetPath}?${params.toString()}`);
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
      variant: 'success'
    });
    router.push('/');
  };
  
  const visibleNavLinks = navLinks.filter(link => {
    if (link.label === "My Listings" && !isProfessional) return false;
    if (link.label === "My Listings" && !user) return false;
    return true;
  });

  const NavLink = ({ href, label }: { href: string, label: string }) => {
    const isActive = pathname === href;
    return (
      <Link href={href} className="relative group px-3 py-2 transition-colors">
        <span className={cn(
          "relative z-10",
          isActive ? "text-primary font-semibold" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {label}
        </span>
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-primary rounded-full" />
        )}
      </Link>
    );
  };

  const showStickySearch = isScrolled && (isHomePage || isInteriorsPage || isProfessionalsPage || isPropertiesPage);

  return (
    <header className="sticky top-0 z-50 w-full">
       <AnnouncementBanner />
       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="left" className="p-0 flex flex-col">
             <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                 {isUserLoading ? (
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                 ) : user ? (
                    <Link href="/settings" className="flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 border-2 border-primary/20">
                            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                            <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
                                {user.displayName?.split(' ').map(n => n[0]).join('') || <UserIcon />}
                            </AvatarFallback>
                        </Avatar>
                        <p className="text-lg font-bold mt-3">{user.displayName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {userProfile?.category && (
                            <p className="text-xs font-semibold text-primary mt-1">{categoryDisplay[userProfile.category]}</p>
                        )}
                    </Link>
                 ) : (
                    <SheetClose asChild>
                        <div className="flex justify-center">
                          <Logo />
                        </div>
                    </SheetClose>
                 )}
             </SheetHeader>

                <div className="flex-1 space-y-2 p-4 overflow-y-auto">
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
                  {user ? (
                      <Button variant="outline" className="w-full h-12 text-base" onClick={handleSignOut}>
                          <LogOut className="mr-2 h-5 w-5" />
                          Log Out
                      </Button>
                  ) : (
                    <SheetClose asChild>
                        <Button asChild variant="default" className="w-full h-12 text-base">
                            <Link href="/login">
                                <LogIn className="mr-2 h-5 w-5" />
                                Log In
                            </Link>
                        </Button>
                    </SheetClose>
                  )}
                </SheetFooter>
          </SheetContent>

        <div className="container p-2">
          <div className={cn(
                "h-14 flex items-center rounded-full p-2 md:px-4 transition-all duration-300",
                isScrolled ? "bg-background shadow-md" : "bg-transparent shadow-none"
          )}>
            <AnimatePresence mode="wait">
              {showStickySearch ? (
                <motion.div
                  key="search"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <StickySearchHeader onMenuClick={() => setIsSheetOpen(true)} searchAction={handleSearch}/>
                </motion.div>
              ) : (
                <motion.div
                  key="nav"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-3 h-full items-center w-full"
                >
                  <div className="flex items-center gap-2">
                      <SheetTrigger asChild>
                          <Button variant="default" size="icon" className="rounded-full md:hidden">
                          <TwoStripesIcon className="h-6 w-6" />
                          <span className="sr-only">Toggle navigation menu</span>
                          </Button>
                      </SheetTrigger>
                      
                      <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
                          {visibleNavLinks.filter(l => l.href !== '/' && l.href !== '/professionals' && l.href !== '/pricing').map((link) => (
                             <NavLink key={link.href} href={link.href} label={link.label} />
                          ))}
                      </nav>
                  </div>
                  <div className="flex justify-center">
                      <Logo />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                      <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
                          {navLinks.filter(l => l.href === '/professionals' || l.href === '/pricing').map((link) => (
                             <NavLink key={link.href} href={link.href} label={link.label} />
                          ))}
                          {user && isProfessional && !isVendor && (
                            <NavLink href="/settings?tab=listings" label="My Listings" />
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Sheet>
    </header>
  );
}
