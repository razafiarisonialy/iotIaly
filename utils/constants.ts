
import type { SensorType, SensorUnit } from '@/types';





export const APP_NAME = 'IoT Aly';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION =
  'Application IoT/AIoT intelligente avec simulation de capteurs et IA embarquée';





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

export const SENSOR_ICONS: Record<SensorType, string> = {
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





export const DEFAULT_SIMULATION_INTERVAL_MS = 3000;

export const ANOMALY_INJECTION_RATE = 0.05;

export const MAX_READINGS_IN_MEMORY = 200;

export const SPARKLINE_POINTS = 20;





export const ANOMALY_WINDOW_SIZE = 30;

export const ANOMALY_Z_THRESHOLD = 2.5;

export const PREDICTION_WINDOW_SIZE = 20;

export const PREDICTION_MINUTES_AHEAD = 10;





export const WEATHER_API_BASE_URL =
  'https://api.openweathermap.org/data/2.5/weather';

export const DEFAULT_WEATHER_CITY = 'Antananarivo';

export const WEATHER_CACHE_DURATION_MS = 5 * 60 * 1000;

export const WEATHER_API_TIMEOUT_MS = 10000;





export const DATABASE_NAME = 'iot_aiot_app.db';

export const DATABASE_VERSION = 1;

export const MAX_QUERY_LIMIT = 1000;





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

export type ColorPalette = Omit<typeof COLORS_LIGHT, 'statusBarStyle'> & {
  statusBarStyle: 'light' | 'dark';
};

export const SENSOR_COLORS: Record<SensorType, string> = {
  temperature: '#FF6B6B',
  humidity: '#4ECDC4',
  motion: '#FFE66D',
  energy: '#A78BFA',
  air_quality: '#6BCB77',
};

export const SEVERITY_COLORS: Record<string, string> = {
  info: '#5AC8FA',
  warning: '#FF9500',
  critical: '#FF3B30',
};

export const STATUS_COLORS: Record<string, string> = {
  normal: '#34C759',
  approaching: '#FF9500',
  exceeded: '#FF3B30',
};





export const NORMAL_MOTION_START_HOUR = 8;
export const NORMAL_MOTION_END_HOUR = 22;





export const TIME_PERIOD_LABELS: Record<string, string> = {
  '1h': '1 heure',
  '6h': '6 heures',
  '24h': '24 heures',
  '7d': '7 jours',
  '30d': '30 jours',
};
