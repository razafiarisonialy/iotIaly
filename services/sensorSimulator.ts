/**
 * IoT Sensor Simulator — generates realistic sensor data.
 *
 * Simulates 5 sensor types with realistic temporal patterns:
 * - Temperature: sinusoidal daily cycle (18-35°C) + Gaussian noise
 * - Humidity: inversely correlated to temperature (30-90%)
 * - Motion: time-dependent probability (higher during work hours)
 * - Energy: daily pattern with morning/evening peaks (0-6 kWh)
 * - Air Quality: AQI (0-500) with urban patterns
 *
 * Anomalies are injected at a configurable rate (default 5%).
 */

import type { SensorType, SensorUnit } from '@/types';
import {
  SENSOR_UNIT_MAP,
  ANOMALY_INJECTION_RATE,
} from '@/utils/constants';
import { gaussianRandom, clamp, roundTo } from '@/utils/helpers';

/** Result of a single sensor simulation tick */
export interface SimulatedReading {
  sensorType: SensorType;
  value: number;
  unit: SensorUnit;
  isAnomaly: boolean;
}

// =============================================================================
// Internal State
// =============================================================================

/** Running averages for smooth transitions between values */
const previousValues: Record<SensorType, number> = {
  temperature: 22,
  humidity: 55,
  motion: 0,
  energy: 1.5,
  air_quality: 50,
};

// =============================================================================
// Temperature Simulation
// =============================================================================

/**
 * Simulate temperature with sinusoidal daily cycle and Gaussian noise.
 * Temperature peaks at 14:00 and troughs at 04:00.
 * Range: 18°C - 35°C.
 *
 * @param injectAnomaly - Whether to inject an anomaly
 * @returns Simulated temperature value
 */
function simulateTemperature(injectAnomaly: boolean): number {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  // Sinusoidal pattern: peak at 14:00, trough at 02:00
  const baseTemp = 24 + 6 * Math.sin(((hour - 8) / 24) * 2 * Math.PI);

  // Add Gaussian noise (σ = 0.5°C)
  const noise = gaussianRandom(0, 0.5);
  let value = baseTemp + noise;

  // Smooth transition from previous value (70% new, 30% old)
  value = 0.7 * value + 0.3 * previousValues.temperature;

  if (injectAnomaly) {
    // Anomaly: sudden spike or drop of 10-15°C
    const spike = Math.random() > 0.5 ? 1 : -1;
    value += spike * (10 + Math.random() * 5);
  }

  value = clamp(roundTo(value, 1), -10, 50);
  previousValues.temperature = value;
  return value;
}

// =============================================================================
// Humidity Simulation
// =============================================================================

/**
 * Simulate humidity inversely correlated with temperature.
 * Higher humidity at night, lower during warm afternoons.
 * Range: 30% - 90%.
 *
 * @param currentTemp - Current temperature for inverse correlation
 * @param injectAnomaly - Whether to inject an anomaly
 * @returns Simulated humidity value
 */
function simulateHumidity(
  currentTemp: number,
  injectAnomaly: boolean
): number {
  // Inverse correlation: higher temp = lower humidity
  const baseHumidity = 90 - (currentTemp - 15) * 2.5;

  // Add noise
  const noise = gaussianRandom(0, 2);
  let value = baseHumidity + noise;

  // Smooth transition
  value = 0.7 * value + 0.3 * previousValues.humidity;

  if (injectAnomaly) {
    // Anomaly: sudden jump to extreme humidity
    value = Math.random() > 0.5 ? 95 + Math.random() * 5 : 10 + Math.random() * 10;
  }

  value = clamp(roundTo(value, 0), 10, 100);
  previousValues.humidity = value;
  return value;
}

// =============================================================================
// Motion Simulation
// =============================================================================

/**
 * Simulate motion detection with time-dependent probability.
 * Higher probability during work hours (8:00-22:00).
 * Late night motion has very low probability (potential intrusion).
 *
 * @param injectAnomaly - Whether to inject an anomaly
 * @returns 0 (no motion) or 1 (motion detected)
 */
function simulateMotion(injectAnomaly: boolean): number {
  const hour = new Date().getHours();

  let probability: number;
  if (hour >= 8 && hour <= 22) {
    probability = 0.3; // 30% chance during day
  } else if (hour >= 23 || hour <= 5) {
    probability = 0.02; // 2% chance at night (rare)
  } else {
    probability = 0.1; // 10% early morning / late evening
  }

  if (injectAnomaly) {
    // Anomaly: forced motion detection at unusual time
    return 1;
  }

  return Math.random() < probability ? 1 : 0;
}

// =============================================================================
// Energy Simulation
// =============================================================================

