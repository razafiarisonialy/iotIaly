
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { themeConfig } from '@/constants/colors';
import { useDatabase } from '@/hooks/useDatabase';
import { useSensorData } from '@/hooks/useSensorData';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';

// Initialize i18n (side effect import — must come before any useTranslation)
import '@/services/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isReady: isDatabaseReady, error } = useDatabase();
  const setDatabaseReady = useAppStore((s) => s.setDatabaseReady);

  useEffect(() => {
    if (isDatabaseReady) setDatabaseReady(true);
  }, [isDatabaseReady, setDatabaseReady]);

  useEffect(() => {
    if (isDatabaseReady) SplashScreen.hideAsync();
  }, [isDatabaseReady]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Erreur d&apos;initialisation</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  if (!isDatabaseReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeConfig.colors.primaryBlue} />
        <Text style={styles.loadingText}>Initialisation...</Text>
      </View>
    );
  }

  return <AppContent />;
}

function AppContent() {
  const { colors, isDarkMode } = useTheme();
  const isDatabaseReady = useAppStore((s) => s.isDatabaseReady);

  useSensorData(isDatabaseReady);

  const paperTheme = isDarkMode
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: colors.primary,
          background: colors.background,
          surface: colors.surface,
          error: colors.error,
        },
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: colors.primary,
          background: colors.background,
          surface: colors.surface,
          error: colors.error,
        },
      };

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeConfig.colors.black,
    gap: 16,
  },
  loadingText: {
    color: themeConfig.colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeConfig.colors.black,
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    color: themeConfig.colors.red,
    fontSize: 18,
    fontWeight: '700',
  },
  errorMessage: {
    color: themeConfig.colors.gray,
    fontSize: 14,
    textAlign: 'center',
  },
});
