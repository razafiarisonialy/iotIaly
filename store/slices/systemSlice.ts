import type { StoreSlice } from '../types';
import type { SystemStatus } from '@/types';
import { createInitialSensorState } from './sensorSlice';

export interface SystemSlice {
  systemStatus: SystemStatus;
  isDatabaseReady: boolean;

  setDatabaseReady: (ready: boolean) => void;
  resetStore: () => void;
}

export const createSystemSlice: StoreSlice<SystemSlice> = (set, get) => ({
  systemStatus: 'normal',
  isDatabaseReady: false,

  setDatabaseReady: (ready) => set({ isDatabaseReady: ready }),

  resetStore: () => {
    set({
      sensors: {
        temperature: createInitialSensorState(),
        humidity: createInitialSensorState(),
        motion: createInitialSensorState(),
        energy: createInitialSensorState(),
        air_quality: createInitialSensorState(),
      },
      alerts: [],
      unreadAlertCount: 0,
      systemStatus: 'normal',
    });
  },
});
