import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { ForecastItem } from '@/types';
import { getWeatherIconUrl } from '@/services/weatherApi';

interface ForecastCardProps {
  item: ForecastItem;
  colors: Record<string, string>;
}

export function ForecastCard({ item, colors }: ForecastCardProps) {
  return (
    <View style={[styles.forecastCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
      <Text style={[styles.forecastHour, { color: colors.textSecondary }]}>{item.hour}</Text>
      <Image
        source={{ uri: getWeatherIconUrl(item.icon) }}
        style={styles.forecastIcon}
      />
      <Text style={[styles.forecastTemp, { color: colors.text }]}>{item.temp}°</Text>
      <Text style={[styles.forecastHumidity, { color: colors.textTertiary }]}>{item.humidity}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  forecastCard: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 64,
    gap: 2,
  },
  forecastHour: { fontSize: 11, fontWeight: '600' },
  forecastIcon: { width: 36, height: 36 },
  forecastTemp: { fontSize: 14, fontWeight: '700' },
  forecastHumidity: { fontSize: 10 },
});
