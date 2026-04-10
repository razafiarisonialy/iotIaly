/**
 * Theme management hook with dark/light mode support.
 * Persists theme preference to SQLite settings.
 * Provides a complete color palette based on current theme.
 */

import { useCallback, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '@/store/appStore';
import { getSetting, setSetting } from '@/services/database';
import { COLORS_LIGHT, COLORS_DARK } from '@/utils/constants';
import type { ColorPalette } from '@/utils/constants';

/** Return type of the useTheme hook */
interface UseThemeReturn {
  /** Whether dark mode is active */
  isDarkMode: boolean;
  /** The current color palette */
  colors: ColorPalette;
  /** Toggle between dark and light mode */
  toggleTheme: () => void;
  /** Set a specific theme mode */
  setTheme: (isDark: boolean) => void;
}

/**
 * Hook for managing the application theme.
 *
 * On first load, reads the saved preference from SQLite.
 * Falls back to the system color scheme if no preference is saved.
 * Persists any changes back to SQLite.
 *
 * @returns Theme state and controls
 *
 * @example
 * ```tsx
 * const { isDarkMode, colors, toggleTheme } = useTheme();
 * return <View style={{ backgroundColor: colors.background }} />;
 * ```
 */
export function useTheme(): UseThemeReturn {
  const systemColorScheme = useColorScheme();
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const isDatabaseReady = useAppStore((s) => s.isDatabaseReady);

  // Load saved theme preference on mount
  useEffect(() => {
    if (!isDatabaseReady) return;

    const loadTheme = async () => {
      try {
        const savedTheme = await getSetting('theme');
        if (savedTheme !== null) {
          setDarkMode(savedTheme === 'dark');
        } else {
          // Use system preference as default
          setDarkMode(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme setting:', error);
      }
    };

    loadTheme();
  }, [isDatabaseReady, systemColorScheme, setDarkMode]);

  /** Toggle between dark and light mode */
  const toggleTheme = useCallback(async () => {
    const newMode = !isDarkMode;
    setDarkMode(newMode);
    try {
      await setSetting('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme setting:', error);
    }
  }, [isDarkMode, setDarkMode]);

  /** Set a specific theme mode */
  const setTheme = useCallback(
    async (isDark: boolean) => {
      setDarkMode(isDark);
      try {
        await setSetting('theme', isDark ? 'dark' : 'light');
      } catch (error) {
        console.error('Failed to save theme setting:', error);
      }
    },
    [setDarkMode]
  );

  const colors = isDarkMode ? COLORS_DARK : COLORS_LIGHT;

  return { isDarkMode, colors, toggleTheme, setTheme };
}
