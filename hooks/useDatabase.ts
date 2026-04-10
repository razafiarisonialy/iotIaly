/**
 * React hook for managing database initialization lifecycle.
 * Ensures the database is ready before the app renders its main content.
 */

import { useState, useEffect, useCallback } from 'react';
import { initializeDatabase, closeDatabase } from '@/services/database';

/** State returned by the useDatabase hook */
interface UseDatabaseState {
  /** Whether the database has been successfully initialized */
  isReady: boolean;
  /** Any error that occurred during initialization */
  error: Error | null;
  /** Retry initialization after an error */
  retry: () => void;
}

/**
 * Hook that initializes the SQLite database on mount.
 * Displays a loading state until the database is ready.
 * Closes the database when the component unmounts.
 *
 * @returns Object with isReady status, error state, and retry function
 *
 * @example
 * ```tsx
 * const { isReady, error, retry } = useDatabase();
 * if (!isReady) return <LoadingSpinner />;
 * if (error) return <ErrorView onRetry={retry} />;
 * ```
 */
export function useDatabase(): UseDatabaseState {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = useCallback(async () => {
    try {
      setError(null);
      setIsReady(false);
      await initializeDatabase();
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
