import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ActionRowProps {
  handleAcknowledgeAll: () => void;
  handleClearAll: () => void;
  colors: Record<string, string>;
  t: (key: string) => string;
}

export function ActionRow({ handleAcknowledgeAll, handleClearAll, colors, t }: ActionRowProps) {
  return (
    <View style={styles.actionRow}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={handleAcknowledgeAll}
      >
        <MaterialCommunityIcons
          name="check-all"
          size={16}
          color={colors.primary}
        />
        <Text style={[styles.actionText, { color: colors.primary }]}>
          {t('alerts.acknowledgeAll')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: `${colors.error}10`, borderColor: colors.error },
        ]}
        onPress={handleClearAll}
      >
        <MaterialCommunityIcons
          name="delete-outline"
          size={16}
          color={colors.error}
        />
        <Text style={[styles.actionText, { color: colors.error }]}>
          {t('alerts.deleteAll')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
