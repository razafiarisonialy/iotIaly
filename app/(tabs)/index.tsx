import { useTheme } from '@/hooks/useTheme';
import { fetchForecast, fetchWeather } from '@/services/weatherApi';
import { useAppStore } from '@/store/appStore';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  StatusBar as RNStatusBar,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EmptyState } from '@/components/dashboard/EmptyState';
import { MainWeatherCard } from '@/components/dashboard/MainWeatherCard';
import { MetricsRow } from '@/components/dashboard/MetricsRow';
import { ForecastSection } from '@/components/dashboard/ForecastSection';

type LoadState = 'loading' | 'no_key' | 'no_city' | 'error' | 'ok';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

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
      const city = activeWeatherCity || weatherCities[0];
      if (!city) {
        setLoadState('no_city');
        return;
      }
      setLoadState('loading');
      try {
        const [weather, forecast] = await Promise.all([
          fetchWeather(city, undefined, force),
          fetchForecast(city, undefined),
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
    [activeWeatherCity, weatherCities, setWeatherData, setWeatherForecast]
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
        {weatherData && (
          <>
            <MainWeatherCard
              weatherData={weatherData}
              weatherCities={weatherCities}
              activeWeatherCity={activeWeatherCity}
              setActiveWeatherCity={setActiveWeatherCity}
              colors={colors}
              loadState={loadState}
              t={t}
            />
            <MetricsRow weatherData={weatherData} colors={colors} t={t} />
          </>
        )}

        {weatherForecast && weatherForecast.length > 0 && (
          <ForecastSection weatherForecast={weatherForecast} colors={colors} t={t} />
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 44,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 15 },
  bottomSpacer: { height: 24 },
});
