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
    // This is the critical node for Android Chrome and iPhone Safari after redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          const user = result.user;
          // Tactical log for identity capture verification
          console.log("Redirect Identity Captured:", user.email);

          // Synchronize athlete identity with Firestore registry
          setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: "user",
            updatedAt: serverTimestamp()
          }, { merge: true })
          .then(() => {
            console.log("Firestore Registry Sync Complete for:", user.email);
          });
        }
      })
      .catch(err => {
        // Log redirect failures silently unless they are critical configuration issues
        if (err.code !== 'auth/unauthorized-domain') {
          console.error("Redirect Protocol Failure:", err.code);
        }
      });
  }, [auth, db]);

  return (
    <FirebaseProvider app={app} firestore={db} auth={auth} storage={storage}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
