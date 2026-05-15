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

/**
 * initializeFirebase
 * 
 * DIAGNOSTICS CHECKLIST:
 * 1. Environment variables loaded (firebaseConfig validation)
 * 2. Firebase initializeApp() execution
 * 3. getFirestore() initialization with Long Polling (Step 9 prevention)
 * 4. Auth initialized
 */
export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
} {
  // Step 1: Environment Variable Check
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    const errorMsg = `[FIREBASE DIAGNOSTICS] Step 1 Failed: Environment variables missing: ${missingKeys.join(', ')}. Ensure your .env file contains the required NEXT_PUBLIC_FIREBASE_ keys.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const apps = getApps();
  
  // Step 2: initializeApp Check
  let app: FirebaseApp;
  try {
    app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
    console.log("[FIREBASE DIAGNOSTICS] Step 2 Success: App Instance Verified");
  } catch (err: any) {
    const errorMsg = `[FIREBASE DIAGNOSTICS] Step 2 Failed: initializeApp error: ${err.message}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Step 3: Firestore Check (Hardened for Proxy/Preview environments)
  let db: Firestore;
  try {
    if (apps.length === 0) {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true, // Fix for "Failed to get document because client is offline"
      });
    } else {
      db = getFirestore(app);
    }
    console.log("[FIREBASE DIAGNOSTICS] Step 3 Success: Firestore Node Connected (Long Polling Active)");
  } catch (err: any) {
    const errorMsg = `[FIREBASE DIAGNOSTICS] Step 3 Failed: getFirestore error: ${err.message}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Step 4: Auth Check
  let auth: Auth;
  try {
    auth = getAuth(app);
    console.log("[FIREBASE DIAGNOSTICS] Step 4 Success: Auth Node Initialized");
  } catch (err: any) {
    const errorMsg = `[FIREBASE DIAGNOSTICS] Step 4 Failed: getAuth error: ${err.message}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  const storage = getStorage(app);
  return { app, auth, db, storage };
}
