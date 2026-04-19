import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { AlertFilter } from '@/hooks/useAlerts';
import { themeConfig } from '@/constants/colors';

interface FilterTabsProps {
  filter: AlertFilter;
  setFilter: (f: AlertFilter) => void;
  colors: Record<string, string>;
  FILTER_TABS: { key: AlertFilter; label: string }[];
}

export function FilterTabs({ filter, setFilter, colors, FILTER_TABS }: FilterTabsProps) {
  return (
    <View style={styles.filterTabs}>
      {FILTER_TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.filterTab,
            {
              backgroundColor: filter === tab.key ? colors.primary : colors.surface,
              borderColor: filter === tab.key ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setFilter(tab.key)}
        >
          <Text
            style={[
              styles.filterTabText,
              {
                color: filter === tab.key ? themeConfig.colors.white : colors.textSecondary,
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
