import { themeConfig } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { setSetting } from '@/services/database';
import i18n, { LANGUAGE_KEY, type SupportedLanguage } from '@/services/i18n';
import { useAppStore } from '@/store/appStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface LangOption {
  code: SupportedLanguage;
  labelKey: string;
  flag: string;
}

const LANG_OPTIONS: LangOption[] = [
  { code: 'fr', labelKey: 'appearance.french', flag: '🇫🇷' },
  { code: 'en', labelKey: 'appearance.english', flag: '🇬🇧' },
  { code: 'es', labelKey: 'appearance.spanish', flag: '🇪🇸' },
];

export default function AppearanceScreen() {
  const { t } = useTranslation();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const alertsEnabled = useAppStore((s) => s.alertsEnabled);
  const setAlertsEnabled = useAppStore((s) => s.setAlertsEnabled);

  const currentLang = i18n.language as SupportedLanguage;

  const handleToggleAlerts = useCallback(
    async (value: boolean) => {
      setAlertsEnabled(value);
      await setSetting('alerts_enabled', value.toString());
    },
    [setAlertsEnabled]
  );

  const handleLanguageChange = useCallback(async (code: SupportedLanguage) => {
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {}
        <Text style={[styles.groupLabel, { color: colors.textTertiary }]}>
          {t('appearance.title').toUpperCase()}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="moon-waning-crescent" size={20} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('appearance.darkMode')}</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={themeConfig.colors.white}
            />
          </View>
        </View>

        {}
        <Text style={[styles.groupLabel, { color: colors.textTertiary }]}>
          {t('appearance.notifications').toUpperCase()}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="bell-ring-outline" size={20} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('appearance.alertsEnabled')}</Text>
            <Switch
              value={alertsEnabled}
              onValueChange={handleToggleAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={themeConfig.colors.white}
            />
          </View>
        </View>

        {}
        <Text style={[styles.groupLabel, { color: colors.textTertiary }]}>
          {t('appearance.language').toUpperCase()}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {LANG_OPTIONS.map((lang, idx) => (
            <React.Fragment key={lang.code}>
              <TouchableOpacity
                style={styles.langRow}
                onPress={() => handleLanguageChange(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, { color: colors.text }]}>{t(lang.labelKey)}</Text>
                {currentLang === lang.code && (
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
              {idx < LANG_OPTIONS.length - 1 && (
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

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
    overflow: 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rowLabel: { fontSize: 15, fontWeight: '500', flex: 1 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  flag: { fontSize: 22 },
  langLabel: { fontSize: 15, fontWeight: '500', flex: 1 },
  separator: { height: 1, marginLeft: 56 },
  bottomSpacer: { height: 40 },
});
