/**
 * Application-wide constants for the IoT/AIoT app.
 * Centralized configuration values used across all modules.
 */

import type { SensorType, SensorUnit } from '@/types';

// =============================================================================
// Application Info
// =============================================================================

export const APP_NAME = 'IoT Aly';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION =
  'Application IoT/AIoT intelligente avec simulation de capteurs et IA embarquée';

// =============================================================================
// Sensor Configuration
// =============================================================================

/** All available sensor types in display order */
export const SENSOR_TYPES: SensorType[] = [
  'temperature',
  'humidity',
  'energy',
  'motion',
  'air_quality',
];

/** Human-readable labels for each sensor type */
export const SENSOR_LABELS: Record<SensorType, string> = {
  temperature: 'Température',
  humidity: 'Humidité',
  motion: 'Mouvement',
  energy: 'Énergie',
  air_quality: 'Qualité Air',
};

/** Icon names from MaterialCommunityIcons for each sensor */
export const SENSOR_ICONS: Record<SensorType, string> = {
  temperature: 'thermometer',
  humidity: 'water-percent',
  motion: 'motion-sensor',
  energy: 'flash',
  air_quality: 'air-filter',
};

/** Units for each sensor type */
export const SENSOR_UNIT_MAP: Record<SensorType, SensorUnit> = {
  temperature: '°C',
  humidity: '%',
  motion: 'bool',
  energy: 'kWh',
  air_quality: 'AQI',
};

// =============================================================================
// Simulation Parameters
// =============================================================================

/** Default simulation interval in milliseconds */
export const DEFAULT_SIMULATION_INTERVAL_MS = 3000;

/** Probability of injecting an anomaly (5%) */
export const ANOMALY_INJECTION_RATE = 0.05;

/** Number of readings to keep in memory for charts */
export const MAX_READINGS_IN_MEMORY = 200;

/** Number of readings displayed on dashboard sparkline */
export const SPARKLINE_POINTS = 20;

// =============================================================================
// AI Engine Parameters
// =============================================================================

/** Window size for Z-Score anomaly detection */
export const ANOMALY_WINDOW_SIZE = 30;

/** Z-Score threshold for anomaly detection */
export const ANOMALY_Z_THRESHOLD = 2.5;

/** Number of readings for linear regression prediction */
export const PREDICTION_WINDOW_SIZE = 20;

/** Minutes ahead for prediction */
export const PREDICTION_MINUTES_AHEAD = 10;

// =============================================================================
// Weather API
// =============================================================================

/** OpenWeatherMap API base URL */
export const WEATHER_API_BASE_URL =
  'https://api.openweathermap.org/data/2.5/weather';

/** Default city for weather queries */
export const DEFAULT_WEATHER_CITY = 'Antananarivo';

/** Weather cache duration in milliseconds (5 minutes) */
export const WEATHER_CACHE_DURATION_MS = 5 * 60 * 1000;

/** Weather API request timeout in milliseconds */
export const WEATHER_API_TIMEOUT_MS = 10000;

// =============================================================================
// Database
// =============================================================================

/** SQLite database file name */
export const DATABASE_NAME = 'iot_aiot_app.db';

/** Current database schema version */
export const DATABASE_VERSION = 1;

/** Maximum number of readings to return in a single query */
export const MAX_QUERY_LIMIT = 1000;

// =============================================================================
// UI / Theme Colors
// =============================================================================

/** Color palette for light theme */
export const COLORS_LIGHT = {
  primary: '#0A84FF',
  primaryDark: '#0066CC',
  secondary: '#5856D6',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#AEAEB2',
  border: '#E5E5EA',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',
  cardBackground: '#FFFFFF',
  chartLine: '#0A84FF',
  chartGrid: '#E5E5EA',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5E5EA',
  headerBackground: '#F2F2F7',
  statusBarStyle: 'dark' as const,
};

/** Color palette for dark theme */
export const COLORS_DARK = {
  primary: '#0A84FF',
  primaryDark: '#409CFF',
  secondary: '#5E5CE6',
  background: '#000000',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#98989D',
  textTertiary: '#636366',
  border: '#38383A',
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',
  info: '#64D2FF',
  cardBackground: '#1C1C1E',
  chartLine: '#0A84FF',
  chartGrid: '#38383A',
  tabBarBackground: '#1C1C1E',
  tabBarBorder: '#38383A',
  headerBackground: '#000000',
  statusBarStyle: 'light' as const,
};

/** Type for the color palette */
export type ColorPalette = Omit<typeof COLORS_LIGHT, 'statusBarStyle'> & {
  statusBarStyle: 'light' | 'dark';
};

/** Colors for each sensor type (used in charts and cards) */
export const SENSOR_COLORS: Record<SensorType, string> = {
  temperature: '#FF6B6B',
  humidity: '#4ECDC4',
  motion: '#FFE66D',
  energy: '#A78BFA',
  air_quality: '#6BCB77',
};

/** Colors for severity levels */
export const SEVERITY_COLORS: Record<string, string> = {
  info: '#5AC8FA',
  warning: '#FF9500',
  critical: '#FF3B30',
};

/** Colors for value status */
export const STATUS_COLORS: Record<string, string> = {
  normal: '#34C759',
  approaching: '#FF9500',
  exceeded: '#FF3B30',
};

// =============================================================================
// Motion Detection Hours
// =============================================================================

/** Hours considered "normal" for motion (8 AM to 10 PM) */
export const NORMAL_MOTION_START_HOUR = 8;
export const NORMAL_MOTION_END_HOUR = 22;

// =============================================================================
// Time Periods for History
// =============================================================================

export const TIME_PERIOD_LABELS: Record<string, string> = {
  '1h': '1 heure',
  '6h': '6 heures',
  '24h': '24 heures',
  '7d': '7 jours',
  '30d': '30 jours',
};
