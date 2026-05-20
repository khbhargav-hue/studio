'use client';

import React, { ReactNode, useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * FirebaseClientProvider
 * Composes the FirebaseProvider with initialized production services.
 * Breaking circular dependency by ensuring index.ts does not re-export this provider.
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
