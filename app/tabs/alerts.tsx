
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert as RNAlert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '@/components/layout/Header';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { useTheme } from '@/hooks/useTheme';
import { useAlerts } from '@/hooks/useAlerts';
import { SEVERITY_COLORS } from '@/utils/constants';
import type { Alert, SeverityLevel } from '@/types';
import type { AlertFilter } from '@/hooks/useAlerts';
import { themeConfig } from '@/constants/colors';

const FILTER_TABS: { key: AlertFilter; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'unacknowledged', label: 'Non lues' },
  { key: 'acknowledged', label: 'Acquittées' },
];

const SEVERITY_OPTIONS: { key: SeverityLevel | null; label: string }[] = [
  { key: null, label: 'Toutes' },
  { key: 'critical', label: 'Critique' },
  { key: 'warning', label: 'Avertissement' },
  { key: 'info', label: 'Info' },
];

export default function AlertsScreen() {
  const { colors } = useTheme();
  const {
    alerts,
    unreadCount,
    filter,
    severityFilter,
    setFilter,
    setSeverityFilter,
    acknowledge,
    acknowledgeAll,
    clearAll,
  } = useAlerts();

  const handleAcknowledge = useCallback(
    (alertId: number) => {
      acknowledge(alertId);
    },
    [acknowledge]
  );

  const handleAcknowledgeAll = useCallback(() => {
    RNAlert.alert(
      'Acquitter toutes les alertes',
      'Voulez-vous vraiment acquitter toutes les alertes?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Acquitter',
          onPress: () => acknowledgeAll(),
        },
      ]
    );
  }, [acknowledgeAll]);

  const handleClearAll = useCallback(() => {
    RNAlert.alert(
      'Supprimer toutes les alertes',
      'Cette action est irréversible. Continuer?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => clearAll(),
        },
      ]
    );
  }, [clearAll]);

  const renderAlertItem = useCallback(
    ({ item }: { item: Alert }) => (
      <AlertBanner alert={item} onAcknowledge={handleAcknowledge} />
    ),
    [handleAcknowledge]
  );

  const keyExtractor = useCallback(
    (item: Alert) => item.id.toString(),
    []
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header title="Alertes" showStatus={false} />

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {}
            {unreadCount > 0 && (
              <View
                style={[
                  styles.unreadBanner,
                  { backgroundColor: `${colors.error}10` },
                ]}
              >
                <MaterialCommunityIcons
                  name="bell-ring"
                  size={18}
                  color={colors.error}
                />
                <Text style={[styles.unreadText, { color: colors.error }]}>
                  {unreadCount} alerte{unreadCount > 1 ? 's' : ''} non lue
                  {unreadCount > 1 ? 's' : ''}
                </Text>
              </View>
            )}

            {/* Filter Tabs */}
            <View style={styles.filterTabs}>
              {FILTER_TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.filterTab,
                    {
                      backgroundColor:
                        filter === tab.key ? colors.primary : colors.surface,
                      borderColor:
                        filter === tab.key ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setFilter(tab.key)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      {
                        color:
                          filter === tab.key ? themeConfig.colors.white : colors.textSecondary,
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {}
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

            {}
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
                  Tout acquitter
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
                  Tout supprimer
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="bell-check-outline"
              size={48}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Aucune alerte{filter !== 'all' ? ' pour ce filtre' : ''}.
            </Text>
          </View>
        }
        ListFooterComponent={<View style={styles.bottomSpacer} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  unreadText: {
    fontSize: 14,
    fontWeight: '600',
  },
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 24,
  },
});
