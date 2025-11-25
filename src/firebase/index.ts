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
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    
    if (isBrowser) {
        // IMPORTANT: Replace the placeholder with your actual reCAPTCHA v3 site key.
        // You can get this key from the Google reCAPTCHA admin console.
        const reCaptchaSiteKey = 'YOUR_RECAPTCHA_V3_SITE_KEY';
        
        if (reCaptchaSiteKey && reCaptchaSiteKey !== 'YOUR_RECAPTCHA_V3_SITE_KEY') {
            initializeAppCheck(firebaseApp, {
              provider: new ReCaptchaV3Provider(reCaptchaSiteKey),
              isTokenAutoRefreshEnabled: true,
            });
        } else {
            console.warn(`
                Firebase App Check is not initialized.
                1. Go to the reCAPTCHA admin console and create a new reCAPTCHA v3 key.
                2. Go to the Firebase Console > App Check and register your site with the key.
                3. Replace 'YOUR_RECAPTCHA_V3_SITE_KEY' in src/firebase/index.ts with your actual site key.
            `);
        }
    }

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
