
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const isBrowser = typeof window !== 'undefined';
  
  if (!getApps().length) {
    let firebaseApp;
    try {
      // This will automatically initialize from the server-side configuration.
      firebaseApp = initializeApp();
    } catch (e) {
      // If server-side config isn't available (e.g., local dev), fall back.
      if (process.env.NODE_ENV !== "production") {
        console.warn('Automatic server-side initialization failed. Falling back to firebaseConfig object for local development.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    
    // IMPORTANT: App Check is a production security feature.
    // For local development, it can be tricky to set up. We are temporarily
    // bypassing it here to ensure core Firebase services work.
    // To enable for production:
    // 1. Get a reCAPTCHA v3 site key from the Google Cloud console.
    // 2. Add it to your environment variables.
    // 3. Uncomment the code block below.
    /*
    if (isBrowser && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
        initializeAppCheck(firebaseApp, {
          provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
          isTokenAutoRefreshEnabled: true,
        });
    } else if (isBrowser) {
        console.warn(`
            Firebase App Check is not initialized. For production, you should:
            1. Go to the reCAPTCHA admin console and create a new reCAPTCHA v3 key.
            2. Add it as NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your environment variables.
            3. Go to the Firebase Console > App Check and register your site with the key.
        `);
    }
    */

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

    