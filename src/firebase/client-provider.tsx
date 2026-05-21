'use client';

import React, { ReactNode, useMemo, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * FirebaseClientProvider (Root Identity Hub)
 * Centralized source of truth for the Turfista session state.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, db, auth, storage } = useMemo(() => initializeFirebase(), []);

  useEffect(() => {
    if (!auth || !db) return;

    // Tactical Identity Observer: Absolute source of truth for session status
    const unsub = onAuthStateChanged(auth, (user) => {
      console.log("AUTH_STATE", user?.uid || "OFFLINE");
      
      if (user) {
        // Registry Synchronization Protocol
        setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "user",
          updatedAt: serverTimestamp()
        }, { merge: true })
        .then(() => console.log("SYNC_SUCCESS", user.email))
        .catch(err => console.log("SYNC_FAIL", err.code));
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
