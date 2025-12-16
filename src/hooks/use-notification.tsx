
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  text: string;
  timestamp: string;
}

interface NotificationContextType {
  notification: Notification | null;
  hasNotification: boolean;
  setNotification: (notification: Notification | null) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotificationState] = useState<Notification | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedNotification = localStorage.getItem('notification');
    return storedNotification ? JSON.parse(storedNotification) : null;
  });
  
  const [hasNotification, setHasNotification] = useState(() => {
     if (typeof window === 'undefined') return false;
     return localStorage.getItem('hasNewNotification') === 'true';
  });

  const setNotification = (newNotification: Notification | null) => {
    setNotificationState(newNotification);
    if (newNotification) {
        localStorage.setItem('notification', JSON.stringify(newNotification));
        localStorage.setItem('hasNewNotification', 'true');
        setHasNotification(true);
    } else {
        localStorage.removeItem('notification');
        localStorage.removeItem('hasNewNotification');
        setHasNotification(false);
    }
  };
  
  const clearNotification = () => {
    localStorage.setItem('hasNewNotification', 'false');
    setHasNotification(false);
  }

  return (
    <NotificationContext.Provider value={{ notification, hasNotification, setNotification, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
