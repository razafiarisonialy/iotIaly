
import type {
  Alert,
  ForecastItem,
  PredictionResult,
  SensorReading,
  SensorType,
  SimulationSpeed,
  SystemStatus,
  ThresholdConfig,
  TrendDirection,
  ValueStatus,
  WeatherData,
} from '@/types';
import { getCurrentTimestamp } from '@/utils/helpers';
import { DEFAULT_THRESHOLDS, getValueStatus } from '@/utils/thresholds';
import Constants from 'expo-constants';
import { create } from 'zustand';

const _envExtra = Constants.expoConfig?.extra as Record<string, string> | undefined;





interface SensorStoreState {
  currentValue: number;
  status: ValueStatus;
  trend: TrendDirection;
  prediction: PredictionResult | null;
  recentValues: number[];
  recentReadings: SensorReading[];
  lastUpdated: string;
}

interface AppState {
  
  sensors: Record<SensorType, SensorStoreState>;
  selectedSensor: SensorType;

  
  alerts: Alert[];
  unreadAlertCount: number;

  
  isDarkMode: boolean;
  alertsEnabled: boolean;
  simulationSpeed: SimulationSpeed;
  simulationRunning: boolean;
  useRealWeather: boolean;
  weatherApiKey: string;
  weatherCity: string;
  thresholds: ThresholdConfig[];


  weatherData: WeatherData | null;
  weatherForecast: ForecastItem[] | null;
  weatherCities: string[];
  activeWeatherCity: string;

  
  systemStatus: SystemStatus;
  isDatabaseReady: boolean;
}

interface AppActions {
  
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

  
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: number) => void;
  acknowledgeAllAlerts: () => void;
  clearAlerts: () => void;
  setAlerts: (alerts: Alert[]) => void;

  
  setDarkMode: (isDark: boolean) => void;
  setAlertsEnabled: (enabled: boolean) => void;
  setSimulationSpeed: (speed: SimulationSpeed) => void;
  setSimulationRunning: (running: boolean) => void;
  setUseRealWeather: (use: boolean) => void;
  setWeatherApiKey: (key: string) => void;
  setWeatherCity: (city: string) => void;
  setThresholds: (thresholds: ThresholdConfig[]) => void;
  updateThreshold: (sensorType: SensorType, config: Partial<ThresholdConfig>) => void;


  setWeatherData: (data: WeatherData | null) => void;
  setWeatherForecast: (forecast: ForecastItem[] | null) => void;
  setWeatherCities: (cities: string[]) => void;
  addWeatherCity: (city: string) => void;
  removeWeatherCity: (city: string) => void;
  setActiveWeatherCity: (city: string) => void;

  
  setDatabaseReady: (ready: boolean) => void;
  resetStore: () => void;
}

type AppStore = AppState & AppActions;





const createInitialSensorState = (): SensorStoreState => ({
  currentValue: 0,
  status: 'normal',
  trend: 'stable',
  prediction: null,
  recentValues: [],
  recentReadings: [],
  lastUpdated: getCurrentTimestamp(),
});

const MAX_RECENT_VALUES = 60; 
const MAX_RECENT_READINGS = 200; 
const MAX_ALERTS_IN_STORE = 100;





export const useAppStore = create<AppStore>((set, get) => ({
  
  sensors: {
    temperature: createInitialSensorState(),
    humidity: createInitialSensorState(),
    motion: createInitialSensorState(),
    energy: createInitialSensorState(),
    air_quality: createInitialSensorState(),
  },
  selectedSensor: 'temperature',

  
  alerts: [],
  unreadAlertCount: 0,

  
  isDarkMode: true,
  alertsEnabled: true,
  simulationSpeed: 'normal',
  simulationRunning: false,
  useRealWeather: false,
  weatherApiKey: _envExtra?.weatherApiKey ?? '',
  weatherCity: 'Antananarivo',
  thresholds: [...DEFAULT_THRESHOLDS],


  weatherData: null,
  weatherForecast: null,
  weatherCities: [],
  activeWeatherCity: 'Antananarivo',

  
  systemStatus: 'normal',
  isDatabaseReady: false,

  

  updateSensorValue: (sensorType, value, isAnomaly, reading) => {
    set((state) => {
      const sensor = state.sensors[sensorType];
      const threshold = state.thresholds.find(
        (t) => t.sensorType === sensorType
      );
      const status = threshold ? getValueStatus(value, threshold) : 'normal';

      
      const newRecentValues = [...sensor.recentValues, value].slice(
        -MAX_RECENT_VALUES
      );

      
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

  

  setWeatherData: (data) => set({ weatherData: data }),
  setWeatherForecast: (forecast) => set({ weatherForecast: forecast }),
  setWeatherCities: (cities) => set({ weatherCities: cities }),
  addWeatherCity: (city) =>
    set((state) => ({
      weatherCities: state.weatherCities.includes(city)
        ? state.weatherCities
        : [...state.weatherCities, city],
    })),
  removeWeatherCity: (city) =>
    set((state) => ({
      weatherCities: state.weatherCities.filter((c) => c !== city),
    })),
  setActiveWeatherCity: (city) => set({ activeWeatherCity: city }),

  

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





function calculateSystemStatus(
  sensors: Record<SensorType, SensorStoreState>
): SystemStatus {
  const statuses = Object.values(sensors).map((s) => s.status);

  if (statuses.includes('exceeded')) return 'critical';
  if (statuses.includes('approaching')) return 'warning';
  return 'normal';
}





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
