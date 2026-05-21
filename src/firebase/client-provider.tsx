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
 * Handles the mobile redirect result from Google Authentication.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, db, auth, storage } = useMemo(() => initializeFirebase(), []);

  useEffect(() => {
    if (!auth || !db) return;

    // Handle mobile redirect return protocol
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          const user = result.user;
          // Tactical log as requested
          console.log("Logged in:", user.email);

          // Synchronize athlete identity with Firestore registry
          setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: "user",
            updatedAt: serverTimestamp()
          }, { merge: true })
          .then(() => {
            console.log("Identity synchronized for:", user.email);
          });
        }
      })
      .catch(err => {
        console.error("Redirect protocol error:", err);
      });
  }, [auth, db]);

  return (
    <FirebaseProvider app={app} firestore={db} auth={auth} storage={storage}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
