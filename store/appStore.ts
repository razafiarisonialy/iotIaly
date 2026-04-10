/**
 * Global application state managed by Zustand.
 *
 * Contains:
 * - Current sensor readings and their recent history
 * - Active alerts and unread count
 * - App settings (theme, thresholds, simulation speed)
 * - System status derived from sensor states
 * - Actions for all state mutations
 */

import { create } from 'zustand';
import type {
  SensorType,
  SensorReading,
  Alert,
  SeverityLevel,
  SimulationSpeed,
  SystemStatus,
  ValueStatus,
  TrendDirection,
  PredictionResult,
  ThresholdConfig,
  WeatherData,
} from '@/types';
import { SENSOR_UNIT_MAP } from '@/utils/constants';
import { DEFAULT_THRESHOLDS, getValueStatus } from '@/utils/thresholds';
import { getCurrentTimestamp } from '@/utils/helpers';

// =============================================================================
// State Shape
// =============================================================================

/** Current state for a single sensor in the store */
interface SensorStoreState {
  currentValue: number;
  status: ValueStatus;
  trend: TrendDirection;
  prediction: PredictionResult | null;
  recentValues: number[];
  recentReadings: SensorReading[];
  lastUpdated: string;
}

/** Complete application state */
interface AppState {
  // Sensor data
  sensors: Record<SensorType, SensorStoreState>;
  selectedSensor: SensorType;

  // Alerts
  alerts: Alert[];
  unreadAlertCount: number;

  // Settings
  isDarkMode: boolean;
  alertsEnabled: boolean;
  simulationSpeed: SimulationSpeed;
  simulationRunning: boolean;
  useRealWeather: boolean;
  weatherApiKey: string;
  weatherCity: string;
  thresholds: ThresholdConfig[];

  // Weather
  weatherData: WeatherData | null;

  // System
  systemStatus: SystemStatus;
  isDatabaseReady: boolean;
}

/** Actions available on the store */
interface AppActions {
  // Sensor actions
  updateSensorValue: (
    sensorType: SensorType,
    value: number,
    isAnomaly: boolean,
    reading?: SensorReading
  ) => void;
  setSensorPrediction: (
    sensorType: SensorType,
    prediction: PredictionResult
  ) => void;
  setSelectedSensor: (sensorType: SensorType) => void;

  // Alert actions
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: number) => void;
  acknowledgeAllAlerts: () => void;
  clearAlerts: () => void;
  setAlerts: (alerts: Alert[]) => void;

  // Settings actions
  setDarkMode: (isDark: boolean) => void;
  setAlertsEnabled: (enabled: boolean) => void;
  setSimulationSpeed: (speed: SimulationSpeed) => void;
  setSimulationRunning: (running: boolean) => void;
  setUseRealWeather: (use: boolean) => void;
  setWeatherApiKey: (key: string) => void;
  setWeatherCity: (city: string) => void;
  setThresholds: (thresholds: ThresholdConfig[]) => void;
  updateThreshold: (sensorType: SensorType, config: Partial<ThresholdConfig>) => void;

  // Weather actions
  setWeatherData: (data: WeatherData | null) => void;

  // System actions
  setDatabaseReady: (ready: boolean) => void;
  resetStore: () => void;
}

/** Combined store type */
type AppStore = AppState & AppActions;

// =============================================================================
// Initial State
// =============================================================================

const createInitialSensorState = (): SensorStoreState => ({
  currentValue: 0,
  status: 'normal',
  trend: 'stable',
  prediction: null,
  recentValues: [],
  recentReadings: [],
  lastUpdated: getCurrentTimestamp(),
});

const MAX_RECENT_VALUES = 60; // Keep last 60 values in memory
const MAX_RECENT_READINGS = 200; // For charts
const MAX_ALERTS_IN_STORE = 100;

// =============================================================================
// Store Definition
// =============================================================================

