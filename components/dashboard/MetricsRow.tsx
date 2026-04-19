import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MetricCard } from './MetricCard';
import type { WeatherData } from '@/types';

interface MetricsRowProps {
  weatherData: WeatherData;
  colors: Record<string, string>;
  t: (key: string) => string;
}

export function MetricsRow({ weatherData, colors, t }: MetricsRowProps) {
  return (
    <View style={styles.metricsRow}>
      <MetricCard
        icon="thermometer"
        label={t('dashboard.feelsLike')}
        value={`${weatherData.feelsLike}°C`}
        colors={colors}
      />
      <MetricCard
        icon="water-percent"
        label={t('dashboard.humidity')}
        value={`${weatherData.humidity}%`}
        colors={colors}
      />
      <MetricCard
        icon="weather-windy"
        label={t('dashboard.wind')}
        value={`${weatherData.windSpeed} m/s`}
        colors={colors}
      />
      <MetricCard
        icon="gauge"
        label={t('dashboard.pressure')}
        value={`${weatherData.pressure} hPa`}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
});
