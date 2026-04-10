
import { useState, useEffect, useCallback } from 'react';
import { initializeDatabase, closeDatabase } from '@/services/database';

interface UseDatabaseState {
    isReady: boolean;
    error: Error | null;
    retry: () => void;
}

export function useDatabase(): UseDatabaseState {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = useCallback(async () => {
    try {
      setError(null);
      setIsReady(false);

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Délai dépassé : base de données non disponible')),
          8000
        )
      );
      await Promise.race([initializeDatabase(), timeout]);

      setIsReady(true);
    } catch (initError) {
      console.error('Database initialization failed:', initError);
      setError(
        initError instanceof Error
          ? initError
          : new Error('Failed to initialize database')
      );
    }
  }, []);

  useEffect(() => {
    initialize();

    return () => {
      closeDatabase().catch((closeError) => {
        console.error('Failed to close database:', closeError);
      });
    };
  }, [initialize]);

  const retry = useCallback(() => {
    initialize();
  }, [initialize]);

  return { isReady, error, retry };
}
