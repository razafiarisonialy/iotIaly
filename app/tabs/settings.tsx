
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert as RNAlert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Header } from '@/components/layout/Header';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';
import { testWeatherConnection } from '@/services/weatherApi';
import {
  getDatabaseSize,
  formatDatabaseSize,
  purgeAllData,
  getReadings,
  getAlerts as dbGetAlerts,
  setSetting,
} from '@/services/database';
import {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  SENSOR_LABELS,
  SENSOR_COLORS,
} from '@/utils/constants';
import { readingsToCSV, alertsToCSV } from '@/utils/helpers';
import type { SimulationSpeed } from '@/types';
import { themeConfig } from '@/constants/colors';

const SPEED_OPTIONS: { key: SimulationSpeed; label: string }[] = [
  { key: 'fast', label: 'Rapide (2s)' },
  { key: 'normal', label: 'Normal (3s)' },
  { key: 'slow', label: 'Lent (5s)' },
];

export default function SettingsScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const alertsEnabled = useAppStore((s) => s.alertsEnabled);
  const simulationSpeed = useAppStore((s) => s.simulationSpeed);
  const useRealWeather = useAppStore((s) => s.useRealWeather);
  const weatherApiKey = useAppStore((s) => s.weatherApiKey);
  const weatherCity = useAppStore((s) => s.weatherCity);
  const thresholds = useAppStore((s) => s.thresholds);

  const setAlertsEnabled = useAppStore((s) => s.setAlertsEnabled);
  const setSimulationSpeed = useAppStore((s) => s.setSimulationSpeed);
  const setUseRealWeather = useAppStore((s) => s.setUseRealWeather);
  const setWeatherApiKey = useAppStore((s) => s.setWeatherApiKey);
  const setWeatherCity = useAppStore((s) => s.setWeatherCity);
  const updateThreshold = useAppStore((s) => s.updateThreshold);

  const [apiKeyInput, setApiKeyInput] = useState(weatherApiKey);
  const [cityInput, setCityInput] = useState(weatherCity);
  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [dbSize, setDbSize] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

    const loadDbSize = useCallback(async () => {
    try {
      const size = await getDatabaseSize();
      setDbSize(formatDatabaseSize(size));
    } catch (error) {
      console.error('Failed to get DB size:', error);
    }
  }, []);

  React.useEffect(() => {
    loadDbSize();
  }, [loadDbSize]);

    const handleTestApi = useCallback(async () => {
    setTestingApi(true);
    setTestResult(null);
    try {
      const result = await testWeatherConnection(apiKeyInput, cityInput);
      setTestResult(result.message);
      if (result.success) {
        setWeatherApiKey(apiKeyInput);
        setWeatherCity(cityInput);
        await setSetting('weather_api_key', apiKeyInput);
        await setSetting('weather_city', cityInput);
      }
    } catch (error) {
      setTestResult('Erreur inattendue');
    } finally {
      setTestingApi(false);
    }
  }, [apiKeyInput, cityInput, setWeatherApiKey, setWeatherCity]);

    const handleToggleAlerts = useCallback(
    async (value: boolean) => {
      setAlertsEnabled(value);
      await setSetting('alerts_enabled', value.toString());
    },
    [setAlertsEnabled]
  );

    const handleSpeedChange = useCallback(
    async (speed: SimulationSpeed) => {
      setSimulationSpeed(speed);
      await setSetting('simulation_speed', speed);
    },
    [setSimulationSpeed]
  );

    const handleToggleWeather = useCallback(
    async (value: boolean) => {
      setUseRealWeather(value);
      await setSetting('use_real_weather', value.toString());
    },
    [setUseRealWeather]
  );

    const handleExportAll = useCallback(async () => {
    setExporting(true);
    try {
      const readings = await getReadings(undefined, 10000);
      const alerts = await dbGetAlerts(undefined, 1000);

      const readingsCsv = readingsToCSV(readings);
      const alertsCsv = alertsToCSV(alerts);
      const combined = `=== SENSOR READINGS ===\n${readingsCsv}\n\n=== ALERTS ===\n${alertsCsv}`;

      const fileName = `iot_export_${Date.now()}.csv`;
      const file = new File(Paths.cache, fileName);
      file.write(combined);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Exporter les données',
        });
      }
    } catch (error) {
      RNAlert.alert('Erreur', "L'export a échoué.");
    } finally {
      setExporting(false);
    }
  }, []);

    const handlePurge = useCallback(() => {
    RNAlert.alert(
      'Purger toutes les données',
      "Cette action supprimera toutes les mesures et alertes. Les paramètres seront conservés.\n\nCette action est irréversible.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer tout',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await purgeAllData();
              RNAlert.alert(
                'Données supprimées',
                `${result.deletedReadings} mesures et ${result.deletedAlerts} alertes supprimées.`
              );
              loadDbSize();
            } catch (error) {
              RNAlert.alert('Erreur', 'La purge a échoué.');
            }
          },
        },
      ]
    );
  }, [loadDbSize]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header title="Paramètres" showStatus={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {}
        <SectionHeader title="Apparence" icon="palette-outline" colors={colors} />
        <View
          style={[
            styles.settingRow,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons
              name="moon-waning-crescent"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Mode sombre
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={themeConfig.colors.white}
          />
        </View>

        {}
        <SectionHeader
          title="Notifications"
          icon="bell-outline"
          colors={colors}
        />
        <View
          style={[
            styles.settingRow,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Alertes activées
            </Text>
          </View>
          <Switch
            value={alertsEnabled}
            onValueChange={handleToggleAlerts}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={themeConfig.colors.white}
          />
        </View>

        {}
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
          Fréquence de simulation
        </Text>
        <View style={styles.speedContainer}>
          {SPEED_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.speedChip,
                {
                  backgroundColor:
                    simulationSpeed === option.key
                      ? colors.primary
                      : colors.surface,
                  borderColor:
                    simulationSpeed === option.key
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={() => handleSpeedChange(option.key)}
            >
              <Text
                style={[
                  styles.speedText,
                  {
                    color:
                      simulationSpeed === option.key
                        ? themeConfig.colors.white
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
        <SectionHeader
          title="Seuils des capteurs"
          icon="tune-vertical"
          colors={colors}
        />
        {thresholds
          .filter((t) => t.sensorType !== 'motion')
          .map((threshold) => (
            <View
              key={threshold.sensorType}
              style={[
                styles.thresholdCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.thresholdHeader}>
                <View
                  style={[
                    styles.thresholdDot,
                    {
                      backgroundColor:
                        SENSOR_COLORS[threshold.sensorType],
                    },
                  ]}
                />
                <Text style={[styles.thresholdLabel, { color: colors.text }]}>
                  {SENSOR_LABELS[threshold.sensorType]}
                </Text>
                <Text
                  style={[
                    styles.thresholdRange,
                    { color: colors.textTertiary },
                  ]}
                >
                  {threshold.maxWarning} / {threshold.maxCritical}{' '}
                  {threshold.unit}
                </Text>
              </View>
              <View style={styles.thresholdRows}>
                <View style={styles.thresholdInputRow}>
                  <Text
                    style={[
                      styles.thresholdInputLabel,
                      { color: colors.warning },
                    ]}
                  >
                    Avertissement:
                  </Text>
                  <TextInput
                    style={[
                      styles.thresholdInput,
                      {
                        color: colors.text,
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                    value={threshold.maxWarning.toString()}
                    onChangeText={(text) => {
                      const val = parseFloat(text);
                      if (!isNaN(val)) {
                        updateThreshold(threshold.sensorType, {
                          maxWarning: val,
                        });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="Max"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
                <View style={styles.thresholdInputRow}>
                  <Text
                    style={[
                      styles.thresholdInputLabel,
                      { color: colors.error },
                    ]}
                  >
                    Critique:
                  </Text>
                  <TextInput
                    style={[
                      styles.thresholdInput,
                      {
                        color: colors.text,
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                    value={threshold.maxCritical.toString()}
                    onChangeText={(text) => {
                      const val = parseFloat(text);
                      if (!isNaN(val)) {
                        updateThreshold(threshold.sensorType, {
                          maxCritical: val,
                        });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="Max"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              </View>
            </View>
          ))}

        {}
        <SectionHeader
          title="API Externe"
          icon="cloud-outline"
          colors={colors}
        />
        <View
          style={[
            styles.settingRow,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons
              name="weather-partly-cloudy"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Météo réelle
            </Text>
          </View>
          <Switch
            value={useRealWeather}
            onValueChange={handleToggleWeather}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={themeConfig.colors.white}
          />
        </View>

        <View
          style={[
            styles.apiCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Clé API OpenWeatherMap
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                color: colors.text,
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            placeholder="Entrez votre clé API"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text
            style={[
              styles.inputLabel,
              { color: colors.textSecondary, marginTop: 10 },
            ]}
          >
            Ville
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                color: colors.text,
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
            value={cityInput}
            onChangeText={setCityInput}
            placeholder="Antananarivo"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: colors.primary }]}
            onPress={handleTestApi}
            disabled={testingApi}
          >
            {testingApi ? (
              <ActivityIndicator size="small" color={themeConfig.colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="connection"
                  size={16}
                  color={themeConfig.colors.white}
                />
                <Text style={styles.testButtonText}>
                  Tester la connexion
                </Text>
              </>
            )}
          </TouchableOpacity>

          {testResult && (
            <Text
              style={[
                styles.testResult,
                {
                  color: testResult.includes('Connecté')
                    ? colors.success
                    : colors.error,
                },
              ]}
            >
              {testResult}
            </Text>
          )}
        </View>

        {}
        <SectionHeader
          title="Données"
          icon="database-outline"
          colors={colors}
        />
        {dbSize && (
          <Text style={[styles.dbSize, { color: colors.textSecondary }]}>
            Taille de la base de données: {dbSize}
          </Text>
        )}
        <View style={styles.dataButtons}>
          <TouchableOpacity
            style={[
              styles.dataButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={handleExportAll}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color={themeConfig.colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="database-export-outline"
                  size={18}
                  color={themeConfig.colors.white}
                />
                <Text style={styles.dataButtonText}>
                  Exporter toutes les données
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dataButton,
              { backgroundColor: colors.error },
            ]}
            onPress={handlePurge}
          >
            <MaterialCommunityIcons
              name="delete-forever-outline"
              size={18}
              color={themeConfig.colors.white}
            />
            <Text style={styles.dataButtonText}>
              Purger l'historique
            </Text>
          </TouchableOpacity>
        </View>

        {}
        <SectionHeader title="À propos" icon="information-outline" colors={colors} />
        <View
          style={[
            styles.aboutCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.aboutName, { color: colors.primary }]}>
            {APP_NAME}
          </Text>
          <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>
            Version {APP_VERSION}
          </Text>
          <Text style={[styles.aboutDesc, { color: colors.textTertiary }]}>
            {APP_DESCRIPTION}
          </Text>
          <View style={styles.aboutDivider} />
          <Text style={[styles.aboutCredit, { color: colors.textTertiary }]}>
            Développé avec React Native + Expo
          </Text>
          <Text style={[styles.aboutCredit, { color: colors.textTertiary }]}>
            IA embarquée : Z-Score + Régression linéaire
          </Text>
          <Text style={[styles.aboutCredit, { color: colors.textTertiary }]}>
            Licence : MIT
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function SectionHeader({
  title,
  icon,
  colors,
}: {
  title: string;
  icon: string;
  colors: Record<string, string>;
}) {
  return (
    <View style={sectionStyles.header}>
      <MaterialCommunityIcons
        name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={18}
        color={colors.primary}
      />
      <Text style={[sectionStyles.title, { color: colors.text }]}>
        {title}
      </Text>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 4,
  },
  speedContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  speedChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  thresholdCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  thresholdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  thresholdDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  thresholdLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  thresholdRange: {
    fontSize: 11,
  },
  thresholdRows: {
    gap: 8,
  },
  thresholdInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thresholdInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 100,
  },
  thresholdInput: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  apiCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  testButtonText: {
    color: themeConfig.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  testResult: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  dbSize: {
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 4,
  },
  dataButtons: {
    gap: 8,
    marginBottom: 8,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
  },
  dataButtonText: {
    color: themeConfig.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  aboutCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  aboutName: {
    fontSize: 20,
    fontWeight: '800',
  },
  aboutVersion: {
    fontSize: 13,
    marginTop: 4,
  },
  aboutDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  aboutDivider: {
    height: 1,
    width: '80%',
    backgroundColor: themeConfig.colors.darkGray,
    marginVertical: 12,
  },
  aboutCredit: {
    fontSize: 11,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 40,
  },
});
