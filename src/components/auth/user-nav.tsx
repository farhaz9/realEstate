
'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { User } from 'lucide-react';

export function UserNav() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <Button asChild variant="ghost" className="relative h-10 w-10 rounded-full">
      <Link href="/settings">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </Link>
    </Button>
  );
}
