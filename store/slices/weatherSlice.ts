import type { StoreSlice } from '../types';
import type { WeatherData, ForecastItem } from '@/types';
import Constants from 'expo-constants';

const _envExtra = Constants.expoConfig?.extra as Record<string, string> | undefined;

export interface WeatherSlice {
  useRealWeather: boolean;
  weatherCity: string;
  weatherData: WeatherData | null;
  weatherForecast: ForecastItem[] | null;
  weatherCities: string[];
  activeWeatherCity: string;

  setUseRealWeather: (use: boolean) => void;
  setWeatherCity: (city: string) => void;
  setWeatherData: (data: WeatherData | null) => void;
  setWeatherForecast: (forecast: ForecastItem[] | null) => void;
  setWeatherCities: (cities: string[]) => void;
  addWeatherCity: (city: string) => void;
  removeWeatherCity: (city: string) => void;
  setActiveWeatherCity: (city: string) => void;
}

export const createWeatherSlice: StoreSlice<WeatherSlice> = (set, get) => ({
  useRealWeather: false,
  weatherCity: 'Antananarivo',

  weatherData: null,
  weatherForecast: null,
  weatherCities: [],
  activeWeatherCity: 'Antananarivo',

  setUseRealWeather: (use) => set({ useRealWeather: use }),
  setWeatherCity: (city) => set({ weatherCity: city }),

  setWeatherData: (data) => set({ weatherData: data }),
  setWeatherForecast: (forecast) => set({ weatherForecast: forecast }),
  setWeatherCities: (cities) => set({ weatherCities: cities }),
  addWeatherCity: (city) =>
    set((state: any) => ({
      weatherCities: state.weatherCities.includes(city)
        ? state.weatherCities
        : [...state.weatherCities, city],
    })),
  removeWeatherCity: (city) =>
    set((state: any) => ({
      weatherCities: state.weatherCities.filter((c: string) => c !== city),
    })),
  setActiveWeatherCity: (city) => set({ activeWeatherCity: city }),
});
