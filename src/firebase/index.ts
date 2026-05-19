'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
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
 * Standard Firebase Client Initialization
 * Pure client-side logic to avoid App Hosting backend dependency errors.
 */
export function initializeFirebase() {
  const apps = getApps();
  const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
  
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  
  // Minimal logging to verify circuit without noise
  if (typeof window !== 'undefined' && apps.length === 0) {
    console.log(`[FIREBASE READY] Circuit active on node: ${firebaseConfig.projectId}`);
  }
  
  return { app, auth, db, storage };
}