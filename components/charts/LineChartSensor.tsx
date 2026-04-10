
import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '@/hooks/useTheme';
import { SENSOR_COLORS, SENSOR_LABELS } from '@/utils/constants';
import { formatChartTime } from '@/utils/helpers';
import type { SensorReading, SensorType } from '@/types';
import { themeConfig } from '@/constants/colors';

interface LineChartSensorProps {
    sensorType: SensorType;
    readings: SensorReading[];
    height?: number;
    title?: string;
    showAnomalies?: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

function LineChartSensorComponent({
  sensorType,
  readings,
  height = 220,
  title,
  showAnomalies = true,
}: LineChartSensorProps) {
  const { colors, isDarkMode } = useTheme();
  const sensorColor = SENSOR_COLORS[sensorType];

  
  const chartData = useMemo(() => {
    const sorted = [...readings]
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .slice(-30);

    if (sorted.length < 2) {
      return {
        labels: ['', ''],
        values: [0, 0],
        anomalyIndices: [] as number[],
      };
    }

    // Show labels for every 5th point to avoid crowding
    const labels = sorted.map((r, i) =>
      i % 5 === 0 ? formatChartTime(r.timestamp) : ''
    );
    const values = sorted.map((r) => r.value);

    // Find anomaly indices for dot highlighting
    const anomalyIndices = showAnomalies
      ? sorted
          .map((r, i) => (r.isAnomaly ? i : -1))
          .filter((i) => i >= 0)
      : [];

    return { labels, values, anomalyIndices };
  }, [readings, showAnomalies]);

  if (readings.length < 2) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          En attente de données...
        </Text>
      </View>
    );
  }

  // Build decorator function for anomaly dots
  const renderDotContent = (config: {
    x: number;
    y: number;
    index: number;
  }) => {
    if (!chartData.anomalyIndices.includes(config.index)) return null;
    return (
      <View
        key={`anomaly-${config.index}`}
        style={{
          position: 'absolute',
          left: config.x - 6,
          top: config.y - 6,
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: themeConfig.colors.red,
          borderWidth: 2,
          borderColor: themeConfig.colors.white,
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {title !== undefined && (
        <Text style={[styles.title, { color: colors.text }]}>
          {title ?? SENSOR_LABELS[sensorType]}
        </Text>
      )}
      <LineChart
        data={{
          labels: chartData.labels,
          datasets: [
            {
              data: chartData.values,
              color: () => sensorColor,
              strokeWidth: 2,
            },
          ],
        }}
        width={SCREEN_WIDTH - 32}
        height={height}
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 1,
          color: () => sensorColor,
          labelColor: () => colors.textSecondary,
          propsForDots: {
            r: '3',
            strokeWidth: '1',
            stroke: sensorColor,
          },
          propsForBackgroundLines: {
            stroke: colors.chartGrid,
            strokeDasharray: '4 6',
          },
          propsForLabels: {
            fontSize: 10,
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines
        withDots={readings.length <= 30}
        segments={4}
        renderDotContent={showAnomalies ? renderDotContent : undefined}
      />
    </View>
  );
}

export const LineChartSensor = memo(LineChartSensorComponent);

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  chart: {
    borderRadius: 12,
  },
  emptyContainer: {
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
