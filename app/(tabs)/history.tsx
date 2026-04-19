import { LineChartSensor } from '@/components/charts/LineChartSensor';
import { Header } from '@/components/layout/Header';
import { themeConfig } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { getReadingsByDateRange } from '@/services/database';
import type { SensorReading, SensorType, StatsSummary, TimePeriod } from '@/types';
import { getCurrentTimestamp, getStartDateForPeriod, readingsToCSV, calculateStats } from '@/utils/helpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Alert as RNAlert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SensorSelector } from '@/components/history/SensorSelector';
import { PeriodSelector } from '@/components/history/PeriodSelector';
import { StatsContainer } from '@/components/history/StatsContainer';
import { ReadingRow } from '@/components/history/ReadingRow';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [selectedSensor, setSelectedSensor] = useState<SensorType>('temperature');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1h');
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSensorPicker, setShowSensorPicker] = useState(false);

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

  useEffect(() => {
    loadReadings();
  }, [loadReadings]);

  const stats: StatsSummary = useMemo(() => {
    const values = readings.map((r) => r.value);
    return calculateStats(values);
  }, [readings]);

  const handleExport = useCallback(async () => {
    if (readings.length === 0) {
      RNAlert.alert(t('history.noDataToExport'), t('history.noDataToExportMsg'));
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
          dialogTitle: t('history.exportCsv'),
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      RNAlert.alert(t('common.error'), t('dataSettings.exportError'));
    }
  }, [readings, t, selectedSensor, selectedPeriod]);

  const renderReadingItem = useCallback(
    ({ item }: { item: SensorReading }) => (
      <ReadingRow item={item} colors={colors} t={t} />
    ),
    [colors, t]
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
      <Header title={t('history.title')} showStatus={false} />

      <FlatList
        data={readings}
        renderItem={renderReadingItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <SensorSelector
              selectedSensor={selectedSensor}
              setSelectedSensor={setSelectedSensor}
              showSensorPicker={showSensorPicker}
              setShowSensorPicker={setShowSensorPicker}
              colors={colors}
            />

            <PeriodSelector
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              colors={colors}
            />

            {isLoading && (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.loader}
              />
            )}

            {!isLoading && readings.length > 0 && (
              <LineChartSensor
                sensorType={selectedSensor}
                readings={readings}
                height={200}
                showAnomalies
              />
            )}

            {!isLoading && readings.length > 0 && (
              <StatsContainer stats={stats} colors={colors} t={t} />
            )}

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
                  color={themeConfig.colors.white}
                />
                <Text style={styles.exportText}>{t('history.exportCsv')}</Text>
              </TouchableOpacity>
            )}

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
                  {t('history.noData')}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  loader: {
    marginVertical: 32,
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
    color: themeConfig.colors.white,
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
