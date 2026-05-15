
'use client';

import { getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './use-memo-firebase';

/**
 * initializeFirebase
 * 
 * Hardened for environments with restrictive proxies:
 * 1. Validates all NEXT_PUBLIC_FIREBASE_* variables
 * 2. Enforces Long Polling
 * 3. Disables Fetch Streams
 * 4. Logs Project Identity for verification
 */
export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
} {
  // 1. Strict Environment Audit
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase()}`);

  if (missingKeys.length > 0) {
    const errorMsg = `[FIREBASE CRITICAL] Missing Environment Variables: ${missingKeys.join(', ')}. Ensure your .env file is loaded.`;
    console.error(errorMsg);
    // In dev, we throw to prevent silent failures. In prod, this will be caught by error boundaries.
    if (process.env.NODE_ENV === 'development') {
      throw new Error(errorMsg);
    }
  }

  const apps = getApps();
  const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
  
  let db: Firestore;
  if (apps.length === 0) {
    // 2. Resilience: Force connectivity via Long Polling to bypass standard WebSocket/Stream proxy issues
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      // @ts-ignore - disabling fetch streams ensures simpler HTTP-based communication in restricted environments
      useFetchStreams: false,
    });
    
    console.log(`[FIREBASE READY] Circuit active on node: ${firebaseConfig.projectId}`);
  } else {
    db = getFirestore(app);
  }

  const auth = getAuth(app);
  const storage = getStorage(app);
  
  return { app, auth, db, storage };
}
