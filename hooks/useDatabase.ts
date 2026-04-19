import { initializeDatabase } from '@/services/database';
import { showErrorToast } from '@/services/toastService';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDatabaseState {
  isReady: boolean;
  error: Error | null;
  retry: () => void;
}

export function useDatabase(): UseDatabaseState {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const initialize = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setError(null);
        setIsReady(false);
      }
      await initializeDatabase();
      if (mountedRef.current) setIsReady(true);
    } catch (initError) {
      showErrorToast('errors.databaseInitFailed');
      if (mountedRef.current) {
        setError(
          initError instanceof Error
            ? initError
            : new Error('Failed to initialize database')
        );
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    initialize();
    return () => {
      mountedRef.current = false;
    };
  }, [initialize]);

  const retry = useCallback(() => {
    initialize();
  }, [initialize]);

  return { isReady, error, retry };
}
