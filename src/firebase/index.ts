'use client';

import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
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

export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
} {
  const apps = getApps();
  
  // Validate config presence
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn("Firebase configuration environment variables are missing. Please verify your .env file.");
  }

  const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
  const auth = getAuth(app);
  
  /**
   * Resilient Firestore Initialization
   * Using experimentalForceLongPolling solves 'Failed to get document because the client is offline'
   * in environments where WebSockets are restricted by proxies or workstations.
   */
  let db: Firestore;
  if (apps.length === 0) {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } else {
    db = getFirestore(app);
  }
  
  const storage = getStorage(app);
  return { app, auth, db, storage };
}
