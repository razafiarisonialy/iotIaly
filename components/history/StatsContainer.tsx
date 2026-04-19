import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatBox } from './StatBox';
import type { StatsSummary } from '@/types';

interface StatsContainerProps {
  stats: StatsSummary;
  colors: Record<string, string>;
  t: (key: string) => string;
}

export function StatsContainer({ stats, colors, t }: StatsContainerProps) {
  return (
    <View
      style={[
        styles.statsContainer,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.statsTitle, { color: colors.text }]}>
        {t('history.statistics')}
      </Text>
      <View style={styles.statsGrid}>
        <StatBox label={t('history.min')} value={stats.min.toString()} colors={colors} icon="arrow-down" />
        <StatBox label={t('history.max')} value={stats.max.toString()} colors={colors} icon="arrow-up" />
        <StatBox label={t('history.average')} value={stats.average.toString()} colors={colors} icon="approximately-equal" />
        <StatBox label={t('history.stdDev')} value={stats.standardDeviation.toString()} colors={colors} icon="sigma" />
      </View>
      <Text style={[styles.statsCount, { color: colors.textTertiary }]}>
        {stats.count} {t('history.readings')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
