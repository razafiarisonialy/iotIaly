
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';
import { fetchWeather, fetchForecast, getWeatherIconUrl } from '@/services/weatherApi';
import type { ForecastItem } from '@/types';

type LoadState = 'loading' | 'no_key' | 'no_city' | 'error' | 'ok';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  const weatherApiKey = useAppStore((s) => s.weatherApiKey);
  const activeWeatherCity = useAppStore((s) => s.activeWeatherCity);
  const weatherCities = useAppStore((s) => s.weatherCities);
  const weatherData = useAppStore((s) => s.weatherData);
  const weatherForecast = useAppStore((s) => s.weatherForecast);
  const setWeatherData = useAppStore((s) => s.setWeatherData);
  const setWeatherForecast = useAppStore((s) => s.setWeatherForecast);
  const setActiveWeatherCity = useAppStore((s) => s.setActiveWeatherCity);

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (force = false) => {
      if (!weatherApiKey) {
        setLoadState('no_key');
        return;
      }
      const city = activeWeatherCity || weatherCities[0];
      if (!city) {
        setLoadState('no_city');
        return;
      }
      setLoadState('loading');
      try {
        const [weather, forecast] = await Promise.all([
          fetchWeather(city, weatherApiKey, force),
          fetchForecast(city, weatherApiKey),
        ]);
        if (!weather) {
          setLoadState('error');
          return;
        }
        setWeatherData(weather);
        setWeatherForecast(forecast);
        setLoadState('ok');
      } catch {
        setLoadState('error');
      }
    },
    [weatherApiKey, activeWeatherCity, weatherCities, setWeatherData, setWeatherForecast]
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }, [load]);

  const goToApiSettings = useCallback(() => {
    router.push('/tabs/settings/api' as any);
  }, [router]);

  // ---- empty states ----
  if (loadState === 'no_key') {
    return (
      <EmptyState
        colors={colors}
        icon="key-outline"
        message={t('dashboard.noApiKey')}
        actionLabel={t('dashboard.configureApi')}
        onAction={goToApiSettings}
      />
    );
  }

  if (loadState === 'no_city') {
    return (
      <EmptyState
        colors={colors}
        icon="map-marker-outline"
        message={t('dashboard.noCity')}
        actionLabel={t('dashboard.configureApi')}
        onAction={goToApiSettings}
      />
    );
  }

  if (loadState === 'loading' && !weatherData) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (loadState === 'error' && !weatherData) {
    return (
      <EmptyState
        colors={colors}
        icon="wifi-off"
        message={t('dashboard.noConnection')}
        actionLabel={t('dashboard.retry')}
        onAction={() => load(true)}
        isError
      />
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ---- Main weather card ---- */}
        {weatherData && (
          <View style={[styles.mainCard, { backgroundColor: colors.primary }]}>
            <View style={styles.mainCardTop}>
              <View style={styles.cityRow}>
                <MaterialCommunityIcons name="map-marker" size={18} color="rgba(255,255,255,0.9)" />
                <Text style={styles.cityName}>{weatherData.city}, {weatherData.country}</Text>
              </View>
              {/* City switcher */}
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
        )}

        {/* ---- Metrics row ---- */}
        {weatherData && (
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
        )}

        {/* ---- Hourly forecast ---- */}
        {weatherForecast && weatherForecast.length > 0 && (
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
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ---- Sub-components ----

function MetricCard({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: Record<string, string>;
}) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <MaterialCommunityIcons
        name={icon as any}
        size={22}
        color={colors.primary}
      />
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function ForecastCard({ item, colors }: { item: ForecastItem; colors: Record<string, string> }) {
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

function EmptyState({
  colors,
  icon,
  message,
  actionLabel,
  onAction,
  isError = false,
}: {
  colors: Record<string, string>;
  icon: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  isError?: boolean;
}) {
  return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialCommunityIcons
          name={icon as any}
          size={52}
          color={isError ? colors.error : colors.primary}
        />
        <Text style={[styles.emptyMessage, { color: colors.text }]}>{message}</Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.primary }]}
          onPress={onAction}
        >
          <Text style={styles.emptyButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 15 },

  // Main card
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

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  metricValue: { fontSize: 13, fontWeight: '700' },
  metricLabel: { fontSize: 10, textAlign: 'center' },

  // Forecast
  forecastSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  forecastScroll: { gap: 8 },
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

  // Empty state
  emptyCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    maxWidth: 320,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  emptyButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  bottomSpacer: { height: 24 },
});
