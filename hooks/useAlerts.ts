/**
 * Alert management hook for the alerts screen.
 *
 * Provides alert data and actions:
 * - Load alerts from database
 * - Acknowledge individual or all alerts
 * - Filter by status and severity
 * - Real-time unread count
 */

import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  getAlerts as dbGetAlerts,
  acknowledgeAlert as dbAcknowledgeAlert,
  acknowledgeAllAlerts as dbAcknowledgeAll,
  getUnacknowledgedAlertCount,
  purgeAllAlerts,
} from '@/services/database';
import type { Alert, SeverityLevel } from '@/types';

/** Filter mode for the alerts list */
export type AlertFilter = 'all' | 'unacknowledged' | 'acknowledged';

/** Return type of the useAlerts hook */
interface UseAlertsReturn {
  /** Current filtered list of alerts */
  alerts: Alert[];
  /** Total unacknowledged alert count */
  unreadCount: number;
  /** Current filter mode */
  filter: AlertFilter;
  /** Current severity filter (null = all severities) */
  severityFilter: SeverityLevel | null;
  /** Whether alerts are being loaded */
  isLoading: boolean;
  /** Set the filter mode */
  setFilter: (filter: AlertFilter) => void;
  /** Set severity filter */
  setSeverityFilter: (severity: SeverityLevel | null) => void;
  /** Acknowledge a single alert */
  acknowledge: (alertId: number) => Promise<void>;
  /** Acknowledge all alerts */
  acknowledgeAll: () => Promise<void>;
  /** Delete all alerts */
  clearAll: () => Promise<void>;
  /** Refresh alerts from database */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing alerts with filtering and persistence.
 *
 * @param autoLoad - Whether to load alerts on mount (default true)
 * @returns Alert state and controls
 */
export function useAlerts(autoLoad: boolean = true): UseAlertsReturn {
  const storeAlerts = useAppStore((s) => s.alerts);
  const unreadCount = useAppStore((s) => s.unreadAlertCount);
  const storeAcknowledge = useAppStore((s) => s.acknowledgeAlert);
  const storeAcknowledgeAll = useAppStore((s) => s.acknowledgeAllAlerts);
  const storeClear = useAppStore((s) => s.clearAlerts);
  const storeSetAlerts = useAppStore((s) => s.setAlerts);
  const isDatabaseReady = useAppStore((s) => s.isDatabaseReady);

  const [filter, setFilter] = useState<AlertFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  /** Load alerts from database into store */
  const refresh = useCallback(async () => {
    if (!isDatabaseReady) return;
    setIsLoading(true);
    try {
      const dbAlerts = await dbGetAlerts(undefined, 100);
      storeSetAlerts(dbAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isDatabaseReady, storeSetAlerts]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && isDatabaseReady) {
      refresh();
    }
  }, [autoLoad, isDatabaseReady, refresh]);

  /** Acknowledge a single alert in both store and database */
  const acknowledge = useCallback(
    async (alertId: number) => {
      storeAcknowledge(alertId);
      try {
        await dbAcknowledgeAlert(alertId);
      } catch (error) {
        console.error('Failed to acknowledge alert:', error);
      }
    },
    [storeAcknowledge]
  );

  /** Acknowledge all alerts in both store and database */
  const acknowledgeAll = useCallback(async () => {
    storeAcknowledgeAll();
    try {
      await dbAcknowledgeAll();
    } catch (error) {
      console.error('Failed to acknowledge all alerts:', error);
    }
  }, [storeAcknowledgeAll]);

  /** Clear all alerts from both store and database */
  const clearAll = useCallback(async () => {
    storeClear();
    try {
      await purgeAllAlerts();
    } catch (error) {
      console.error('Failed to clear alerts:', error);
    }
  }, [storeClear]);

  // Apply filters on the store alerts
  let filteredAlerts = storeAlerts;

  if (filter === 'unacknowledged') {
    filteredAlerts = filteredAlerts.filter((a) => !a.acknowledged);
  } else if (filter === 'acknowledged') {
    filteredAlerts = filteredAlerts.filter((a) => a.acknowledged);
  }

  if (severityFilter) {
    filteredAlerts = filteredAlerts.filter(
      (a) => a.severity === severityFilter
    );
  }

  return {
    alerts: filteredAlerts,
    unreadCount,
    filter,
    severityFilter,
    isLoading,
    setFilter,
    setSeverityFilter,
    acknowledge,
    acknowledgeAll,
    clearAll,
    refresh,
  };
}
