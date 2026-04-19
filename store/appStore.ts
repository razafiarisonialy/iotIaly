import { create } from 'zustand';
import type { SensorType } from '@/types';

import { createSensorSlice, type SensorSlice } from './slices/sensorSlice';
import { createAlertSlice, type AlertSlice } from './slices/alertSlice';
import { createSettingsSlice, type SettingsSlice } from './slices/settingsSlice';
import { createWeatherSlice, type WeatherSlice } from './slices/weatherSlice';
import { createSystemSlice, type SystemSlice } from './slices/systemSlice';

export type AppStore = SensorSlice & AlertSlice & SettingsSlice & WeatherSlice & SystemSlice;

export const useAppStore = create<AppStore>()((...a) => ({
  ...createSensorSlice(...a),
  ...createAlertSlice(...a),
  ...createSettingsSlice(...a),
  ...createWeatherSlice(...a),
  ...createSystemSlice(...a),
}));

export const useSensor = (type: SensorType) =>
  useAppStore((state) => state.sensors[type]);

export const useSystemStatus = () =>
  useAppStore((state) => state.systemStatus);

export const useIsDarkMode = () =>
  useAppStore((state) => state.isDarkMode);

export const useUnreadAlertCount = () =>
  useAppStore((state) => state.unreadAlertCount);

export const useAlerts = () =>
  useAppStore((state) => state.alerts);

export const useSimulationRunning = () =>
  useAppStore((state) => state.simulationRunning);
