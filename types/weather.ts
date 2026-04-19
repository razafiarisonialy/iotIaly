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

export interface ForecastItem {
  dt: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  hour: string;
}

export interface OpenWeatherMapForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
  }>;
}
