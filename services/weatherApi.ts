/**
 * Weather API service for OpenWeatherMap integration.
 *
 * Features:
 * - Fetch current weather for Antananarivo (or configured city)
 * - 5-minute response caching to minimize API calls
 * - Robust error handling (timeout, quota, network)
 * - Comparison between real and simulated data
 */

import Constants from 'expo-constants';
import type { WeatherData, OpenWeatherMapResponse } from '@/types';
import {
  WEATHER_API_BASE_URL,
  DEFAULT_WEATHER_CITY,
  WEATHER_CACHE_DURATION_MS,
  WEATHER_API_TIMEOUT_MS,
} from '@/utils/constants';

// =============================================================================
// Cache
// =============================================================================

interface WeatherCache {
  data: WeatherData;
  timestamp: number;
}

let weatherCache: WeatherCache | null = null;

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get the API key from environment or settings.
 * @param customKey - Optional custom API key from settings
 * @returns The API key string
 */
function getApiKey(customKey?: string): string {
  if (customKey && customKey.length > 0) {
    return customKey;
  }

  // Try to get from expo-constants (loaded from .env via app.json extra)
  const envKey = Constants.expirationDate; // placeholder check
  const extraKey =
    (Constants.expoConfig?.extra as Record<string, string> | undefined)
      ?.weatherApiKey ?? '';

  if (extraKey.length > 0) {
    return extraKey;
  }

  // Fallback to the placeholder (will fail gracefully)
  return 'YOUR_OPENWEATHERMAP_API_KEY_HERE';
}

/**
 * Fetch current weather data from OpenWeatherMap API.
 *
 * Uses metric units (°C) and French language for descriptions.
 * Results are cached for 5 minutes to minimize API calls.
 *
 * @param city - City name (default: Antananarivo)
 * @param apiKey - Optional custom API key
 * @param forceRefresh - If true, bypass the cache
 * @returns WeatherData object or null if request fails
 */
export async function fetchWeather(
  city: string = DEFAULT_WEATHER_CITY,
  apiKey?: string,
  forceRefresh: boolean = false
): Promise<WeatherData | null> {
  // Check cache (unless forced refresh)
  if (
    !forceRefresh &&
    weatherCache &&
    Date.now() - weatherCache.timestamp < WEATHER_CACHE_DURATION_MS
  ) {
    return weatherCache.data;
  }

  const key = getApiKey(apiKey);
  if (key === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
    console.warn('Weather API key not configured. Using simulated data.');
    return null;
  }

  const url = `${WEATHER_API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${key}&units=metric&lang=fr`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      WEATHER_API_TIMEOUT_MS
    );

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

    // Update cache
    weatherCache = {
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

/**
 * Test the connection to OpenWeatherMap API.
 * @param apiKey - The API key to test
 * @param city - The city to query (default: Antananarivo)
 * @returns True if the connection is successful
 */
export async function testWeatherConnection(
  apiKey: string,
  city: string = DEFAULT_WEATHER_CITY
): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
    return {
      success: false,
      message: 'Veuillez entrer une clé API valide',
    };
  }

  try {
    const data = await fetchWeather(city, apiKey, true);
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
  } catch (error) {
    return {
      success: false,
      message: 'Erreur réseau. Vérifiez votre connexion internet.',
    };
  }
}

/**
 * Get the weather icon URL from OpenWeatherMap.
 * @param iconCode - The icon code from the API response
 * @returns URL to the weather icon image
 */
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Clear the weather cache.
 */
export function clearWeatherCache(): void {
  weatherCache = null;
}
