import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MaterialIconName } from '@/types';

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  colors: Record<string, string>;
}

export function MetricCard({ icon, label, value, colors }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <MaterialCommunityIcons
        name={icon as MaterialIconName}
        size={22}
        color={colors.primary}
      />
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  metricValue: { fontSize: 13, fontWeight: '700' },
  metricLabel: { fontSize: 10, textAlign: 'center' },
});
