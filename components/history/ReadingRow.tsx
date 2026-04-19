import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SensorReading } from '@/types';
import { formatDateTime, roundTo } from '@/utils/helpers';

interface ReadingRowProps {
  item: SensorReading;
  colors: Record<string, string>;
  t: (key: string) => string;
}

export function ReadingRow({ item, colors, t }: ReadingRowProps) {
  return (
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
          {item.isAnomaly ? t('history.anomaly') : 'Normal'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
