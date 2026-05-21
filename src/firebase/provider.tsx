'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';

interface FirebaseContextType {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
  user: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({
  children,
  app,
  firestore,
  auth,
  storage,
}: {
  children: ReactNode;
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <FirebaseContext.Provider value={{ app, firestore, auth, storage, user, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase().app;
}

export function useFirestore() {
  return useFirebase().firestore;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useStorage() {
  return useFirebase().storage;
}

export function useAuthContext() {
  const { user, loading } = useFirebase();
  return { user, loading };
}
