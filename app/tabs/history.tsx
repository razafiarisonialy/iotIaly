/**
 * History — Sensor data history screen.
 *
 * Features:
 * - Sensor type selector (dropdown)
 * - Time period selector (1h, 6h, 24h, 7d, 30d)
 * - Interactive line chart with anomaly markers
 * - Virtualized FlatList of readings
 * - Statistics summary (min, max, avg, stdDev)
 * - CSV export via expo-sharing
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert as RNAlert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Header } from '@/components/layout/Header';
import { LineChartSensor } from '@/components/charts/LineChartSensor';
import { useTheme } from '@/hooks/useTheme';
import { getReadingsByDateRange } from '@/services/database';
import {
  SENSOR_TYPES,
  SENSOR_LABELS,
  SENSOR_COLORS,
  SENSOR_ICONS,
  TIME_PERIOD_LABELS,
} from '@/utils/constants';
import {
  formatDateTime,
  calculateStats,
  getStartDateForPeriod,
  getCurrentTimestamp,
  readingsToCSV,
  roundTo,
} from '@/utils/helpers';
import type { SensorType, SensorReading, TimePeriod, StatsSummary } from '@/types';

const TIME_PERIODS: TimePeriod[] = ['1h', '6h', '24h', '7d', '30d'];

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [selectedSensor, setSelectedSensor] = useState<SensorType>('temperature');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1h');
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSensorPicker, setShowSensorPicker] = useState(false);

  /** Load readings from database for selected sensor and period */
  const loadReadings = useCallback(async () => {
    setIsLoading(true);
    try {
      const startDate = getStartDateForPeriod(selectedPeriod);
      const endDate = getCurrentTimestamp();
      const data = await getReadingsByDateRange(
        startDate,
        endDate,
        selectedSensor
      );
      setReadings(data);
    } catch (error) {
      console.error('Failed to load readings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSensor, selectedPeriod]);

  // Reload when sensor or period changes
  useEffect(() => {
    loadReadings();
  }, [loadReadings]);

  // Calculate statistics
  const stats: StatsSummary = useMemo(() => {
    const values = readings.map((r) => r.value);
    return calculateStats(values);
  }, [readings]);

  /** Export readings as CSV */
  const handleExport = useCallback(async () => {
    if (readings.length === 0) {
      RNAlert.alert('Aucune donnée', 'Pas de données à exporter.');
      return;
    }

    try {
      const csv = readingsToCSV(readings);
      const fileName = `${selectedSensor}_${selectedPeriod}_${Date.now()}.csv`;
      const file = new File(Paths.cache, fileName);
      file.write(csv);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Exporter les données',
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      RNAlert.alert('Erreur', "L'export a échoué.");
    }
  }, [readings, selectedSensor, selectedPeriod]);

  /** Render a single reading row */
  const renderReadingItem = useCallback(
    ({ item }: { item: SensorReading }) => (
      <View
        style={[
          styles.readingRow,
          {
            backgroundColor: item.isAnomaly
              ? `${colors.error}10`
              : colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.readingDate, { color: colors.textSecondary }]}>
          {formatDateTime(item.timestamp)}
        </Text>
        <Text style={[styles.readingValue, { color: colors.text }]}>
          {roundTo(item.value, 2)} {item.unit}
        </Text>
        <View
          style={[
            styles.readingStatus,
            {
              backgroundColor: item.isAnomaly
                ? `${colors.error}20`
                : `${colors.success}20`,
            },
          ]}
        >
          <Text
            style={[
              styles.readingStatusText,
              { color: item.isAnomaly ? colors.error : colors.success },
            ]}
          >
            {item.isAnomaly ? 'Anomalie' : 'Normal'}
          </Text>
        </View>
      </View>
    ),
    [colors]
  );

  const keyExtractor = useCallback(
    (item: SensorReading) => item.id.toString(),
    []
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<SensorReading> | null | undefined, index: number) => ({
      length: 56,
      offset: 56 * index,
      index,
    }),
    []
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header title="Historique" showStatus={false} />

      <FlatList
        data={readings}
        renderItem={renderReadingItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Sensor Selector */}
            <TouchableOpacity
              style={[
                styles.sensorSelector,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setShowSensorPicker(!showSensorPicker)}
            >
              <MaterialCommunityIcons
                name={SENSOR_ICONS[selectedSensor] as keyof typeof MaterialCommunityIcons.glyphMap}
                size={20}
                color={SENSOR_COLORS[selectedSensor]}
              />
              <Text style={[styles.selectorText, { color: colors.text }]}>
                {SENSOR_LABELS[selectedSensor]}
              </Text>
              <MaterialCommunityIcons
                name={showSensorPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Sensor Picker Dropdown */}
            {showSensorPicker && (
              <View
                style={[
                  styles.dropdown,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {SENSOR_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.dropdownItem,
                      selectedSensor === type && {
                        backgroundColor: `${SENSOR_COLORS[type]}15`,
                      },
                    ]}
                    onPress={() => {
                      setSelectedSensor(type);
                      setShowSensorPicker(false);
                    }}
                  >
                    <MaterialCommunityIcons
                      name={SENSOR_ICONS[type] as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={18}
                      color={SENSOR_COLORS[type]}
                    />
                    <Text style={[styles.dropdownText, { color: colors.text }]}>
                      {SENSOR_LABELS[type]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Period Selector */}
            <View style={styles.periodContainer}>
              {TIME_PERIODS.map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodChip,
                    {
                      backgroundColor:
                        selectedPeriod === period
                          ? colors.primary
                          : colors.surface,
                      borderColor:
                        selectedPeriod === period
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodText,
                      {
                        color:
                          selectedPeriod === period
                            ? '#FFFFFF'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {TIME_PERIOD_LABELS[period]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Loading State */}
            {isLoading && (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.loader}
              />
            )}

            {/* Chart */}
            {!isLoading && readings.length > 0 && (
              <LineChartSensor
                sensorType={selectedSensor}
                readings={readings}
                height={200}
                showAnomalies
              />
            )}

            {/* Statistics */}
            {!isLoading && readings.length > 0 && (
              <View
                style={[
                  styles.statsContainer,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statsTitle, { color: colors.text }]}>
                  Statistiques
                </Text>
                <View style={styles.statsGrid}>
                  <StatBox
                    label="Min"
                    value={stats.min.toString()}
                    colors={colors}
                    icon="arrow-down"
                  />
                  <StatBox
                    label="Max"
                    value={stats.max.toString()}
                    colors={colors}
                    icon="arrow-up"
                  />
                  <StatBox
                    label="Moyenne"
                    value={stats.average.toString()}
                    colors={colors}
                    icon="approximately-equal"
                  />
                  <StatBox
                    label="Écart-type"
                    value={stats.standardDeviation.toString()}
                    colors={colors}
                    icon="sigma"
                  />
                </View>
                <Text style={[styles.statsCount, { color: colors.textTertiary }]}>
                  {stats.count} mesures
                </Text>
              </View>
            )}

            {/* Export Button */}
            {readings.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.exportButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleExport}
              >
                <MaterialCommunityIcons
                  name="file-export-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.exportText}>Exporter en CSV</Text>
              </TouchableOpacity>
            )}

            {/* Table Header */}
            {readings.length > 0 && (
              <View
                style={[
                  styles.tableHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.tableHeaderText, { color: colors.textSecondary }]}
                >
                  Date/Heure
                </Text>
                <Text
                  style={[styles.tableHeaderText, { color: colors.textSecondary }]}
                >
                  Valeur
                </Text>
                <Text
                  style={[styles.tableHeaderText, { color: colors.textSecondary }]}
                >
                  Statut
                </Text>
              </View>
            )}

            {!isLoading && readings.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={48}
                  color={colors.textTertiary}
                />
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                  Aucune donnée pour cette période.{'\n'}Lancez la simulation
                  depuis le dashboard.
                </Text>
              </View>
            )}
          </>
        }
        ListFooterComponent={<View style={styles.bottomSpacer} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/** Statistics box sub-component */
function StatBox({
  label,
  value,
  colors,
  icon,
}: {
  label: string;
  value: string;
  colors: Record<string, string>;
  icon: string;
}) {
  return (
    <View style={[statStyles.box, { backgroundColor: colors.surfaceElevated }]}>
      <MaterialCommunityIcons
        name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={14}
        color={colors.primary}
      />
      <Text style={[statStyles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[statStyles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  sensorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  dropdown: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 32,
  },
  statsContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginVertical: 12,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statsCount: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  exportText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    marginBottom: 4,
    height: 52,
  },
  readingDate: {
    fontSize: 11,
    flex: 1.2,
  },
  readingValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 0.8,
    textAlign: 'center',
  },
  readingStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  readingStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 24,
  },
});
