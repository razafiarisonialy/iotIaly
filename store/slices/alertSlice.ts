import type { Alert } from '@/types';
import type { StoreSlice } from '../types';

export interface AlertSlice {
  alerts: Alert[];
  unreadAlertCount: number;
  dataPurgedAt: number;

  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: number) => void;
  acknowledgeAllAlerts: () => void;
  clearAlerts: () => void;
  setAlerts: (alerts: Alert[]) => void;
  recordPurge: () => void;
}

export const MAX_ALERTS_IN_STORE = 100;

export const createAlertSlice: StoreSlice<AlertSlice> = (set, get) => ({
  alerts: [],
  unreadAlertCount: 0,
  dataPurgedAt: 0,

  addAlert: (alert) => {
    set((state: any) => {
      const newAlerts = [alert, ...state.alerts].slice(0, MAX_ALERTS_IN_STORE);
      const unreadCount = newAlerts.filter((a: Alert) => !a.acknowledged).length;
      return {
        alerts: newAlerts,
        unreadAlertCount: unreadCount,
      };
    });
  },

  acknowledgeAlert: (alertId) => {
    set((state: any) => {
      const newAlerts = state.alerts.map((a: Alert) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      );
      const unreadCount = newAlerts.filter((a: Alert) => !a.acknowledged).length;
      return {
        alerts: newAlerts,
        unreadAlertCount: unreadCount,
      };
    });
  },

  acknowledgeAllAlerts: () => {
    set((state: any) => ({
      alerts: state.alerts.map((a: Alert) => ({ ...a, acknowledged: true })),
      unreadAlertCount: 0,
    }));
  },

  clearAlerts: () => {
    set({ alerts: [], unreadAlertCount: 0 });
  },

  setAlerts: (alerts) => {
    const unreadCount = alerts.filter((a: Alert) => !a.acknowledged).length;
    set({ alerts, unreadAlertCount: unreadCount });
  },

  recordPurge: () => {
    set((state: any) => ({ dataPurgedAt: state.dataPurgedAt + 1 }));
  },
});
