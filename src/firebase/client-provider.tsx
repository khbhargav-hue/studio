'use client';

import React, { ReactNode, useMemo, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * FirebaseClientProvider (Root Auth Hub)
 * Wraps the entire application circuit to maintain the identity state.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, db, auth, storage } = useMemo(() => initializeFirebase(), []);

  useEffect(() => {
    if (!auth || !db) return;

    // Background Identity Sync Node
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("LOGIN_SUCCESS", user.email);
        
        // Ensure athlete metadata is synchronized with the registry
        setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "user",
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(err => console.log("REGISTRY_SYNC_FAIL", err.code));
      }
    });

    return () => unsub();
  }, [auth, db]);

  return (
    <FirebaseProvider app={app} firestore={db} auth={auth} storage={storage}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
