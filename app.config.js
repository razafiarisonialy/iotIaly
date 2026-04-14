import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    weatherApiKey: process.env.EXPO_PUBLIC_WEATHER_API_KEY ?? '',
    defaultWeatherCity: process.env.EXPO_PUBLIC_DEFAULT_WEATHER_CITY ?? 'Antananarivo',
    weatherUrl: process.env.EXPO_PUBLIC_WEATHER_URL ?? 'https://api.openweathermap.org',
  },
});