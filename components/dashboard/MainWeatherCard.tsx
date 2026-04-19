import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { WeatherData } from '@/types';
import { getWeatherIconUrl } from '@/services/weatherApi';

interface MainWeatherCardProps {
  weatherData: WeatherData;
  weatherCities: string[];
  activeWeatherCity: string;
  setActiveWeatherCity: (city: string) => void;
  colors: Record<string, string>;
  loadState: 'loading' | 'no_key' | 'no_city' | 'error' | 'ok';
  t: (key: string) => string;
}

export function MainWeatherCard({
  weatherData,
  weatherCities,
  activeWeatherCity,
  setActiveWeatherCity,
  colors,
  loadState,
  t,
}: MainWeatherCardProps) {
  return (
    <View style={[styles.mainCard, { backgroundColor: colors.primary }]}>
      <View style={styles.mainCardTop}>
        <View style={styles.cityRow}>
          <MaterialCommunityIcons name="map-marker" size={18} color="rgba(255,255,255,0.9)" />
          <Text style={styles.cityName}>{weatherData.city}, {weatherData.country}</Text>
        </View>
        {weatherCities.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.citySwitcherContainer}
          >
            {weatherCities.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.citySwitcherChip,
                  activeWeatherCity === c && styles.citySwitcherChipActive,
                ]}
                onPress={() => setActiveWeatherCity(c)}
              >
                <Text style={[
                  styles.citySwitcherText,
                  activeWeatherCity === c && styles.citySwitcherTextActive,
                ]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.mainCardCenter}>
        <Text style={styles.bigTemp}>{weatherData.temperature}°C</Text>
        <Image
          source={{ uri: getWeatherIconUrl(weatherData.icon) }}
          style={styles.weatherIcon}
        />
      </View>

      <Text style={styles.description}>{weatherData.description}</Text>

      {loadState === 'error' && (
        <Text style={styles.staleWarning}>
          ⚠ {t('dashboard.errorLoading')}
        </Text>
      )}

      <Text style={styles.updatedText}>
        {t('dashboard.lastUpdated')}{' '}
        {new Date(weatherData.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  mainCardTop: { marginBottom: 8 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cityName: { color: 'rgba(255,255,255,0.95)', fontSize: 16, fontWeight: '700' },
  citySwitcherContainer: { gap: 6, paddingTop: 8 },
  citySwitcherChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  citySwitcherChipActive: { backgroundColor: 'rgba(255,255,255,0.5)' },
  citySwitcherText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  citySwitcherTextActive: { color: '#fff', fontWeight: '700' },
  mainCardCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  bigTemp: { fontSize: 64, fontWeight: '800', color: '#fff' },
  weatherIcon: { width: 80, height: 80 },
  description: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  staleWarning: { color: 'rgba(255,220,0,0.9)', fontSize: 12, marginTop: 4 },
  updatedText: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 6 },
});
