import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { GeoCity } from '@/services/weatherApi';

interface ApiCitiesCardProps {
  currentCity: string;
  cityQuery: string;
  handleCityQueryChange: (text: string) => void;
  setDropdownOpen: (open: boolean) => void;
  setCityQuery: (text: string) => void;
  setSuggestions: (s: GeoCity[]) => void;
  dropdownOpen: boolean;
  suggestions: GeoCity[];
  searching: boolean;
  weatherCities: string[];
  activeWeatherCity: string;
  handleSelectCity: (city: GeoCity) => void;
  handleRemoveCity: (city: string) => void;
  handleSetPrimary: (city: string) => void;
  colors: Record<string, string>;
  t: (key: string) => string;
}

export function ApiCitiesCard({
  currentCity,
  cityQuery,
  handleCityQueryChange,
  setDropdownOpen,
  setCityQuery,
  setSuggestions,
  dropdownOpen,
  suggestions,
  searching,
  weatherCities,
  activeWeatherCity,
  handleSelectCity,
  handleRemoveCity,
  handleSetPrimary,
  colors,
  t,
}: ApiCitiesCardProps) {
  return (
    <>
      <Text style={[styles.groupLabel, { color: colors.textTertiary }]}>
        {t('apiSettings.cities').toUpperCase()}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>

        {}
        <View style={styles.currentCityRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
          <Text style={[styles.currentCityLabel, { color: colors.textSecondary }]}>
            {currentCity}
          </Text>
        </View>

        {}
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

          {}
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

          {}
          {dropdownOpen && cityQuery.trim().length >= 2 && !searching && suggestions.length === 0 && (
            <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.noResultText, { color: colors.textTertiary }]}>
                {t('apiSettings.noCity')}
              </Text>
            </View>
          )}
        </View>

        {}
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
    </>
  );
}

const styles = StyleSheet.create({
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
  
  currentCityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  currentCityLabel: { fontSize: 13, fontWeight: '500' },
  
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
});
