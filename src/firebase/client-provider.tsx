'use client';

import React, { ReactNode, useMemo, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * FirebaseClientProvider
 * Composes the FirebaseProvider and handles global authentication side-effects.
 * Captures redirect results from mobile Google sign-in.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, db, auth, storage } = useMemo(() => initializeFirebase(), []);

  useEffect(() => {
    if (!auth || !db) return;

    // 4. On app startup: Global Auth Monitor
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("LOGIN_SUCCESS", user.uid);
      }
    });

    // Capture identity signals returning from Google mobile redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          const user = result.user;
          console.log("REDIRECT_SUCCESS", user.uid);

          // Synchronize identity with registry
          setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: "user",
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      })
      .catch(err => {
        console.error("REDIRECT_ERROR", err.code);
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
