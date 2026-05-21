'use client';

import React, { ReactNode, useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * FirebaseClientProvider (Root Identity Hub)
 * Centralized source of truth for the Turfista session state.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, db, auth, storage } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider app={app} firestore={db} auth={auth} storage={storage}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
