'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Log the full error object for debugging
      console.error('Firebase Permission Error:', error);
      
      // If the error has a context property, log it specifically
      if (error.context) {
        console.error('Permission Error Context Detail:', JSON.stringify(error.context, null, 2));
      }

      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: error.message || 'You do not have permission to perform this action.',
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}