
'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import type { User } from '@/types';
import { Button, ButtonProps } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface PostPropertyButtonProps extends ButtonProps {}

export function PostPropertyButton({ className, ...props }: PostPropertyButtonProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const pathname = usePathname();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile } = useDoc<User>(userDocRef);
    
    // Show badge if user is not logged in (optimistic) or has credits.
    const showFreeBadge = !user || (userProfile?.listingCredits ?? 0) > 0;
    
    // Don't show the button at all on these pages for unauthenticated users,
    // as it's a primary CTA on those pages already.
    if (!user && (pathname === '/' || pathname === '/properties')) {
        return null;
    }

    const handlePostPropertyClick = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        router.push('/settings?tab=listings');
    };

    return (
        <Button
            variant="default"
            className={cn("font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 group flex items-center justify-center relative", className)}
            onClick={handlePostPropertyClick}
            {...props}
        >
            <PlusCircle className="mr-2 h-5 w-5" />
            Post Property
            {showFreeBadge && (
                 <div className="absolute right-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                    Free
                </div>
            )}
        </Button>
    );
}
