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
 * 1. Disables IndexedDB persistence (Off by default, but explicitly avoiding it)
 * 2. Enforces Long Polling
 * 3. Disables Fetch Streams to prevent false offline states
 */
export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
} {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`[FIREBASE DIAGNOSTICS] Environment variables missing: ${missingKeys.join(', ')}`);
  }

  const apps = getApps();
  const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
  
  let db: Firestore;
  if (apps.length === 0) {
    // Explicitly configure Firestore to bypass standard WebSocket/Stream behavior
    // which often triggers the false "offline" error in proxied environments.
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      // @ts-ignore - disabling fetch streams ensures simpler HTTP-based communication
      useFetchStreams: false,
    });
    console.log("[FIREBASE DIAGNOSTICS] Firestore initialized (Server-Force Mode)");
  } else {
    db = getFirestore(app);
  }

  const auth = getAuth(app);
  const storage = getStorage(app);
  
  return { app, auth, db, storage };
}
