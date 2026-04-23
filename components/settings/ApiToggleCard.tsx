import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { themeConfig } from '@/constants/colors';

interface ApiToggleCardProps {
  useRealWeather: boolean;
  handleToggleWeather: (val: boolean) => void;
  colors: Record<string, string>;
  t: (key: string) => string;
}

export function ApiToggleCard({ useRealWeather, handleToggleWeather, colors, t }: ApiToggleCardProps) {
  return (
    <>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 15, fontWeight: '500', flex: 1 },
});
