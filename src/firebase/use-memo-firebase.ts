'use client';

import { useMemo, useRef } from 'react';

/**
 * A hook to memoize Firebase references and queries.
 * It ensures that the reference is only recreated if its dependencies change,
 * preventing infinite loops in hooks like useCollection and useDoc.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  // Use a ref to store the previous dependencies
  const prevDeps = useRef<any[]>([]);
  const memoizedValue = useRef<T | null>(null);

  const depsChanged = deps.some((dep, i) => dep !== prevDeps.current[i]);

  if (depsChanged || !memoizedValue.current) {
    memoizedValue.current = factory();
    prevDeps.current = deps;
  }

  return memoizedValue.current!;
}
