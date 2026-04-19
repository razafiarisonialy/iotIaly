import type { SensorType } from '@/types';
import { roundTo } from './math';

export function formatSensorValue(
  value: number,
  sensorType: SensorType
): string {
  switch (sensorType) {
    case 'motion':
      return value >= 0.5 ? 'Oui' : 'Non';
    case 'temperature':
      return roundTo(value, 1).toString();
    case 'humidity':
      return roundTo(value, 0).toString();
    case 'energy':
      return roundTo(value, 2).toString();
    case 'air_quality':
      return roundTo(value, 0).toString();
  }
}

export function getStatusLabel(sensorType: SensorType, value: number): string {
  switch (sensorType) {
    case 'temperature':
      if (value < 5) return 'Très froid';
      if (value < 18) return 'Frais';
      if (value < 25) return 'Confortable';
      if (value < 30) return 'Chaud';
      return 'Très chaud';
    case 'humidity':
      if (value < 30) return 'Sec';
      if (value < 60) return 'Confortable';
      if (value < 80) return 'Humide';
      return 'Très humide';
    case 'motion':
      return value >= 0.5 ? 'Mouvement détecté' : 'Aucun mouvement';
    case 'energy':
      if (value < 1) return 'Faible';
      if (value < 3) return 'Normal';
      if (value < 5) return 'Élevé';
      return 'Très élevé';
    case 'air_quality':
      if (value < 50) return 'Bon';
      if (value < 100) return 'Modéré';
      if (value < 150) return 'Mauvais';
      if (value < 200) return 'Très mauvais';
      return 'Dangereux';
  }
}

export function isValidSensorType(value: string): value is SensorType {
  return ['temperature', 'humidity', 'motion', 'energy', 'air_quality'].includes(
    value
  );
}

export function isValidSensorValue(
  value: number,
  sensorType: SensorType
): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false;
  switch (sensorType) {
    case 'temperature':
      return value >= -50 && value <= 60;
    case 'humidity':
      return value >= 0 && value <= 100;
    case 'motion':
      return value === 0 || value === 1;
    case 'energy':
      return value >= 0 && value <= 100;
    case 'air_quality':
      return value >= 0 && value <= 500;
  }
}

export function sanitizeString(input: string): string {
  return input.replace(/['";\-\-]/g, '').trim();
}
