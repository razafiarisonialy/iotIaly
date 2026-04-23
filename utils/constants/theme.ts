import type { SensorType } from '@/types';

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
