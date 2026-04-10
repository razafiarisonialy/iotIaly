export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    weatherApiKey: process.env.WEATHER_API_KEY ?? '',
    defaultWeatherCity: process.env.DEFAULT_WEATHER_CITY ?? 'Antananarivo',
    weatherUrl: process.env.WEATHER_URL ?? 'https://api.openweathermap.org',
  },
});