/**
 * Simulate energy consumption with daily pattern.
 * Morning peak (7:00-9:00), evening peak (18:00-21:00), low at night.
 * Range: 0.2 - 6.0 kWh.
 *
 * @param injectAnomaly - Whether to inject an anomaly
 * @returns Simulated energy consumption value
 */
function simulateEnergy(injectAnomaly: boolean): number {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  // Base consumption with two peaks
  let baseEnergy = 0.8; // Baseline

  // Morning peak (7:00-9:00)
  if (hour >= 6 && hour <= 10) {
    const peakFactor = 1 - Math.abs(hour - 8) / 2;
    baseEnergy += 2.5 * Math.max(0, peakFactor);
  }

  // Evening peak (18:00-21:00)
  if (hour >= 17 && hour <= 22) {
    const peakFactor = 1 - Math.abs(hour - 19.5) / 2.5;
    baseEnergy += 3.0 * Math.max(0, peakFactor);
  }

  // Night reduction (23:00-5:00)
  if (hour >= 23 || hour <= 5) {
    baseEnergy *= 0.4;
  }

  // Add noise
  const noise = gaussianRandom(0, 0.2);
  let value = baseEnergy + noise;

  // Smooth transition
  value = 0.6 * value + 0.4 * previousValues.energy;

  if (injectAnomaly) {
    // Anomaly: sudden energy spike (double normal peak)
    value = 5.5 + Math.random() * 2;
  }

  value = clamp(roundTo(value, 2), 0, 10);
  previousValues.energy = value;
  return value;
}

// =============================================================================
// Air Quality Simulation
// =============================================================================

/**
 * Simulate Air Quality Index (AQI) with urban patterns.
 * Higher during rush hours, lower at night and weekends.
 * Range: 0-500 (0 = Good, 500 = Hazardous).
 *
 * @param injectAnomaly - Whether to inject an anomaly
 * @returns Simulated AQI value
 */
function simulateAirQuality(injectAnomaly: boolean): number {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Base AQI
  let baseAQI = isWeekend ? 35 : 55;

  // Rush hour pollution (8:00-10:00, 17:00-19:00)
  if (hour >= 7 && hour <= 10) {
    baseAQI += 30 * Math.max(0, 1 - Math.abs(hour - 8.5) / 1.5);
  }
  if (hour >= 16 && hour <= 20) {
    baseAQI += 25 * Math.max(0, 1 - Math.abs(hour - 18) / 2);
  }

  // Night improvement
  if (hour >= 22 || hour <= 5) {
    baseAQI *= 0.6;
  }

  // Add noise
  const noise = gaussianRandom(0, 5);
  let value = baseAQI + noise;

  // Smooth transition
  value = 0.7 * value + 0.3 * previousValues.air_quality;

  if (injectAnomaly) {
    // Anomaly: pollution spike
    value = 250 + Math.random() * 200;
  }

  value = clamp(roundTo(value, 0), 0, 500);
  previousValues.air_quality = value;
  return value;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Generate a single simulated reading for a specific sensor type.
 * @param sensorType - The type of sensor to simulate
 * @returns A simulated reading with value, unit, and anomaly flag
 */
export function generateReading(sensorType: SensorType): SimulatedReading {
  const injectAnomaly = Math.random() < ANOMALY_INJECTION_RATE;
  let value: number;

  switch (sensorType) {
    case 'temperature':
      value = simulateTemperature(injectAnomaly);
      break;
    case 'humidity':
      value = simulateHumidity(previousValues.temperature, injectAnomaly);
      break;
    case 'motion':
      value = simulateMotion(injectAnomaly);
      break;
    case 'energy':
      value = simulateEnergy(injectAnomaly);
      break;
    case 'air_quality':
      value = simulateAirQuality(injectAnomaly);
      break;
  }

  return {
    sensorType,
    value,
    unit: SENSOR_UNIT_MAP[sensorType],
    isAnomaly: injectAnomaly,
  };
}

/**
 * Generate simulated readings for ALL sensor types at once.
 * Temperature is generated first since humidity depends on it.
 * @returns Array of simulated readings for all sensor types
 */
export function generateAllReadings(): SimulatedReading[] {
  // Temperature first because humidity depends on it
  const tempReading = generateReading('temperature');

  return [
    tempReading,
    generateReading('humidity'),
    generateReading('motion'),
    generateReading('energy'),
    generateReading('air_quality'),
  ];
}

/**
 * Reset simulation state to initial values.
 * Useful when restarting the simulation.
 */
export function resetSimulation(): void {
  previousValues.temperature = 22;
  previousValues.humidity = 55;
  previousValues.motion = 0;
  previousValues.energy = 1.5;
  previousValues.air_quality = 50;
}
