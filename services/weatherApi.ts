import type {
  ForecastItem,
  OpenWeatherMapForecastResponse,
  OpenWeatherMapResponse,
  WeatherData,
} from '@/types';
import {
  DEFAULT_WEATHER_CITY,
  WEATHER_API_BASE_URL,
  WEATHER_API_TIMEOUT_MS,
  WEATHER_CACHE_DURATION_MS,
  WEATHER_FORECAST_URL,
  WEATHER_GEOCODING_URL,
  WEATHER_ICON_BASE_URL,
} from '@/utils/constants';
import Constants from 'expo-constants';

export interface GeoCity {
  name: string;
  country: string;
  state?: string;
}

interface WeatherCache {
  data: WeatherData;
  timestamp: number;
}

const weatherCacheMap: Record<string, WeatherCache> = {};

function getApiKey(customKey?: string): string {
  if (customKey && customKey.length > 0) {
    return customKey;
  }
  const extra = (Constants.expoConfig?.extra as Record<string, string> | undefined) ?? {};
  return extra.weatherApiKey ?? '';
}

export async function fetchWeather(
  city: string = DEFAULT_WEATHER_CITY,
  apiKey?: string,
  forceRefresh: boolean = false
): Promise<WeatherData | null> {
  const cityKey = city.toLowerCase();
  const cached = weatherCacheMap[cityKey];
  if (
    !forceRefresh &&
    cached &&
    Date.now() - cached.timestamp < WEATHER_CACHE_DURATION_MS
  ) {
    return cached.data;
  }

  const key = getApiKey(apiKey);
  if (!key) {
    console.warn('Weather API key not configured in .env (WEATHER_API_KEY).');
    return null;
  }

  const url = `${WEATHER_API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${key}&units=metric&lang=fr`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEATHER_API_TIMEOUT_MS);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Weather API: Invalid API key');
      } else if (response.status === 429) {
        console.error('Weather API: Rate limit exceeded');
      } else {
        console.error(`Weather API: HTTP ${response.status}`);
      }
      return null;
    }

    const data: OpenWeatherMapResponse = await response.json();

    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp * 10) / 10,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0]?.description ?? 'N/A',
      icon: data.weather[0]?.icon ?? '01d',
      city: data.name,
      country: data.sys.country,
      windSpeed: data.wind.speed,
      feelsLike: Math.round(data.main.feels_like * 10) / 10,
      timestamp: new Date().toISOString(),
    };

    weatherCacheMap[cityKey] = {
      data: weatherData,
      timestamp: Date.now(),
    };

    return weatherData;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('Weather API: Request timed out');
    } else {
      console.error('Weather API error:', error);
    }
    return null;
  }
}

export async function testWeatherConnection(
  apiKey: string,
  city: string = DEFAULT_WEATHER_CITY
): Promise<{ success: boolean; message: string }> {
  const key = getApiKey(apiKey);
  if (!key) {
    return {
      success: false,
      message: 'Clé API manquante dans .env (WEATHER_API_KEY)',
    };
  }

  try {
    const data = await fetchWeather(city, key, true);
    if (data) {
      return {
        success: true,
        message: `Connecté! ${data.city}, ${data.country} — ${data.temperature}°C`,
      };
    }
    return {
      success: false,
      message: 'Échec de la connexion. Vérifiez votre clé API.',
    };
  } catch {
    return {
      success: false,
      message: 'Erreur réseau. Vérifiez votre connexion internet.',
    };
  }
}

export function getWeatherIconUrl(iconCode: string): string {
  return `${WEATHER_ICON_BASE_URL}${iconCode}@2x.png`;
}

export function clearWeatherCache(): void {
  for (const key in weatherCacheMap) {
    delete weatherCacheMap[key];
  }
}

export async function fetchForecast(
  city: string = DEFAULT_WEATHER_CITY,
  apiKey?: string
): Promise<ForecastItem[] | null> {
  const key = getApiKey(apiKey);
  if (!key) return null;

  const url = `${WEATHER_FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${key}&units=metric&lang=fr&cnt=8`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEATHER_API_TIMEOUT_MS);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data: OpenWeatherMapForecastResponse = await response.json();

    return data.list.map((item) => {
      const date = new Date(item.dt * 1000);
      const hour = date.getHours().toString().padStart(2, '0') + 'h';
      return {
        dt: item.dt,
        temp: Math.round(item.main.temp * 10) / 10,
        feelsLike: Math.round(item.main.feels_like * 10) / 10,
        humidity: item.main.humidity,
        description: item.weather[0]?.description ?? '',
        icon: item.weather[0]?.icon ?? '01d',
        hour,
      };
    });
  } catch {
    return null;
  }
}

export async function searchCities(query: string, limit = 5): Promise<GeoCity[]> {
  const key = getApiKey();
  if (!key || query.trim().length < 2) return [];

  const url = `${WEATHER_GEOCODING_URL}?q=${encodeURIComponent(query.trim())}&limit=${limit}&appid=${key}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json() as { name: string; country: string; state?: string }[];
    
    const seen = new Set<string>();
    return data.filter((item) => {
      const key = `${item.name},${item.country}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(({ name, country, state }) => ({ name, country, state }));
  } catch {
    return [];
  }
}
