import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MaterialIconName } from '@/types';

interface StatBoxProps {
  label: string;
  value: string;
  colors: Record<string, string>;
  icon: MaterialIconName;
}

export function StatBox({ label, value, colors, icon }: StatBoxProps) {
  return (
    <View style={[statStyles.box, { backgroundColor: colors.surfaceElevated }]}>
      <MaterialCommunityIcons
        name={icon}
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
