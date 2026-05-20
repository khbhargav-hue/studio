'use client';

import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './use-memo-firebase';

/**
 * Hardened Firebase Initialization
 * Enforces Long Polling to bypass "unavailable" errors in proxied environments.
 * Disables persistence to avoid false offline states.
 */
export function initializeFirebase() {
  const apps = getApps();
  const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
  
  let db;
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false
    });
  } catch (e) {
    db = getFirestore(app);
  }

  const auth = getAuth(app);
  const storage = getStorage(app);
  
  return { app, auth, db, storage };
}
