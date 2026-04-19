import { useTheme } from '@/hooks/useTheme';
import { useSensor } from '@/store/appStore';
import { SENSOR_COLORS, SENSOR_ICONS, SENSOR_LABELS, STATUS_COLORS } from '@/utils/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { memo, useMemo } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { themeConfig } from '@/constants/colors';
import { getTrendDescription } from '@/services/aiEngine';
import type { SensorType } from '@/types';
import { formatSensorValue, getStatusLabel } from '@/utils/helpers';

interface SensorCardProps {
  sensorType: SensorType;
  onPress?: (sensorType: SensorType) => void;
}

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

function SensorCardComponent({ sensorType, onPress }: SensorCardProps) {
  const { colors } = useTheme();
  const sensor = useSensor(sensorType);

  const iconName = SENSOR_ICONS[sensorType];
  const label = SENSOR_LABELS[sensorType];
  const sensorColor = SENSOR_COLORS[sensorType];
  const statusColor = STATUS_COLORS[sensor.status];

  const displayValue = formatSensorValue(sensor.currentValue, sensorType);
  const statusLabel = getStatusLabel(sensorType, sensor.currentValue);

  const trendLabel = sensor.prediction
    ? getTrendDescription(sensor.trend, sensor.prediction.slope)
    : '→ Stable';

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
      { }
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

      { }
      <Text
        style={[styles.label, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {label}
      </Text>

      { }
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

      { }
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

      { }
      {sparklineData.length > 2 && sensorType !== 'motion' && (
        <View style={styles.sparklineContainer}>
          <LineChart
            data={{
              labels: [],
              datasets: [{ data: sparklineData }],
            }}
            width={CARD_WIDTH - 20}
            height={80}
            withDots={false}
            withInnerLines={false}
            withOuterLines={false}
            withHorizontalLabels={false}
            withVerticalLabels={false}
            chartConfig={{
              backgroundGradientFrom: colors.cardBackground,
              backgroundGradientTo: colors.cardBackground,
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              color: () => sensorColor,
              fillShadowGradientFrom: sensorColor,
              fillShadowGradientFromOpacity: 0.35,
              fillShadowGradientTo: sensorColor,
              fillShadowGradientToOpacity: 0.05,
              strokeWidth: 2.5,
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
    shadowColor: themeConfig.colors.blackTransparent,
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
