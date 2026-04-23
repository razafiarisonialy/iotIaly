import { TrendDirection } from "./ai";

export type SensorType =
  | 'temperature'
  | 'humidity'
  | 'motion'
  | 'energy'
  | 'air_quality';

export type SensorUnit = '°C' | '%' | 'bool' | 'kWh' | 'AQI';

export const SENSOR_UNITS: Record<SensorType, SensorUnit> = {
  temperature: '°C',
  humidity: '%',
  motion: 'bool',
  energy: 'kWh',
  air_quality: 'AQI',
};

export interface SensorReading {
  id: number;
  sensorType: SensorType;
  value: number;
  unit: SensorUnit;
  timestamp: string;
  isAnomaly: boolean;
}

export interface SensorReadingRow {
  id: number;
  sensor_type: string;
  value: number;
  unit: string;
  timestamp: string;
  is_anomaly: number;
}

export type ValueStatus = 'normal' | 'approaching' | 'exceeded';

export interface SensorState {
  type: SensorType;
  currentValue: number;
  unit: SensorUnit;
  status: ValueStatus;
  trend: TrendDirection;
  lastUpdated: string;
  history: SensorReading[];
}
