/**
 * SensorCard — Displays real-time sensor data in a styled card.
 *
 * Shows: icon, current value, unit, status color, trend indicator,
 * and a mini sparkline chart of recent values.
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '@/hooks/useTheme';
import { useSensor } from '@/store/appStore';
import { SENSOR_ICONS, SENSOR_LABELS, SENSOR_COLORS } from '@/utils/constants';
import { STATUS_COLORS } from '@/utils/constants';
import { formatSensorValue, getStatusLabel } from '@/utils/helpers';
import { getTrendDescription } from '@/services/aiEngine';
import type { SensorType } from '@/types';

interface SensorCardProps {
  /** The sensor type to display */
  sensorType: SensorType;
  /** Callback when the card is tapped */
  onPress?: (sensorType: SensorType) => void;
}

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

/**
 * A card component displaying real-time sensor data with sparkline.
 * Uses React.memo for performance — only re-renders when sensor data changes.
 */
function SensorCardComponent({ sensorType, onPress }: SensorCardProps) {
  const { colors } = useTheme();
  const sensor = useSensor(sensorType);

  const iconName = SENSOR_ICONS[sensorType] as keyof typeof MaterialCommunityIcons.glyphMap;
  const label = SENSOR_LABELS[sensorType];
  const sensorColor = SENSOR_COLORS[sensorType];
  const statusColor = STATUS_COLORS[sensor.status];

  const displayValue = formatSensorValue(sensor.currentValue, sensorType);
  const statusLabel = getStatusLabel(sensorType, sensor.currentValue);

  const trendLabel = sensor.prediction
    ? getTrendDescription(sensor.trend, sensor.prediction.slope)
    : '→ Stable';

  // Prepare sparkline data (last 15 values)
  const sparklineData = useMemo(() => {
    const values = sensor.recentValues.slice(-15);
    if (values.length < 2) return [0, 0];
    return values;
  }, [sensor.recentValues]);

  const unitDisplay = sensorType === 'motion' ? '' : ` ${sensor.recentReadings[0]?.unit ?? ''}`;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          borderLeftColor: sensorColor,
        },
      ]}
      onPress={() => onPress?.(sensorType)}
      activeOpacity={0.7}
      accessible
      accessibilityLabel={`${label}: ${displayValue}${unitDisplay}`}
      accessibilityRole="button"
    >
      {/* Header Row: Icon + Status Dot */}
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${sensorColor}20` },
          ]}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={22}
            color={sensorColor}
          />
        </View>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>

      {/* Sensor Label */}
      <Text
        style={[styles.label, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Value */}
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.text }]}>
          {displayValue}
        </Text>
        {sensorType !== 'motion' && (
          <Text style={[styles.unit, { color: colors.textTertiary }]}>
            {sensor.recentReadings.length > 0
              ? sensor.recentReadings[sensor.recentReadings.length - 1].unit
              : ''}
          </Text>
        )}
      </View>

      {/* Status & Trend */}
      <Text
        style={[styles.statusText, { color: statusColor }]}
        numberOfLines={1}
      >
        {statusLabel}
      </Text>
      <Text
        style={[styles.trendText, { color: colors.textTertiary }]}
        numberOfLines={1}
      >
        {trendLabel}
      </Text>

      {/* Sparkline */}
      {sparklineData.length > 2 && sensorType !== 'motion' && (
        <View style={styles.sparklineContainer}>
          <LineChart
            data={{
              labels: [],
              datasets: [{ data: sparklineData }],
            }}
            width={CARD_WIDTH - 32}
            height={40}
            withDots={false}
            withInnerLines={false}
            withOuterLines={false}
            withHorizontalLabels={false}
            withVerticalLabels={false}
            chartConfig={{
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              color: () => sensorColor,
              strokeWidth: 2,
              propsForBackgroundLines: { stroke: 'transparent' },
            }}
            bezier
            style={styles.sparkline}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

export const SensorCard = memo(SensorCardComponent);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 1,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  sparklineContainer: {
    marginTop: 4,
    marginHorizontal: -8,
    overflow: 'hidden',
    borderRadius: 8,
  },
  sparkline: {
    paddingRight: 0,
    marginLeft: -16,
  },
});
