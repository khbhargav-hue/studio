'use client';

import React, { ReactNode, useMemo, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { getRedirectResult } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * FirebaseClientProvider
 * Composes the FirebaseProvider with initialized production services.
 * Breaking circular dependency by avoiding re-exporting this from index.ts.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, db, auth, storage } = useMemo(() => initializeFirebase(), []);

  useEffect(() => {
    if (!auth || !db) return;

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          const user = result.user;
          setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: "user",
            updatedAt: serverTimestamp()
          }, { merge: true })
          .then(() => {
            console.log("User saved:", user.email);
          });
        }
      })
      .catch(err => {
        console.error("Redirect error:", err.code);
      });
  }, [auth, db]);

  return (
    <FirebaseProvider app={app} firestore={db} auth={auth} storage={storage}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
