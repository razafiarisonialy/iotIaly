import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Alert } from 'react-native';

// EN
import enCommon from '../locales/en/common.json';
import enTabs from '../locales/en/tabs.json';
import enDashboard from '../locales/en/dashboard.json';
import enSimulation from '../locales/en/simulation.json';
import enHistory from '../locales/en/history.json';
import enAlerts from '../locales/en/alerts.json';
import enSettings from '../locales/en/settings.json';
import enAppearance from '../locales/en/appearance.json';
import enSimulationSettings from '../locales/en/simulationSettings.json';
import enApiSettings from '../locales/en/apiSettings.json';
import enDataSettings from '../locales/en/dataSettings.json';
import enAbout from '../locales/en/about.json';
import enSensors from '../locales/en/sensors.json';
import enHeader from '../locales/en/header.json';
import enErrors from '../locales/en/errors.json';

// FR
import frCommon from '../locales/fr/common.json';
import frTabs from '../locales/fr/tabs.json';
import frDashboard from '../locales/fr/dashboard.json';
import frSimulation from '../locales/fr/simulation.json';
import frHistory from '../locales/fr/history.json';
import frAlerts from '../locales/fr/alerts.json';
import frSettings from '../locales/fr/settings.json';
import frAppearance from '../locales/fr/appearance.json';
import frSimulationSettings from '../locales/fr/simulationSettings.json';
import frApiSettings from '../locales/fr/apiSettings.json';
import frDataSettings from '../locales/fr/dataSettings.json';
import frAbout from '../locales/fr/about.json';
import frSensors from '../locales/fr/sensors.json';
import frHeader from '../locales/fr/header.json';
import frErrors from '../locales/fr/errors.json';

// ES
import esCommon from '../locales/es/common.json';
import esTabs from '../locales/es/tabs.json';
import esDashboard from '../locales/es/dashboard.json';
import esSimulation from '../locales/es/simulation.json';
import esHistory from '../locales/es/history.json';
import esAlerts from '../locales/es/alerts.json';
import esSettings from '../locales/es/settings.json';
import esAppearance from '../locales/es/appearance.json';
import esSimulationSettings from '../locales/es/simulationSettings.json';
import esApiSettings from '../locales/es/apiSettings.json';
import esDataSettings from '../locales/es/dataSettings.json';
import esAbout from '../locales/es/about.json';
import esSensors from '../locales/es/sensors.json';
import esHeader from '../locales/es/header.json';
import esErrors from '../locales/es/errors.json';

export const LANGUAGE_KEY = 'app_language';
export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.includes(saved as SupportedLanguage)) {
        callback(saved);
        return;
      }
      const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'fr';
      const lang = SUPPORTED_LANGUAGES.includes(deviceLocale as SupportedLanguage)
        ? deviceLocale
        : 'fr';
      callback(lang);
    } catch {
      callback('fr');
    }
  },
  init: () => { },
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch { }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          common: enCommon,
          tabs: enTabs,
          dashboard: enDashboard,
          simulation: enSimulation,
          history: enHistory,
          alerts: enAlerts,
          settings: enSettings,
          appearance: enAppearance,
          simulationSettings: enSimulationSettings,
          apiSettings: enApiSettings,
          dataSettings: enDataSettings,
          about: enAbout,
          sensors: enSensors,
          header: enHeader,
          errors: enErrors,
        },
      },
      fr: {
        translation: {
          common: frCommon,
          tabs: frTabs,
          dashboard: frDashboard,
          simulation: frSimulation,
          history: frHistory,
          alerts: frAlerts,
          settings: frSettings,
          appearance: frAppearance,
          simulationSettings: frSimulationSettings,
          apiSettings: frApiSettings,
          dataSettings: frDataSettings,
          about: frAbout,
          sensors: frSensors,
          header: frHeader,
          errors: frErrors,
        },
      },
      es: {
        translation: {
          common: esCommon,
          tabs: esTabs,
          dashboard: esDashboard,
          simulation: esSimulation,
          history: esHistory,
          alerts: esAlerts,
          settings: esSettings,
          appearance: esAppearance,
          simulationSettings: esSimulationSettings,
          apiSettings: esApiSettings,
          dataSettings: esDataSettings,
          about: esAbout,
          sensors: esSensors,
          header: esHeader,
          errors: esErrors,
        },
      },
    },
    fallbackLng: 'fr',
    lng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  })
  .catch(() => {
    Alert.alert('Error', 'i18n initialization failed');
  });

export default i18n;
