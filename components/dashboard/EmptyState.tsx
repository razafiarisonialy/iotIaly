import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MaterialIconName } from '@/types';

interface EmptyStateProps {
  colors: Record<string, string>;
  icon: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  isError?: boolean;
}

export function EmptyState({
  colors,
  icon,
  message,
  actionLabel,
  onAction,
  isError = false,
}: EmptyStateProps) {
  return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialCommunityIcons
          name={icon as MaterialIconName}
          size={52}
          color={isError ? colors.error : colors.primary}
        />
        <Text style={[styles.emptyMessage, { color: colors.text }]}>{message}</Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.primary }]}
          onPress={onAction}
        >
          <Text style={styles.emptyButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    maxWidth: 320,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  emptyButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
