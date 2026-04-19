import type {
  SensorType,
  SensorReading,
  AnomalyResult,
  PredictionResult,
  RuleEvaluationResult,
  TrendDirection,
  ThresholdConfig,
} from '@/types';
import { PREDICTION_MINUTES_AHEAD } from '@/utils/constants';

import { detectAnomaly } from './anomaly';
import { evaluateRules } from './rules';
import { predictTrend } from './prediction';

export * from './anomaly';
export * from './rules';
export * from './prediction';

export interface FullAnalysisResult {
  anomaly: AnomalyResult;
  rules: RuleEvaluationResult[];
  prediction: PredictionResult;
}

export function analyzeReading(
  sensorType: SensorType,
  currentValue: number,
  recentValues: number[],
  recentReadings: SensorReading[],
  thresholdConfig?: ThresholdConfig
): FullAnalysisResult {
  const anomaly =
    sensorType === 'motion'
      ? {
          isAnomaly: false,
          zScore: 0,
          mean: 0,
          standardDeviation: 0,
          value: currentValue,
        }
      : detectAnomaly(currentValue, recentValues);

  const rules = evaluateRules(sensorType, currentValue, thresholdConfig);

  const prediction =
    sensorType === 'motion'
      ? {
          predictedValue: 0,
          trend: 'stable' as TrendDirection,
          slope: 0,
          confidence: 0,
          minutesAhead: PREDICTION_MINUTES_AHEAD,
        }
      : predictTrend(recentReadings);

  return { anomaly, rules, prediction };
}

export function getTrendDescription(
  trend: TrendDirection,
  slope: number
): string {
  const absSlope = Math.abs(slope);

  switch (trend) {
    case 'rising':
      if (absSlope > 0.5) return '↑ En forte hausse';
      if (absSlope > 0.1) return '↗ En hausse';
      return '↗ Légère hausse';
    case 'falling':
      if (absSlope > 0.5) return '↓ En forte baisse';
      if (absSlope > 0.1) return '↘ En baisse';
      return '↘ Légère baisse';
    case 'stable':
      return '→ Stable';
  }
}
