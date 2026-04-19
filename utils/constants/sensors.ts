import type { MaterialIconName, SensorType, SensorUnit } from '@/types';

export const SENSOR_TYPES: SensorType[] = [
  'temperature',
  'humidity',
  'energy',
  'motion',
  'air_quality',
];

export const SENSOR_LABELS: Record<SensorType, string> = {
  temperature: 'Température',
  humidity: 'Humidité',
  motion: 'Mouvement',
  energy: 'Énergie',
  air_quality: 'Qualité Air',
};

export const SENSOR_ICONS: Record<SensorType, MaterialIconName> = {
  temperature: 'thermometer',
  humidity: 'water-percent',
  motion: 'motion-sensor',
  energy: 'flash',
  air_quality: 'air-filter',
};

export const SENSOR_UNIT_MAP: Record<SensorType, SensorUnit> = {
  temperature: '°C',
  humidity: '%',
  motion: 'bool',
  energy: 'kWh',
  air_quality: 'AQI',
};

export const NORMAL_MOTION_START_HOUR = 8;
export const NORMAL_MOTION_END_HOUR = 22;
