
'use client';

import { useEffect } from 'react';
import { useFirestore, useDoc, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { AppSettings, User } from '@/types';
import { Bell } from 'lucide-react';

const LAST_SEEN_NOTIFICATION_KEY = 'lastSeenNotificationTimestamp';

export default function NotificationListener() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<User>(userDocRef);

  const appSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'app_settings', 'config');
  }, [firestore]);

  const { data: appSettings } = useDoc<AppSettings>(appSettingsRef);

  useEffect(() => {
    if (appSettings?.notification) {
      const { text, audience, timestamp } = appSettings.notification;

      if (!text || !timestamp) return;

      const lastSeenTimestamp = localStorage.getItem(LAST_SEEN_NOTIFICATION_KEY);

      if (timestamp !== lastSeenTimestamp) {
        const isVerified = userProfile?.isVerified || false;
        
        let shouldShow = false;
        if (audience === 'all') {
          shouldShow = true;
        } else if (audience === 'verified' && isVerified) {
          shouldShow = true;
        }

        if (shouldShow) {
          toast({
            title: 'New Notification',
            description: text,
            duration: 10000, // Show for 10 seconds
          });
          localStorage.setItem(LAST_SEEN_NOTIFICATION_KEY, timestamp);
        }
      }
    }
  }, [appSettings, userProfile, toast]);

  return null; // This component does not render anything
}
