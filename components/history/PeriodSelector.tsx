import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { TimePeriod } from '@/types';
import { TIME_PERIOD_LABELS } from '@/utils/constants';
import { themeConfig } from '@/constants/colors';

const TIME_PERIODS: TimePeriod[] = ['1h', '6h', '24h', '7d', '30d'];

interface PeriodSelectorProps {
  selectedPeriod: TimePeriod;
  setSelectedPeriod: (period: TimePeriod) => void;
  colors: Record<string, string>;
}

export function PeriodSelector({ selectedPeriod, setSelectedPeriod, colors }: PeriodSelectorProps) {
  return (
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
                    ? themeConfig.colors.white
                    : colors.textSecondary,
              },
            ]}
          >
            {TIME_PERIOD_LABELS[period]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
