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
 * Direct connection to Firebase Services (No App Hosting Backend calls)
 */
export function initializeFirebase() {
  const apps = getApps();
  const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
  
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  
  return { app, auth, db, storage };
}
