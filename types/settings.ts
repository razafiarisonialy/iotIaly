export type SimulationSpeed = 'fast' | 'normal' | 'slow';

export const SIMULATION_INTERVALS: Record<SimulationSpeed, number> = {
  fast: 2000,
  normal: 3000,
  slow: 5000,
};

export interface Setting {
  id: number;
  key: string;
  value: string;
}

export interface AppSettings {
  isDarkMode: boolean;
  alertsEnabled: boolean;
  simulationSpeed: SimulationSpeed;
  useRealWeather: boolean;
  weatherCity: string;
  weatherCities: string[];
}
