
'use client';

import { useUser, useAuth, useDoc, useMemoFirebase } from "@/firebase";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { doc, getFirestore } from "firebase/firestore";
import type { User as UserType } from "@/types";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = getFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserType>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && user && userProfile?.isBlocked) {
      if (auth) {
        signOut(auth);
        toast({
          variant: 'destructive',
          title: 'Account Blocked',
          description: 'Your account has been blocked by an administrator.',
        });
        router.push('/login');
      }
    }
  }, [user, userProfile, isUserLoading, auth, router, toast]);

  return <>{children}</>;
}
