
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';
import { setSetting } from '@/services/database';
import { SENSOR_LABELS, SENSOR_COLORS } from '@/utils/constants';
import { themeConfig } from '@/constants/colors';
import type { SimulationSpeed } from '@/types';

export default function SimulationSettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const simulationSpeed = useAppStore((s) => s.simulationSpeed);
  const thresholds = useAppStore((s) => s.thresholds);
  const setSimulationSpeed = useAppStore((s) => s.setSimulationSpeed);
  const updateThreshold = useAppStore((s) => s.updateThreshold);

  const speedOptions: { key: SimulationSpeed; label: string }[] = [
    { key: 'fast', label: t('simulationSettings.fast') },
    { key: 'normal', label: t('simulationSettings.normal') },
    { key: 'slow', label: t('simulationSettings.slow') },
  ];

  const handleSpeedChange = useCallback(
    async (speed: SimulationSpeed) => {
      setSimulationSpeed(speed);
      await setSetting('simulation_speed', speed);
    },
    [setSimulationSpeed]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Frequency */}
        <Text style={[styles.groupLabel, { color: colors.textTertiary }]}>
          {t('simulationSettings.frequency').toUpperCase()}
        </Text>
        <View style={styles.speedRow}>
          {speedOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.speedChip,
                {
                  backgroundColor: simulationSpeed === opt.key ? colors.primary : colors.surface,
                  borderColor: simulationSpeed === opt.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleSpeedChange(opt.key)}
            >
              <Text
                style={[
                  styles.speedText,
                  { color: simulationSpeed === opt.key ? themeConfig.colors.white : colors.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Thresholds */}
        <Text style={[styles.groupLabel, { color: colors.textTertiary }]}>
          {t('simulationSettings.thresholds').toUpperCase()}
        </Text>
        {thresholds
          .filter((th) => th.sensorType !== 'motion')
          .map((threshold) => (
            <View
              key={threshold.sensorType}
              style={[styles.thresholdCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.thresholdHeader}>
                <View style={[styles.dot, { backgroundColor: SENSOR_COLORS[threshold.sensorType] }]} />
                <Text style={[styles.thresholdLabel, { color: colors.text }]}>
                  {SENSOR_LABELS[threshold.sensorType]}
                </Text>
                <Text style={[styles.thresholdRange, { color: colors.textTertiary }]}>
                  {threshold.maxWarning} / {threshold.maxCritical} {threshold.unit}
                </Text>
              </View>
              <View style={styles.inputRows}>
                <View style={styles.inputRow}>
                  <Text style={[styles.inputLabel, { color: colors.warning }]}>
                    {t('simulationSettings.warning')}
                  </Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                    value={threshold.maxWarning.toString()}
                    onChangeText={(v) => {
                      const n = parseFloat(v);
                      if (!isNaN(n)) updateThreshold(threshold.sensorType, { maxWarning: n });
                    }}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
                <View style={styles.inputRow}>
                  <Text style={[styles.inputLabel, { color: colors.error }]}>
                    {t('simulationSettings.critical')}
                  </Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                    value={threshold.maxCritical.toString()}
                    onChangeText={(v) => {
                      const n = parseFloat(v);
                      if (!isNaN(n)) updateThreshold(threshold.sensorType, { maxCritical: n });
                    }}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              </View>
            </View>
          ))}

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
  speedRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  speedChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  speedText: { fontSize: 12, fontWeight: '600' },
  thresholdCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  thresholdHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  thresholdLabel: { fontSize: 14, fontWeight: '600', flex: 1 },
  thresholdRange: { fontSize: 11 },
  inputRows: { gap: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputLabel: { fontSize: 12, fontWeight: '600', width: 110 },
  input: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  bottomSpacer: { height: 40 },
});
