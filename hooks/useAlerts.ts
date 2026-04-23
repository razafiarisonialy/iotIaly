import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  getAlerts as dbGetAlerts,
  acknowledgeAlert as dbAcknowledgeAlert,
  acknowledgeAllAlerts as dbAcknowledgeAll,
  getUnacknowledgedAlertCount,
  purgeAllAlerts,
} from '@/services/database';
import { showErrorToast } from '@/services/toastService';
import type { Alert, SeverityLevel } from '@/types';

export type AlertFilter = 'all' | 'unacknowledged' | 'acknowledged';

interface UseAlertsReturn {
    alerts: Alert[];
    unreadCount: number;
    filter: AlertFilter;
    severityFilter: SeverityLevel | null;
    isLoading: boolean;
    setFilter: (filter: AlertFilter) => void;
    setSeverityFilter: (severity: SeverityLevel | null) => void;
    acknowledge: (alertId: number) => Promise<void>;
    acknowledgeAll: () => Promise<void>;
    clearAll: () => Promise<void>;
    refresh: () => Promise<void>;
}

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

    const refresh = useCallback(async () => {
    if (!isDatabaseReady) return;
    setIsLoading(true);
    try {
      const dbAlerts = await dbGetAlerts(undefined, 100);
      storeSetAlerts(dbAlerts);
    } catch {
      showErrorToast('errors.loadAlertsFailed');
    } finally {
      setIsLoading(false);
    }
  }, [isDatabaseReady, storeSetAlerts]);

  useEffect(() => {
    if (autoLoad && isDatabaseReady) {
      refresh();
    }
  }, [autoLoad, isDatabaseReady, refresh]);

    const acknowledge = useCallback(
    async (alertId: number) => {
      storeAcknowledge(alertId);
      try {
        await dbAcknowledgeAlert(alertId);
      } catch {
        showErrorToast('errors.acknowledgeAlertFailed');
      }
    },
    [storeAcknowledge]
  );

    const acknowledgeAll = useCallback(async () => {
    storeAcknowledgeAll();
    try {
      await dbAcknowledgeAll();
    } catch {
      showErrorToast('errors.acknowledgeAllFailed');
    }
  }, [storeAcknowledgeAll]);

    const clearAll = useCallback(async () => {
    storeClear();
    try {
      await purgeAllAlerts();
    } catch {
      showErrorToast('errors.clearAlertsFailed');
    }
  }, [storeClear]);

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
