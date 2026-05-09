'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(items);
        setLoading(false);
      },
      async (serverError) => {
        // Robust path extraction for both CollectionReference and Query
        let path = 'unknown';
        try {
          if (query instanceof CollectionReference) {
            path = query.path;
          } else if ((query as any)._query?.path) {
            path = (query as any)._query.path.toString();
          } else if ((query as any).path) {
            path = (query as any).path;
          }
        } catch (e) {
          path = 'error-extracting-path';
        }
        
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
          message: serverError.message
        });
        
        errorEmitter.emit('permission-error', permissionError);
        setError(serverError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}