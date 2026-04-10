/**
 * Utility helper functions used across the IoT/AIoT application.
 * Includes date formatting, data conversion, validation, and math utilities.
 */

import { format, formatDistanceToNow, parseISO, subHours, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import type {
  SensorReading,
  SensorReadingRow,
  Alert,
  AlertRow,
  TimePeriod,
  StatsSummary,
  SensorType,
  SeverityLevel,
} from '@/types';

// =============================================================================
// Date Formatting
// =============================================================================

/**
 * Format a date to a localized short datetime string.
 * @param dateString - ISO 8601 date string
 * @returns Formatted string like "10 avr. 2026, 14:30"
 */
export function formatDateTime(dateString: string): string {
  return format(parseISO(dateString), 'dd MMM yyyy, HH:mm', { locale: fr });
}

/**
 * Format a date to time only.
 * @param dateString - ISO 8601 date string
 * @returns Formatted string like "14:30:45"
 */
export function formatTime(dateString: string): string {
  return format(parseISO(dateString), 'HH:mm:ss');
}

/**
 * Format a date to a short time for chart labels.
 * @param dateString - ISO 8601 date string
 * @returns Formatted string like "14:30"
 */
export function formatChartTime(dateString: string): string {
  return format(parseISO(dateString), 'HH:mm');
}

/**
 * Get a human-readable relative time string.
 * @param dateString - ISO 8601 date string
 * @returns String like "il y a 5 minutes"
 */
export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), {
    addSuffix: true,
    locale: fr,
  });
}

/**
 * Get the current date/time as an ISO 8601 string.
 * @returns Current ISO timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Get the start date for a given time period from now.
 * @param period - Time period to go back
 * @returns ISO timestamp string for the start of the period
 */
export function getStartDateForPeriod(period: TimePeriod): string {
  const now = new Date();
  switch (period) {
    case '1h':
      return subHours(now, 1).toISOString();
    case '6h':
      return subHours(now, 6).toISOString();
    case '24h':
      return subHours(now, 24).toISOString();
    case '7d':
      return subDays(now, 7).toISOString();
    case '30d':
      return subDays(now, 30).toISOString();
  }
}

// =============================================================================
// Database Row Mapping
// =============================================================================

/**
 * Convert a SQLite row to a SensorReading object.
 * Maps snake_case columns to camelCase properties.
 * @param row - Raw SQLite row
 * @returns Typed SensorReading object
 */
export function mapRowToSensorReading(row: SensorReadingRow): SensorReading {
  return {
    id: row.id,
    sensorType: row.sensor_type as SensorType,
    value: row.value,
    unit: row.unit as SensorReading['unit'],
    timestamp: row.timestamp,
    isAnomaly: row.is_anomaly === 1,
  };
}

/**
 * Convert a SQLite row to an Alert object.
 * Maps snake_case columns to camelCase properties.
 * @param row - Raw SQLite row
 * @returns Typed Alert object
 */
export function mapRowToAlert(row: AlertRow): Alert {
  return {
    id: row.id,
    sensorType: row.sensor_type as SensorType,
    message: row.message,
    severity: row.severity as SeverityLevel,
    timestamp: row.timestamp,
    acknowledged: row.acknowledged === 1,
  };
}

// =============================================================================
// Math Utilities
// =============================================================================

/**
 * Clamp a number between a minimum and maximum value.
 * @param value - The value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round a number to a specified number of decimal places.
 * @param value - The value to round
 * @param decimals - Number of decimal places (default: 1)
 * @returns Rounded value
 */
export function roundTo(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Generate a random number following a Gaussian distribution using Box-Muller.
 * @param mean - Mean of the distribution
 * @param stdDev - Standard deviation
 * @returns Random number from Gaussian distribution
 */
export function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Calculate statistics summary for an array of numbers.
 * @param values - Array of numeric values
 * @returns Statistical summary (min, max, average, stdDev, count)
 */
export function calculateStats(values: number[]): StatsSummary {
  if (values.length === 0) {
    return { min: 0, max: 0, average: 0, standardDeviation: 0, count: 0 };
  }

  const count = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const average = sum / count;

  const squaredDiffs = values.map((val) => Math.pow(val - average, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((acc, val) => acc + val, 0) / count;
  const standardDeviation = Math.sqrt(avgSquaredDiff);

  return {
    min: roundTo(min, 2),
    max: roundTo(max, 2),
    average: roundTo(average, 2),
    standardDeviation: roundTo(standardDeviation, 2),
    count,
  };
}

// =============================================================================
// Value Formatting
// =============================================================================

/**
 * Format a sensor value for display with appropriate precision.
 * Motion sensor shows "Oui"/"Non" instead of numbers.
 * @param value - The sensor value
 * @param sensorType - The type of sensor
 * @returns Formatted display string
 */
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

/**
 * Get a descriptive label for a sensor value status.
 * @param sensorType - Type of sensor
 * @param value - Current value
 * @returns Human-readable status description
 */
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

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate that a string is a valid sensor type.
 * @param value - String to validate
 * @returns True if the string is a valid SensorType
 */
export function isValidSensorType(value: string): value is SensorType {
  return ['temperature', 'humidity', 'motion', 'energy', 'air_quality'].includes(
    value
  );
}

/**
 * Validate that a number is within a reasonable range for a sensor type.
 * @param value - Value to validate
 * @param sensorType - Type of sensor
 * @returns True if the value is within acceptable range
 */
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

/**
 * Sanitize a string for safe SQLite insertion.
 * @param input - Raw string input
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input.replace(/['";\-\-]/g, '').trim();
}

// =============================================================================
// CSV Generation
// =============================================================================

/**
 * Convert an array of sensor readings to CSV format.
 * @param readings - Array of sensor readings
 * @returns CSV string with headers
 */
export function readingsToCSV(readings: SensorReading[]): string {
  const headers = 'ID,Capteur,Valeur,Unité,Date/Heure,Anomalie\n';
  const rows = readings
    .map(
      (r) =>
        `${r.id},${r.sensorType},${r.value},${r.unit},${r.timestamp},${r.isAnomaly ? 'Oui' : 'Non'}`
    )
    .join('\n');
  return headers + rows;
}

/**
 * Convert an array of alerts to CSV format.
 * @param alerts - Array of alerts
 * @returns CSV string with headers
 */
export function alertsToCSV(alerts: Alert[]): string {
  const headers = 'ID,Capteur,Message,Sévérité,Date/Heure,Acquittée\n';
  const rows = alerts
    .map(
      (a) =>
        `${a.id},${a.sensorType},"${a.message}",${a.severity},${a.timestamp},${a.acknowledged ? 'Oui' : 'Non'}`
    )
    .join('\n');
  return headers + rows;
}
