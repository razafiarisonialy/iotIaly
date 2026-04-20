import { Header } from '@/components/layout/Header';
import { AlertBanner } from '@/components/ui/AlertBanner';
import type { AlertFilter } from '@/hooks/useAlerts';
import { useAlerts } from '@/hooks/useAlerts';
import { useTheme } from '@/hooks/useTheme';
import type { Alert, SeverityLevel } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Alert as RNAlert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ActionRow } from '@/components/alerts/ActionRow';
import { FilterTabs } from '@/components/alerts/FilterTabs';
import { SeverityFilter } from '@/components/alerts/SeverityFilter';
import { MAX_ALERTS_IN_STORE } from '@/store/slices/alertSlice';

export default function AlertsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const FILTER_TABS: { key: AlertFilter; label: string }[] = [
    { key: 'all', label: t('alerts.all') },
    { key: 'unacknowledged', label: t('alerts.unread') },
    { key: 'acknowledged', label: t('alerts.acknowledged') },
  ];

  const SEVERITY_OPTIONS: { key: SeverityLevel | null; label: string }[] = [
    { key: null, label: t('alerts.all') },
    { key: 'critical', label: t('alerts.critical') },
    { key: 'warning', label: t('alerts.warning') },
    { key: 'info', label: t('alerts.info') },
  ];

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
      t('alerts.acknowledgeAllTitle'),
      t('alerts.acknowledgeAllMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('alerts.acknowledgeBtn'), onPress: () => acknowledgeAll() },
      ]
    );
  }, [acknowledgeAll, t]);

  const handleClearAll = useCallback(() => {
    RNAlert.alert(
      t('alerts.deleteAllTitle'),
      t('alerts.deleteAllMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('alerts.deleteBtn'),
          style: 'destructive',
          onPress: () => clearAll(),
        },
      ]
    );
  }, [clearAll, t]);

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
      <Header title={t('alerts.title')} showStatus={false} />

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
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
                  {
                    unreadCount >= MAX_ALERTS_IN_STORE 
                      ? `+${t('alerts.unreadCount', { count: 99 })}`
                      : t('alerts.unreadCount', { count: unreadCount })
                  }
                </Text>
              </View>
            )}

            <FilterTabs
              filter={filter}
              setFilter={setFilter}
              colors={colors}
              FILTER_TABS={FILTER_TABS}
            />

            <SeverityFilter
              severityFilter={severityFilter}
              setSeverityFilter={setSeverityFilter}
              colors={colors}
              SEVERITY_OPTIONS={SEVERITY_OPTIONS}
            />

            <ActionRow
              handleAcknowledgeAll={handleAcknowledgeAll}
              handleClearAll={handleClearAll}
              colors={colors}
              t={t}
            />
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
              {t('alerts.noAlerts')}
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
