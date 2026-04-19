import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ForecastCard } from './ForecastCard';
import type { ForecastItem } from '@/types';

interface ForecastSectionProps {
  weatherForecast: ForecastItem[];
  colors: Record<string, string>;
  t: (key: string) => string;
}

export function ForecastSection({ weatherForecast, colors, t }: ForecastSectionProps) {
  if (!weatherForecast || weatherForecast.length === 0) return null;

  return (
    <View style={[styles.forecastSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t('dashboard.hourlyForecast')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.forecastScroll}
      >
        {weatherForecast.map((item) => (
          <ForecastCard key={item.dt} item={item} colors={colors} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  forecastSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  forecastScroll: { gap: 8 },
});
