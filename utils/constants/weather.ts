import Constants from 'expo-constants';

const _extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;
const _weatherBase = _extra.weatherUrl ?? 'https://api.openweathermap.org';

export const WEATHER_API_BASE_URL = `${_weatherBase}/data/2.5/weather`;

export const WEATHER_FORECAST_URL = `${_weatherBase}/data/2.5/forecast`;

export const WEATHER_GEOCODING_URL = `${_weatherBase}/geo/1.0/direct`;

export const WEATHER_ICON_BASE_URL = 'https://openweathermap.org/img/wn/';

export const DEFAULT_WEATHER_CITY = _extra.defaultWeatherCity ?? 'Antananarivo';

export const WEATHER_CACHE_DURATION_MS = 5 * 60 * 1000;

export const WEATHER_API_TIMEOUT_MS = 10000;
