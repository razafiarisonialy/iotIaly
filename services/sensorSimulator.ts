import type { SensorType, SensorUnit } from '@/types';
import {
  SENSOR_UNIT_MAP,
  ANOMALY_INJECTION_RATE,
} from '@/utils/constants';
import { gaussianRandom, clamp, roundTo } from '@/utils/helpers';

export interface SimulatedReading {
  sensorType: SensorType;
  value: number;
  unit: SensorUnit;
  isAnomaly: boolean;
}

const previousValues: Record<SensorType, number> = {
  temperature: 22,
  humidity: 55,
  motion: 0,
  energy: 1.5,
  air_quality: 50,
};

function simulateTemperature(injectAnomaly: boolean): number {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  const baseTemp = 24 + 6 * Math.sin(((hour - 8) / 24) * 2 * Math.PI);

  const noise = gaussianRandom(0, 0.5);
  let value = baseTemp + noise;

  value = 0.7 * value + 0.3 * previousValues.temperature;

  if (injectAnomaly) {
    
    const spike = Math.random() > 0.5 ? 1 : -1;
    value += spike * (10 + Math.random() * 5);
  }

  value = clamp(roundTo(value, 1), -10, 50);
  previousValues.temperature = value;
  return value;
}

function simulateHumidity(
  currentTemp: number,
  injectAnomaly: boolean
): number {
  
  const baseHumidity = 90 - (currentTemp - 15) * 2.5;

  const noise = gaussianRandom(0, 2);
  let value = baseHumidity + noise;

  value = 0.7 * value + 0.3 * previousValues.humidity;

  if (injectAnomaly) {
    
    value = Math.random() > 0.5 ? 95 + Math.random() * 5 : 10 + Math.random() * 10;
  }

  value = clamp(roundTo(value, 0), 10, 100);
  previousValues.humidity = value;
  return value;
}

function simulateMotion(injectAnomaly: boolean): number {
  const hour = new Date().getHours();

  let probability: number;
  if (hour >= 8 && hour <= 22) {
    probability = 0.3; 
  } else if (hour >= 23 || hour <= 5) {
    probability = 0.02; 
  } else {
    probability = 0.1; 
  }

  if (injectAnomaly) {
    
    return 1;
  }

  return Math.random() < probability ? 1 : 0;
}

function simulateEnergy(injectAnomaly: boolean): number {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  let baseEnergy = 0.8; 

  if (hour >= 6 && hour <= 10) {
    const peakFactor = 1 - Math.abs(hour - 8) / 2;
    baseEnergy += 2.5 * Math.max(0, peakFactor);
  }

  if (hour >= 17 && hour <= 22) {
    const peakFactor = 1 - Math.abs(hour - 19.5) / 2.5;
    baseEnergy += 3.0 * Math.max(0, peakFactor);
  }

  if (hour >= 23 || hour <= 5) {
    baseEnergy *= 0.4;
  }

  const noise = gaussianRandom(0, 0.2);
  let value = baseEnergy + noise;

  value = 0.6 * value + 0.4 * previousValues.energy;

  if (injectAnomaly) {
    
    value = 5.5 + Math.random() * 2;
  }

  value = clamp(roundTo(value, 2), 0, 10);
  previousValues.energy = value;
  return value;
}

function simulateAirQuality(injectAnomaly: boolean): number {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const dayOfWeek = now.getDay(); 
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let baseAQI = isWeekend ? 35 : 55;

  if (hour >= 7 && hour <= 10) {
    baseAQI += 30 * Math.max(0, 1 - Math.abs(hour - 8.5) / 1.5);
  }
  if (hour >= 16 && hour <= 20) {
    baseAQI += 25 * Math.max(0, 1 - Math.abs(hour - 18) / 2);
  }

  if (hour >= 22 || hour <= 5) {
    baseAQI *= 0.6;
  }

  const noise = gaussianRandom(0, 5);
  let value = baseAQI + noise;

  value = 0.7 * value + 0.3 * previousValues.air_quality;

  if (injectAnomaly) {
    
    value = 250 + Math.random() * 200;
  }

  value = clamp(roundTo(value, 0), 0, 500);
  previousValues.air_quality = value;
  return value;
}

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

export function generateAllReadings(): SimulatedReading[] {
  
  const tempReading = generateReading('temperature');

  return [
    tempReading,
    generateReading('humidity'),
    generateReading('motion'),
    generateReading('energy'),
    generateReading('air_quality'),
  ];
}

export function resetSimulation(): void {
  previousValues.temperature = 22;
  previousValues.humidity = 55;
  previousValues.motion = 0;
  previousValues.energy = 1.5;
  previousValues.air_quality = 50;
}
