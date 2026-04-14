
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert as RNAlert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '@/hooks/useTheme';
import {
  getDatabaseSize,
  formatDatabaseSize,
  purgeAllData,
  getReadings,
  getAlerts as dbGetAlerts,
} from '@/services/database';
import { readingsToCSV, alertsToCSV } from '@/utils/helpers';
import { themeConfig } from '@/constants/colors';

export default function DataSettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [dbSize, setDbSize] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadDbSize = useCallback(async () => {
    try {
      const size = await getDatabaseSize();
      setDbSize(formatDatabaseSize(size));
    } catch {}
  }, []);

  React.useEffect(() => {
    loadDbSize();
  }, [loadDbSize]);

  const handleExportAll = useCallback(async () => {
    setExporting(true);
    try {
      const readings = await getReadings(undefined, 10000);
      const alerts = await dbGetAlerts(undefined, 1000);
      const combined =
        `=== SENSOR READINGS ===\n${readingsToCSV(readings)}\n\n=== ALERTS ===\n${alertsToCSV(alerts)}`;
      const fileName = `iot_export_${Date.now()}.csv`;
      const file = new File(Paths.cache, fileName);
      file.write(combined);
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: t('dataSettings.exportAll') });
      }
    } catch {
      RNAlert.alert(t('common.error'), t('dataSettings.exportError'));
    } finally {
      setExporting(false);
    }
  }, [t]);

  const handlePurge = useCallback(() => {
    RNAlert.alert(
      t('dataSettings.purgeTitle'),
      t('dataSettings.purgeMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('dataSettings.purgeBtn'),
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await purgeAllData();
              RNAlert.alert(
                t('dataSettings.deleted'),
                t('dataSettings.purgeSuccess', {
                  readings: result.deletedReadings,
                  alerts: result.deletedAlerts,
                })
              );
              loadDbSize();
            } catch {
              RNAlert.alert(t('common.error'), t('dataSettings.purgeError'));
            }
          },
        },
      ]
    );
  }, [t, loadDbSize]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* DB info */}
        <Text style={[styles.groupLabel, { color: colors.textTertiary }]}>
          {t('dataSettings.dbSize').toUpperCase()}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="database" size={22} color={colors.primary} />
            <Text style={[styles.dbSizeText, { color: colors.text }]}>
              {dbSize ?? '...'}
            </Text>
          </View>
        </View>

        {/* Export */}
        <Text style={[styles.groupLabel, { color: colors.textTertiary }]}>
          {t('common.export').toUpperCase()}
        </Text>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={handleExportAll}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={themeConfig.colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons name="database-export-outline" size={20} color={themeConfig.colors.white} />
              <Text style={styles.actionBtnText}>{t('dataSettings.exportAll')}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Danger zone */}
        <Text style={[styles.groupLabel, { color: colors.error }]}>
          ⚠ {t('dataSettings.purge').toUpperCase()}
        </Text>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.error }]}
          onPress={handlePurge}
        >
          <MaterialCommunityIcons name="delete-forever-outline" size={20} color={themeConfig.colors.white} />
          <Text style={styles.actionBtnText}>{t('dataSettings.purge')}</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  groupLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dbSizeText: { fontSize: 15, fontWeight: '600' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 12,
  },
  actionBtnText: { color: themeConfig.colors.white, fontSize: 15, fontWeight: '700' },
  bottomSpacer: { height: 40 },
});
