
'use client';

import React, { ReactNode, useMemo, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * FirebaseClientProvider (AuthProvider Hub)
 * Centralized session monitor and identity synchronization node.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, db, auth, storage } = useMemo(() => initializeFirebase(), []);

  useEffect(() => {
    if (!auth || !db) return;

    console.log("AUTH_START: Identity Monitor Active");

    // Primary Identity Truth Circuit
    const unsub = onAuthStateChanged(auth, (user) => {
      console.log("AUTH_CHANGED", user?.uid || "NO_IDENTITY");
      
      if (user) {
        console.log("AUTH_SUCCESS", user.email);
        localStorage.setItem("userLoggedIn", "true");
        
        // Background Identity Sync
        setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "user",
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(err => console.log("SYNC_WARNING", err.code));
        
      } else {
        localStorage.removeItem("userLoggedIn");
      }
    });

    // Capture Redirect Results (Mobile)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("REDIRECT_SUCCESS", result.user.uid);
        }
      })
      .catch(err => {
        if (err.code !== 'auth/popup-closed-by-user') {
          console.log("AUTH_FAIL: Redirect", err.code);
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
