/**
 * Root Layout — Application entry point.
 *
 * Responsibilities:
 * - Initialize SQLite database
 * - Load theme preference
 * - Start sensor simulation pipeline
 * - Show splash screen until ready
 * - Provide navigation stack
 */

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useDatabase } from '@/hooks/useDatabase';
import { useTheme } from '@/hooks/useTheme';
import { useSensorData } from '@/hooks/useSensorData';
import { useAppStore } from '@/store/appStore';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isReady: isDatabaseReady, error } = useDatabase();
  const setDatabaseReady = useAppStore((s) => s.setDatabaseReady);

  // Mark database ready in store
  useEffect(() => {
    if (isDatabaseReady) {
      setDatabaseReady(true);
    }
  }, [isDatabaseReady, setDatabaseReady]);

  // Hide splash screen when database is ready
  useEffect(() => {
    if (isDatabaseReady) {
      SplashScreen.hideAsync();
    }
  }, [isDatabaseReady]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Erreur d'initialisation</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  if (!isDatabaseReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={styles.loadingText}>Initialisation...</Text>
      </View>
    );
  }

  return <AppContent />;
}

/**
 * Inner app content — only renders after database is ready.
 * This separation ensures hooks that depend on the database
 * are only called when the database is initialized.
 */
function AppContent() {
  const { colors, isDarkMode } = useTheme();
  const isDatabaseReady = useAppStore((s) => s.isDatabaseReady);

  // Start the sensor simulation pipeline
  useSensorData(isDatabaseReady);

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    gap: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: '700',
  },
  errorMessage: {
    color: '#98989D',
    fontSize: 14,
    textAlign: 'center',
  },
});
