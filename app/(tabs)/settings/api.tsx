import { useTheme } from '@/hooks/useTheme';
import { setSetting } from '@/services/database';
import type { GeoCity } from '@/services/weatherApi';
import { searchCities, testWeatherConnection } from '@/services/weatherApi';
import { useAppStore } from '@/store/appStore';
import { DEFAULT_WEATHER_CITY } from '@/utils/constants';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert as RNAlert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ApiToggleCard } from '@/components/settings/ApiToggleCard';
import { ApiCitiesCard } from '@/components/settings/ApiCitiesCard';

export default function ApiSettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const useRealWeather = useAppStore((s) => s.useRealWeather);
  const weatherCities = useAppStore((s) => s.weatherCities);
  const activeWeatherCity = useAppStore((s) => s.activeWeatherCity);

  const setUseRealWeather = useAppStore((s) => s.setUseRealWeather);
  const addWeatherCity = useAppStore((s) => s.addWeatherCity);
  const removeWeatherCity = useAppStore((s) => s.removeWeatherCity);
  const setActiveWeatherCity = useAppStore((s) => s.setActiveWeatherCity);

  const [cityQuery, setCityQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoCity[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleWeather = useCallback(
    async (value: boolean) => {
      setUseRealWeather(value);
      await setSetting('use_real_weather', value.toString());
    },
    [setUseRealWeather]
  );

  const handleCityQueryChange = useCallback((text: string) => {
    setCityQuery(text);
    setDropdownOpen(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await searchCities(text, 8);
      setSuggestions(results);
      setSearching(false);
    }, 350);
  }, []);

  const handleSelectCity = useCallback(async (city: GeoCity) => {
    const label = `${city.name}, ${city.country}`;
    setCityQuery('');
    setSuggestions([]);
    setDropdownOpen(false);

    if (weatherCities.includes(label)) return;
    addWeatherCity(label);

    const newCities = [...weatherCities, label];
    if (weatherCities.length === 0) {
      setActiveWeatherCity(label);
      await setSetting('weather_city', label);
    }
    await setSetting('weather_cities', JSON.stringify(newCities));
  }, [weatherCities, addWeatherCity, setActiveWeatherCity]);

  const handleRemoveCity = useCallback(
    async (city: string) => {
      RNAlert.alert(
        t('apiSettings.removeCity'),
        city,
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.remove'),
            style: 'destructive',
            onPress: async () => {
              removeWeatherCity(city);
              const newCities = weatherCities.filter((c) => c !== city);
              await setSetting('weather_cities', JSON.stringify(newCities));
              if (activeWeatherCity === city && newCities.length > 0) {
                setActiveWeatherCity(newCities[0]);
                await setSetting('weather_city', newCities[0]);
              }
            },
          },
        ]
      );
    },
    [weatherCities, activeWeatherCity, removeWeatherCity, setActiveWeatherCity, t]
  );

  const handleSetPrimary = useCallback(
    async (city: string) => {
      setActiveWeatherCity(city);
      await setSetting('weather_city', city);
    },
    [setActiveWeatherCity]
  );

  const currentCity = activeWeatherCity || weatherCities[0] || DEFAULT_WEATHER_CITY;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ApiToggleCard
          useRealWeather={useRealWeather}
          handleToggleWeather={handleToggleWeather}
          colors={colors}
          t={t}
        />

        <ApiCitiesCard
          currentCity={currentCity}
          cityQuery={cityQuery}
          handleCityQueryChange={handleCityQueryChange}
          setDropdownOpen={setDropdownOpen}
          setCityQuery={setCityQuery}
          setSuggestions={setSuggestions}
          dropdownOpen={dropdownOpen}
          suggestions={suggestions}
          searching={searching}
          weatherCities={weatherCities}
          activeWeatherCity={activeWeatherCity}
          handleSelectCity={handleSelectCity}
          handleRemoveCity={handleRemoveCity}
          handleSetPrimary={handleSetPrimary}
          colors={colors}
          t={t}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  bottomSpacer: { height: 40 },
});
