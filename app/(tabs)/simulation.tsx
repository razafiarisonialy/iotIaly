import { LineChartSensor } from '@/components/charts/LineChartSensor';
import { Header } from '@/components/layout/Header';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { SensorCard } from '@/components/ui/SensorCard';
import { themeConfig } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore, useSimulationRunning } from '@/store/appStore';
import type { SensorType } from '@/types';
import { SENSOR_COLORS, SENSOR_LABELS } from '@/utils/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const SENSOR_GRID: SensorType[] = ['temperature', 'humidity', 'energy', 'motion'];

export default function SimulationScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const simulationRunning = useSimulationRunning();
  const selectedSensor = useAppStore((s) => s.selectedSensor);
  const setSelectedSensor = useAppStore((s) => s.setSelectedSensor);
  const setSimulationRunning = useAppStore((s) => s.setSimulationRunning);
  const alerts = useAppStore((s) => s.alerts);
  const sensorState = useAppStore((s) => s.sensors[s.selectedSensor]);

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleSensorPress = useCallback(
    (sensorType: SensorType) => setSelectedSensor(sensorType),
    [setSelectedSensor]
  );

  const toggleSimulation = useCallback(() => {
    setSimulationRunning(!simulationRunning);
  }, [simulationRunning, setSimulationRunning]);

  const recentAlerts = alerts.slice(0, 3);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header title={t('simulation.title')} showStatus={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {}
        <TouchableOpacity
          style={[
            styles.simulationButton,
            {
              backgroundColor: simulationRunning
                ? `${colors.error}15`
                : `${colors.success}15`,
              borderColor: simulationRunning ? colors.error : colors.success,
            },
          ]}
          onPress={toggleSimulation}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name={simulationRunning ? 'stop-circle' : 'play-circle'}
            size={22}
            color={simulationRunning ? colors.error : colors.success}
          />
          <Text
            style={[
              styles.simulationButtonText,
              { color: simulationRunning ? colors.error : colors.success },
            ]}
          >
            {simulationRunning ? t('simulation.stop') : t('simulation.start')}
          </Text>
        </TouchableOpacity>

        {}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('simulation.realTimeSensors')}
        </Text>
        <View style={styles.sensorGrid}>
          {SENSOR_GRID.map((type) => (
            <SensorCard key={type} sensorType={type} onPress={handleSensorPress} />
          ))}
        </View>

        {}
        <View style={styles.fullWidthCard}>
          <SensorCard sensorType="air_quality" onPress={handleSensorPress} />
        </View>

        {}
        <View
          style={[
            styles.chartSection,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
            contentContainerStyle={styles.chipContainer}
          >
            {(['temperature', 'humidity', 'energy', 'air_quality'] as SensorType[]).map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selectedSensor === type
                          ? SENSOR_COLORS[type]
                          : colors.surfaceElevated,
                      borderColor:
                        selectedSensor === type ? SENSOR_COLORS[type] : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedSensor(type)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          selectedSensor === type
                            ? themeConfig.colors.white
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {SENSOR_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          <LineChartSensor
            sensorType={selectedSensor}
            readings={sensorState.recentReadings}
            title={`${SENSOR_LABELS[selectedSensor]} — ${t('simulation.last30min')}`}
            showAnomalies
          />

          {sensorState.prediction && sensorState.prediction.confidence > 0 && (
            <View style={styles.predictionRow}>
              <MaterialCommunityIcons name="crystal-ball" size={16} color={colors.secondary} />
              <Text style={[styles.predictionText, { color: colors.textSecondary }]}>
                {t('simulation.prediction')} ({sensorState.prediction.minutesAhead}{' '}
                {t('simulation.minutes')}):{' '}
                <Text style={{ fontWeight: '700', color: colors.text }}>
                  {sensorState.prediction.predictedValue}
                </Text>{' '}
                ({t('simulation.confidence')}:{' '}
                {Math.round(sensorState.prediction.confidence * 100)}%)
              </Text>
            </View>
          )}
        </View>

        {}
        {recentAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('simulation.lastAlerts')}
            </Text>
            {recentAlerts.map((alert) => (
              <AlertBanner key={alert.id} alert={alert} compact />
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  simulationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  simulationButtonText: { fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  sensorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  fullWidthCard: { marginBottom: 8 },
  chartSection: { borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1 },
  chipScroll: { marginBottom: 8 },
  chipContainer: { gap: 8, paddingHorizontal: 2 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
  predictionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 4 },
  predictionText: { fontSize: 12, flex: 1 },
  alertsSection: { marginTop: 4 },
  bottomSpacer: { height: 24 },
});
