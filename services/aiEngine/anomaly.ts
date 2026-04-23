import type { AnomalyResult } from '@/types';
import { ANOMALY_WINDOW_SIZE, ANOMALY_Z_THRESHOLD } from '@/utils/constants';
import { roundTo } from '@/utils/helpers';

export function detectAnomaly(
  currentValue: number,
  recentReadings: number[],
  threshold: number = ANOMALY_Z_THRESHOLD
): AnomalyResult {
  if (recentReadings.length < 5) {
    return {
      isAnomaly: false,
      zScore: 0,
      mean: currentValue,
      standardDeviation: 0,
      value: currentValue,
    };
  }

  const window = recentReadings.slice(-ANOMALY_WINDOW_SIZE);

  const sum = window.reduce((acc, val) => acc + val, 0);
  const mean = sum / window.length;

  const squaredDiffs = window.map((val) => Math.pow(val - mean, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((acc, val) => acc + val, 0) / window.length;
  const standardDeviation = Math.sqrt(avgSquaredDiff);

  if (standardDeviation === 0) {
    return {
      isAnomaly: currentValue !== mean,
      zScore: currentValue !== mean ? Infinity : 0,
      mean: roundTo(mean, 2),
      standardDeviation: 0,
      value: currentValue,
    };
  }

  const zScore = (currentValue - mean) / standardDeviation;

  return {
    isAnomaly: Math.abs(zScore) > threshold,
    zScore: roundTo(zScore, 2),
    mean: roundTo(mean, 2),
    standardDeviation: roundTo(standardDeviation, 2),
    value: currentValue,
  };
}
