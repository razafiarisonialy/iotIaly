import Constants from 'expo-constants';

export const APP_NAME = 'IALY IOT';
export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
export const APP_DESCRIPTION =
  'Application IoT/AIoT intelligente avec simulation de capteurs et IA embarquée';

export const DEFAULT_SIMULATION_INTERVAL_MS = 3000;
export const MAX_READINGS_IN_MEMORY = 200;
export const SPARKLINE_POINTS = 20;

export const TIME_PERIOD_LABELS: Record<string, string> = {
  '1h': '1 heure',
  '6h': '6 heures',
  '24h': '24 heures',
  '7d': '7 jours',
  '30d': '30 jours',
};
