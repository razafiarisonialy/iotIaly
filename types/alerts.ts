import type { SensorType } from './sensors';

export type SeverityLevel = 'info' | 'warning' | 'critical';

export interface Alert {
  id: number;
  sensorType: SensorType;
  message: string;
  severity: SeverityLevel;
  timestamp: string; 
  acknowledged: boolean;
}

export interface AlertRow {
  id: number;
  sensor_type: string;
  message: string;
  severity: string;
  timestamp: string;
  acknowledged: number; 
}
