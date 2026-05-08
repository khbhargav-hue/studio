'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In development, Next.js will catch this and show a nice overlay
      // if it's thrown. For production/UI feedback, we also toast.
      toast({
        variant: 'destructive',
        title: 'Database Error',
        description: error.message || 'You do not have permission to perform this action.',
      });
      
      // Re-throw so the developer sees the rich context in the console/overlay
      console.error('Firebase Permission Error Context:', error.context);
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
