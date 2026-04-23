import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { SeverityLevel } from '@/types';
import { SEVERITY_COLORS } from '@/utils/constants';

interface SeverityFilterProps {
  severityFilter: SeverityLevel | null;
  setSeverityFilter: (s: SeverityLevel | null) => void;
  colors: Record<string, string>;
  SEVERITY_OPTIONS: { key: SeverityLevel | null; label: string }[];
}

export function SeverityFilter({
  severityFilter,
  setSeverityFilter,
  colors,
  SEVERITY_OPTIONS,
}: SeverityFilterProps) {
  return (
    <View style={styles.severityFilter}>
      {SEVERITY_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.key ?? 'all'}
          style={[
            styles.severityChip,
            {
              backgroundColor:
                severityFilter === option.key
                  ? option.key
                    ? `${SEVERITY_COLORS[option.key]}20`
                    : colors.surfaceElevated
                  : 'transparent',
              borderColor: option.key
                ? SEVERITY_COLORS[option.key]
                : colors.border,
            },
          ]}
          onPress={() => setSeverityFilter(option.key)}
        >
          {option.key && (
            <View
              style={[
                styles.severityDot,
                {
                  backgroundColor: SEVERITY_COLORS[option.key],
                },
              ]}
            />
          )}
          <Text
            style={[
              styles.severityChipText,
              {
                color: option.key
                  ? SEVERITY_COLORS[option.key]
                  : colors.textSecondary,
              },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  severityFilter: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  severityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
