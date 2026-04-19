import type { StoreSlice } from '../types';
import type {
  SensorType,
  SensorReading,
  PredictionResult,
  ValueStatus,
  TrendDirection,
  SystemStatus,
} from '@/types';
import { getCurrentTimestamp } from '@/utils/helpers';
import { getValueStatus } from '@/utils/thresholds';

export interface SensorStoreState {
  currentValue: number;
  status: ValueStatus;
  trend: TrendDirection;
  prediction: PredictionResult | null;
  recentValues: number[];
  recentReadings: SensorReading[];
  lastUpdated: string;
}

export interface SensorSlice {
  sensors: Record<SensorType, SensorStoreState>;
  selectedSensor: SensorType;

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
}

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

function calculateSystemStatus(
  sensors: Record<SensorType, SensorStoreState>
): SystemStatus {
  const statuses = Object.values(sensors).map((s) => s.status);

  if (statuses.includes('exceeded')) return 'critical';
  if (statuses.includes('approaching')) return 'warning';
  return 'normal';
}

export const createSensorSlice: StoreSlice<SensorSlice> = (set, get) => ({
  sensors: {
    temperature: createInitialSensorState(),
    humidity: createInitialSensorState(),
    motion: createInitialSensorState(),
    energy: createInitialSensorState(),
    air_quality: createInitialSensorState(),
  },
  selectedSensor: 'temperature',

  updateSensorValue: (sensorType, value, isAnomaly, reading) => {
    set((state: any) => {
      const sensor = state.sensors[sensorType];
      const threshold = state.thresholds.find(
        (t: any) => t.sensorType === sensorType
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
    set((state: any) => ({
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
});

export { createInitialSensorState };
