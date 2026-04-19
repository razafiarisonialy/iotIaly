import type { SensorType, SensorUnit } from './sensors';
import type { SeverityLevel } from './alerts';

export type TrendDirection = 'rising' | 'falling' | 'stable';

export interface ThresholdConfig {
  sensorType: SensorType;
  minWarning: number;
  maxWarning: number;
  minCritical: number;
  maxCritical: number;
  label: string;
  unit: SensorUnit;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  zScore: number;
  mean: number;
  standardDeviation: number;
  value: number;
}

export interface PredictionResult {
  predictedValue: number;
  trend: TrendDirection;
  slope: number;
  confidence: number; 
  minutesAhead: number;
}

export interface RuleEvaluationResult {
  triggered: boolean;
  message: string;
  severity: SeverityLevel;
  action: string;
}
