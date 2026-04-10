/**
 * Default threshold configurations for each sensor type.
 * These define when values are considered normal, warning, or critical.
 * Users can customize these via the Settings screen.
 */

import type { ThresholdConfig } from '@/types';

/** Default thresholds for all sensor types */
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

/**
 * Get the default threshold config for a specific sensor type.
 * @param sensorType - The sensor type to look up
 * @returns The threshold configuration for the sensor
 */
export function getDefaultThreshold(sensorType: string): ThresholdConfig {
  const threshold = DEFAULT_THRESHOLDS.find(
    (t) => t.sensorType === sensorType
  );
  if (!threshold) {
    throw new Error(`No default threshold found for sensor type: ${sensorType}`);
  }
  return threshold;
}

/**
 * Determine the value status based on the current value and thresholds.
 * Returns 'normal', 'approaching' (within warning zone), or 'exceeded' (critical).
 * @param value - Current sensor value
 * @param threshold - Threshold configuration for the sensor
 * @returns The value status: 'normal', 'approaching', or 'exceeded'
 */
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

/**
 * Calculate the percentage of how close a value is to its critical threshold.
 * Returns 0-100 where 100 means at or beyond the critical threshold.
 * @param value - Current sensor value
 * @param threshold - Threshold configuration for the sensor
 * @returns Percentage (0-100) of threshold proximity
 */
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
