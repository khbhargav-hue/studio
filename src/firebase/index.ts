'use client';

import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './use-memo-firebase';

/**
 * Hardened Firebase Initialization
 * Enforces Long Polling to bypass "unavailable" errors in proxied environments.
 * Disables fetch streams and persistence to avoid false offline states.
 * Handles idempotent initialization for Next.js HMR.
 */
export function initializeFirebase() {
  const apps = getApps();
  const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
  
  let db;
  try {
    // Attempt to initialize with hardened settings
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false
    });
  } catch (e) {
    // Fallback if already initialized (common in HMR)
    db = getFirestore(app);
  }

  const auth = getAuth(app);
  const storage = getStorage(app);
  
  if (typeof window !== 'undefined' && apps.length === 0) {
    console.log(`[TURFISTA CIRCUIT] Node active: ${firebaseConfig.projectId}`);
  }
  
  return { app, auth, db, storage };
}
