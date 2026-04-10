
import { themeConfig } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { setSetting } from '@/services/database';
import type { GeoCity } from '@/services/weatherApi';
import { searchCities, testWeatherConnection } from '@/services/weatherApi';
import { useAppStore } from '@/store/appStore';
import { DEFAULT_WEATHER_CITY } from '@/utils/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert as RNAlert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ApiSettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const useRealWeather = useAppStore((s) => s.useRealWeather);
  const weatherApiKey = useAppStore((s) => s.weatherApiKey);
  const weatherCities = useAppStore((s) => s.weatherCities);
  const activeWeatherCity = useAppStore((s) => s.activeWeatherCity);

  const setUseRealWeather = useAppStore((s) => s.setUseRealWeather);
  const setWeatherApiKey = useAppStore((s) => s.setWeatherApiKey);
  const addWeatherCity = useAppStore((s) => s.addWeatherCity);
  const removeWeatherCity = useAppStore((s) => s.removeWeatherCity);
  const setActiveWeatherCity = useAppStore((s) => s.setActiveWeatherCity);

  const [apiKeyInput, setApiKeyInput] = useState(weatherApiKey);
  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<{ msg: string; ok: boolean } | null>(null);

  // city autocomplete state
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

  const handleSaveApiKey = useCallback(async () => {
    setWeatherApiKey(apiKeyInput);
    await setSetting('weather_api_key', apiKeyInput);
  }, [apiKeyInput, setWeatherApiKey]);

  const handleTestApi = useCallback(async () => {
    if (!apiKeyInput) {
      setTestResult({ msg: t('apiSettings.apiKeyRequired'), ok: false });
      return;
    }
    const testCity = activeWeatherCity || weatherCities[0] || DEFAULT_WEATHER_CITY;
    setTestingApi(true);
    setTestResult(null);
    try {
      const result = await testWeatherConnection(apiKeyInput, testCity);
      setTestResult({ msg: result.message, ok: result.success });
      if (result.success) {
        setWeatherApiKey(apiKeyInput);
        await setSetting('weather_api_key', apiKeyInput);
      }
    } catch {
      setTestResult({ msg: t('common.error'), ok: false });
    } finally {
      setTestingApi(false);
    }
  }, [apiKeyInput, activeWeatherCity, weatherCities, setWeatherApiKey, t]);

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

        {/* Real weather toggle */}
        <Text style={[styles.groupLabel, { color: colors.textTertiary }]}>
          {t('apiSettings.realWeather').toUpperCase()}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={20} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('apiSettings.realWeather')}</Text>
            <Switch
              value={useRealWeather}
              onValueChange={handleToggleWeather}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={themeConfig.colors.white}
            />
          </View>
        </View>

        {/* API Key */}
        <Text style={[styles.groupLabel, { color: colors.textTertiary }]}>
          {t('apiSettings.apiKey').toUpperCase()}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { color: colors.text, backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            placeholder={t('apiSettings.apiKeyPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            autoCapitalize="none"
            onBlur={handleSaveApiKey}
          />

          <TouchableOpacity
            style={[styles.testBtn, { backgroundColor: colors.primary }]}
            onPress={handleTestApi}
            disabled={testingApi}
          >
            {testingApi ? (
              <ActivityIndicator size="small" color={themeConfig.colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons name="connection" size={16} color={themeConfig.colors.white} />
                <Text style={styles.testBtnText}>{t('apiSettings.testConnection')}</Text>
              </>
            )}
          </TouchableOpacity>

          {testResult && (
            <Text style={[styles.testResult, { color: testResult.ok ? colors.success : colors.error }]}>
              {testResult.msg}
            </Text>
          )}
        </View>

        {/* Cities */}
        <Text style={[styles.groupLabel, { color: colors.textTertiary }]}>
          {t('apiSettings.cities').toUpperCase()}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>

          {/* Current city indicator */}
          <View style={styles.currentCityRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
            <Text style={[styles.currentCityLabel, { color: colors.textSecondary }]}>
              {currentCity}
            </Text>
          </View>

          {/* Autocomplete input */}
          <View>
            <View style={[styles.searchInputRow, { backgroundColor: colors.surfaceElevated, borderColor: dropdownOpen && suggestions.length > 0 ? colors.primary : colors.border }]}>
              <MaterialCommunityIcons name="magnify" size={18} color={colors.textTertiary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                value={cityQuery}
                onChangeText={handleCityQueryChange}
                placeholder={t('apiSettings.addCityPlaceholder')}
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
                returnKeyType="search"
                onFocus={() => setDropdownOpen(true)}
              />
              {searching && <ActivityIndicator size="small" color={colors.primary} />}
              {cityQuery.length > 0 && !searching && (
                <TouchableOpacity onPress={() => { setCityQuery(''); setSuggestions([]); setDropdownOpen(false); }}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Dropdown suggestions */}
            {dropdownOpen && suggestions.length > 0 && (
              <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {suggestions.map((city, idx) => {
                  const label = `${city.name}, ${city.country}`;
                  const alreadyAdded = weatherCities.includes(label);
                  return (
                    <React.Fragment key={`${city.name}-${city.country}-${idx}`}>
                      {idx > 0 && <View style={[styles.dropSep, { backgroundColor: colors.border }]} />}
                      <TouchableOpacity
                        style={[styles.dropItem, alreadyAdded && { opacity: 0.4 }]}
                        onPress={() => !alreadyAdded && handleSelectCity(city)}
                        disabled={alreadyAdded}
                      >
                        <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.primary} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.dropCityName, { color: colors.text }]}>{city.name}</Text>
                          {city.state
                            ? <Text style={[styles.dropCityMeta, { color: colors.textTertiary }]}>{city.state} · {city.country}</Text>
                            : <Text style={[styles.dropCityMeta, { color: colors.textTertiary }]}>{city.country}</Text>
                          }
                        </View>
                        {alreadyAdded
                          ? <MaterialCommunityIcons name="check" size={16} color={colors.success} />
                          : <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
                        }
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>
            )}

            {/* No results hint */}
            {dropdownOpen && cityQuery.trim().length >= 2 && !searching && suggestions.length === 0 && (
              <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.noResultText, { color: colors.textTertiary }]}>
                  {t('apiSettings.noCity')}
                </Text>
              </View>
            )}
          </View>

          {/* City list */}
          {weatherCities.length === 0 ? (
            <Text style={[styles.noCity, { color: colors.textTertiary }]}>
              {t('apiSettings.noCity')}
            </Text>
          ) : (
            weatherCities.map((city, idx) => (
              <React.Fragment key={city}>
                {idx > 0 && <View style={[styles.separator, { backgroundColor: colors.border }]} />}
                <View style={styles.cityRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.primary} />
                  <Text style={[styles.cityName, { color: colors.text }]}>{city}</Text>
                  {activeWeatherCity === city ? (
                    <View style={[styles.primaryBadge, { backgroundColor: `${colors.primary}20` }]}>
                      <Text style={[styles.primaryBadgeText, { color: colors.primary }]}>
                        {t('apiSettings.primaryCity')}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.setPrimaryBtn, { borderColor: colors.border }]}
                      onPress={() => handleSetPrimary(city)}
                    >
                      <Text style={[styles.setPrimaryText, { color: colors.textSecondary }]}>
                        {t('apiSettings.setPrimary')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleRemoveCity(city)}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  groupLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 15, fontWeight: '500', flex: 1 },
  textInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  testBtnText: { color: themeConfig.colors.white, fontSize: 14, fontWeight: '700' },
  testResult: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  // current city
  currentCityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  currentCityLabel: { fontSize: 13, fontWeight: '500' },
  // search input
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  // dropdown
  dropdown: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  dropCityName: { fontSize: 14, fontWeight: '500' },
  dropCityMeta: { fontSize: 11, marginTop: 1 },
  dropSep: { height: 1 },
  noResultText: { fontSize: 13, textAlign: 'center', padding: 12 },
  // city list
  noCity: { fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  separator: { height: 1 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  cityName: { fontSize: 14, fontWeight: '500', flex: 1 },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  primaryBadgeText: { fontSize: 11, fontWeight: '700' },
  setPrimaryBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  setPrimaryText: { fontSize: 11 },
  bottomSpacer: { height: 40 },
});
