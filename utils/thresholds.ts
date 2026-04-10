
import type { ThresholdConfig } from '@/types';

export const DEFAULT_THRESHOLDS: ThresholdConfig[] = [
  {
    sensorType: 'temperature',
    minWarning: 5,
    maxWarning: 30,
    minCritical: 0,
    maxCritical: 35,
    label: 'Température',
    unit: '°C',
  },
  {
    sensorType: 'humidity',
    minWarning: 35,
    maxWarning: 75,
    minCritical: 25,
    maxCritical: 85,
    label: 'Humidité',
    unit: '%',
  },
  {
    sensorType: 'motion',
    minWarning: 0,
    maxWarning: 1,
    minCritical: 0,
    maxCritical: 1,
    label: 'Mouvement',
    unit: 'bool',
  },
  {
    sensorType: 'energy',
    minWarning: 0,
    maxWarning: 4.5,
    minCritical: 0,
    maxCritical: 6.0,
    label: 'Énergie',
    unit: 'kWh',
  },
  {
    sensorType: 'air_quality',
    minWarning: 0,
    maxWarning: 100,
    minCritical: 0,
    maxCritical: 200,
    label: 'Qualité de l\'air',
    unit: 'AQI',
  },
];

export function getDefaultThreshold(sensorType: string): ThresholdConfig {
  const threshold = DEFAULT_THRESHOLDS.find(
    (t) => t.sensorType === sensorType
  );
  if (!threshold) {
    throw new Error(`No default threshold found for sensor type: ${sensorType}`);
  }
  return threshold;
}

export function getValueStatus(
  value: number,
  threshold: ThresholdConfig
): 'normal' | 'approaching' | 'exceeded' {
  if (value <= threshold.minCritical || value >= threshold.maxCritical) {
    return 'exceeded';
  }
  if (value <= threshold.minWarning || value >= threshold.maxWarning) {
    return 'approaching';
  }
  return 'normal';
}

export function getThresholdPercentage(
  value: number,
  threshold: ThresholdConfig
): number {
  const range = threshold.maxCritical - threshold.minCritical;
  if (range === 0) return 0;

  const midpoint = (threshold.maxCritical + threshold.minCritical) / 2;
  const distance = Math.abs(value - midpoint);
  const maxDistance = range / 2;

  return Math.min(100, (distance / maxDistance) * 100);
}
