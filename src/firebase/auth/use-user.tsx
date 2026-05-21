'use client';

import { useAuthContext } from '../provider';

/**
 * useUser Hook
 * Consumes the centralized auth state from the FirebaseProvider.
 * Ensures a single source of truth for the athlete session.
 */
export function useUser() {
  return useAuthContext();
}
