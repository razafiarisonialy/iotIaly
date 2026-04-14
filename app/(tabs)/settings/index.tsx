
import { Header } from '@/components/layout/Header';
import { useTheme } from '@/hooks/useTheme';
import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from '@/utils/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SettingsSection {
  key: string;
  icon: string;
  color: string;
  title: string;
  description: string;
  route: Href;
}

export default function SettingsIndexScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  const sections: SettingsSection[] = [
    {
      key: 'appearance',
      icon: 'palette-outline',
      color: '#AF52DE',
      title: t('settings.appearance'),
      description: t('settings.appearanceDesc'),
      route: '/(tabs)/settings/appearance',
    },
    {
      key: 'simulation',
      icon: 'cpu-64-bit',
      color: '#FF9500',
      title: t('settings.simulation'),
      description: t('settings.simulationDesc'),
      route: '/(tabs)/settings/simulation',
    },
    {
      key: 'api',
      icon: 'cloud-outline',
      color: '#34C759',
      title: t('settings.api'),
      description: t('settings.apiDesc'),
      route: '/(tabs)/settings/api',
    },
    {
      key: 'data',
      icon: 'database-outline',
      color: '#FF3B30',
      title: t('settings.data'),
      description: t('settings.dataDesc'),
      route: '/(tabs)/settings/data',
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header title={t('settings.title')} showStatus={false} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section list */}
        <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {sections.map((section, idx) => (
            <React.Fragment key={section.key}>
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => router.push(section.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${section.color}20` }]}>
                  <MaterialCommunityIcons
                    name={section.icon as any}
                    size={22}
                    color={section.color}
                  />
                </View>
                <View style={styles.itemText}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{section.title}</Text>
                  <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>{section.description}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
              {idx < sections.length - 1 && (
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

      </ScrollView>

      {/* About footer */}
      <View style={styles.footerPadding}>
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
          {t('settings.about').toUpperCase()}
        </Text>
        <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.aboutName, { color: colors.primary }]}>{APP_NAME}</Text>
          <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>
            Version {APP_VERSION}
          </Text>
          <Text style={[styles.aboutDesc, { color: colors.textTertiary }]}>{APP_DESCRIPTION}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600' },
  itemDesc: { fontSize: 12, marginTop: 2 },
  separator: { height: 1, marginLeft: 66 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  aboutCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  aboutName: { fontSize: 20, fontWeight: '800' },
  aboutVersion: { fontSize: 13, marginTop: 4 },
  aboutDesc: { fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  divider: { height: 1, width: '80%', marginVertical: 12 },
  aboutCredit: { fontSize: 11, marginTop: 2 },
  bottomSpacer: { height: 40 },
  footerPadding: { padding: 16 },
});
