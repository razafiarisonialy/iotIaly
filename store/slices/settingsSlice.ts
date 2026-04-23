import type { StoreSlice } from '../types';
import type { ThresholdConfig, SimulationSpeed } from '@/types';
import { DEFAULT_THRESHOLDS } from '@/utils/thresholds';

export interface SettingsSlice {
  isDarkMode: boolean;
  alertsEnabled: boolean;
  simulationSpeed: SimulationSpeed;
  simulationRunning: boolean;
  thresholds: ThresholdConfig[];

  setDarkMode: (isDark: boolean) => void;
  setAlertsEnabled: (enabled: boolean) => void;
  setSimulationSpeed: (speed: SimulationSpeed) => void;
  setSimulationRunning: (running: boolean) => void;
  setThresholds: (thresholds: ThresholdConfig[]) => void;
  updateThreshold: (
    sensorType: ThresholdConfig['sensorType'],
    config: Partial<ThresholdConfig>
  ) => void;
}

export const createSettingsSlice: StoreSlice<SettingsSlice> = (set, get) => ({
  isDarkMode: false,
  alertsEnabled: true,
  simulationSpeed: 'normal',
  simulationRunning: false,
  thresholds: [...DEFAULT_THRESHOLDS],

  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
  setAlertsEnabled: (enabled) => set({ alertsEnabled: enabled }),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  setSimulationRunning: (running) => set({ simulationRunning: running }),

  setThresholds: (thresholds) => set({ thresholds }),

  updateThreshold: (sensorType, config) => {
    set((state: any) => ({
      thresholds: state.thresholds.map((t: ThresholdConfig) =>
        t.sensorType === sensorType ? { ...t, ...config } : t
      ),
    }));
  },
});