export const useAppStore = create<AppStore>((set, get) => ({
  // --- Initial sensor state ---
  sensors: {
    temperature: createInitialSensorState(),
    humidity: createInitialSensorState(),
    motion: createInitialSensorState(),
    energy: createInitialSensorState(),
    air_quality: createInitialSensorState(),
  },
  selectedSensor: 'temperature',

  // --- Initial alerts state ---
  alerts: [],
  unreadAlertCount: 0,

  // --- Initial settings ---
  isDarkMode: true,
  alertsEnabled: true,
  simulationSpeed: 'normal',
  simulationRunning: false,
  useRealWeather: false,
  weatherApiKey: '',
  weatherCity: 'Antananarivo',
  thresholds: [...DEFAULT_THRESHOLDS],

  // --- Weather ---
  weatherData: null,

  // --- System ---
  systemStatus: 'normal',
  isDatabaseReady: false,

  // === SENSOR ACTIONS ===

  updateSensorValue: (sensorType, value, isAnomaly, reading) => {
    set((state) => {
      const sensor = state.sensors[sensorType];
      const threshold = state.thresholds.find(
        (t) => t.sensorType === sensorType
      );
      const status = threshold ? getValueStatus(value, threshold) : 'normal';

      // Append to recent values (cap at MAX)
      const newRecentValues = [...sensor.recentValues, value].slice(
        -MAX_RECENT_VALUES
      );

      // Append to recent readings if a full reading was provided
      let newRecentReadings = sensor.recentReadings;
      if (reading) {
        newRecentReadings = [...sensor.recentReadings, reading].slice(
          -MAX_RECENT_READINGS
        );
      }

      const updatedSensor: SensorStoreState = {
        ...sensor,
        currentValue: value,
        status,
        recentValues: newRecentValues,
        recentReadings: newRecentReadings,
        lastUpdated: getCurrentTimestamp(),
      };

      // Determine system-wide status
      const allSensors = {
        ...state.sensors,
        [sensorType]: updatedSensor,
      };
      const systemStatus = calculateSystemStatus(allSensors);

      return {
        sensors: allSensors,
        systemStatus,
      };
    });
  },

  setSensorPrediction: (sensorType, prediction) => {
    set((state) => ({
      sensors: {
        ...state.sensors,
        [sensorType]: {
          ...state.sensors[sensorType],
          trend: prediction.trend,
          prediction,
        },
      },
    }));
  },

  setSelectedSensor: (sensorType) => {
    set({ selectedSensor: sensorType });
  },

  // === ALERT ACTIONS ===

  addAlert: (alert) => {
    set((state) => {
      const newAlerts = [alert, ...state.alerts].slice(0, MAX_ALERTS_IN_STORE);
      const unreadCount = newAlerts.filter((a) => !a.acknowledged).length;
      return {
        alerts: newAlerts,
        unreadAlertCount: unreadCount,
      };
    });
  },

  acknowledgeAlert: (alertId) => {
    set((state) => {
      const newAlerts = state.alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      );
      const unreadCount = newAlerts.filter((a) => !a.acknowledged).length;
      return {
        alerts: newAlerts,
        unreadAlertCount: unreadCount,
      };
    });
  },

  acknowledgeAllAlerts: () => {
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, acknowledged: true })),
      unreadAlertCount: 0,
    }));
  },

  clearAlerts: () => {
    set({ alerts: [], unreadAlertCount: 0 });
  },

  setAlerts: (alerts) => {
    const unreadCount = alerts.filter((a) => !a.acknowledged).length;
    set({ alerts, unreadAlertCount: unreadCount });
  },

  // === SETTINGS ACTIONS ===

  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
  setAlertsEnabled: (enabled) => set({ alertsEnabled: enabled }),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  setSimulationRunning: (running) => set({ simulationRunning: running }),
  setUseRealWeather: (use) => set({ useRealWeather: use }),
  setWeatherApiKey: (key) => set({ weatherApiKey: key }),
  setWeatherCity: (city) => set({ weatherCity: city }),

  setThresholds: (thresholds) => set({ thresholds }),

  updateThreshold: (sensorType, config) => {
    set((state) => ({
      thresholds: state.thresholds.map((t) =>
        t.sensorType === sensorType ? { ...t, ...config } : t
      ),
    }));
  },

  // === WEATHER ACTIONS ===

  setWeatherData: (data) => set({ weatherData: data }),

  // === SYSTEM ACTIONS ===

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
}));

// =============================================================================
// Derived State Helpers
// =============================================================================

/**
 * Calculate overall system status from all sensor states.
 * If ANY sensor is 'exceeded' → critical.
 * If ANY sensor is 'approaching' → warning.
 * Otherwise → normal.
 */
function calculateSystemStatus(
  sensors: Record<SensorType, SensorStoreState>
): SystemStatus {
  const statuses = Object.values(sensors).map((s) => s.status);

  if (statuses.includes('exceeded')) return 'critical';
  if (statuses.includes('approaching')) return 'warning';
  return 'normal';
}

// =============================================================================
// Selector Hooks (for optimized re-renders)
// =============================================================================

/** Select a single sensor's state */
export const useSensor = (type: SensorType) =>
  useAppStore((state) => state.sensors[type]);

/** Select system status */
export const useSystemStatus = () =>
  useAppStore((state) => state.systemStatus);

/** Select current theme mode */
export const useIsDarkMode = () =>
  useAppStore((state) => state.isDarkMode);

/** Select unread alert count */
export const useUnreadAlertCount = () =>
  useAppStore((state) => state.unreadAlertCount);

/** Select all alerts */
export const useAlerts = () =>
  useAppStore((state) => state.alerts);

/** Select simulation running state */
export const useSimulationRunning = () =>
  useAppStore((state) => state.simulationRunning);
