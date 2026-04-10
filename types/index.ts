




export type SensorType =
  | 'temperature'
  | 'humidity'
  | 'motion'
  | 'energy'
  | 'air_quality';

export type SensorUnit = '°C' | '%' | 'bool' | 'kWh' | 'AQI';

export const SENSOR_UNITS: Record<SensorType, SensorUnit> = {
  temperature: '°C',
  humidity: '%',
  motion: 'bool',
  energy: 'kWh',
  air_quality: 'AQI',
};





export interface SensorReading {
  id: number;
  sensorType: SensorType;
  value: number;
  unit: SensorUnit;
  timestamp: string; 
  isAnomaly: boolean;
}

export interface SensorReadingRow {
  id: number;
  sensor_type: string;
  value: number;
  unit: string;
  timestamp: string;
  is_anomaly: number; 
}

export interface Alert {
  id: number;
  sensorType: SensorType;
  message: string;
  severity: SeverityLevel;
  timestamp: string; 
  acknowledged: boolean;
}

export interface AlertRow {
  id: number;
  sensor_type: string;
  message: string;
  severity: string;
  timestamp: string;
  acknowledged: number; 
}

export interface Setting {
  id: number;
  key: string;
  value: string;
}





export type SeverityLevel = 'info' | 'warning' | 'critical';

export type SystemStatus = 'normal' | 'warning' | 'critical';

export type ValueStatus = 'normal' | 'approaching' | 'exceeded';





export interface SensorState {
  type: SensorType;
  currentValue: number;
  unit: SensorUnit;
  status: ValueStatus;
  trend: TrendDirection;
  lastUpdated: string;
  history: SensorReading[];
}

export type TrendDirection = 'rising' | 'falling' | 'stable';





export interface ThresholdConfig {
  sensorType: SensorType;
  minWarning: number;
  maxWarning: number;
  minCritical: number;
  maxCritical: number;
  label: string;
  unit: SensorUnit;
}





export interface AnomalyResult {
  isAnomaly: boolean;
  zScore: number;
  mean: number;
  standardDeviation: number;
  value: number;
}

export interface PredictionResult {
  predictedValue: number;
  trend: TrendDirection;
  slope: number;
  confidence: number; 
  minutesAhead: number;
}

export interface RuleEvaluationResult {
  triggered: boolean;
  message: string;
  severity: SeverityLevel;
  action: string;
}





export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  city: string;
  country: string;
  windSpeed: number;
  feelsLike: number;
  timestamp: string;
}

export interface OpenWeatherMapResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
  sys: {
    country: string;
  };
}





export type SimulationSpeed = 'fast' | 'normal' | 'slow';

export const SIMULATION_INTERVALS: Record<SimulationSpeed, number> = {
  fast: 2000,
  normal: 3000,
  slow: 5000,
};

export interface AppSettings {
  isDarkMode: boolean;
  alertsEnabled: boolean;
  simulationSpeed: SimulationSpeed;
  useRealWeather: boolean;
  weatherApiKey: string;
  weatherCity: string;
}

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
