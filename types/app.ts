import { MaterialCommunityIcons } from '@expo/vector-icons';

export type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type SystemStatus = 'normal' | 'warning' | 'critical';

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label: string;
  isAnomaly: boolean;
}

export interface StatsSummary {
  min: number;
  max: number;
  average: number;
  standardDeviation: number;
  count: number;
}

export type TimePeriod = '1h' | '6h' | '24h' | '7d' | '30d';

export const TIME_PERIOD_MS: Record<TimePeriod, number> = {
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};
