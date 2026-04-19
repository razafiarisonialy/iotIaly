import { useCallback, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '@/store/appStore';
import { getSetting, setSetting } from '@/services/database';
import { COLORS_LIGHT, COLORS_DARK } from '@/utils/constants';
import type { ColorPalette } from '@/utils/constants';

interface UseThemeReturn {
    isDarkMode: boolean;
    colors: ColorPalette;
    toggleTheme: () => void;
    setTheme: (isDark: boolean) => void;
}

export function useTheme(): UseThemeReturn {
  const systemColorScheme = useColorScheme();
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const isDatabaseReady = useAppStore((s) => s.isDatabaseReady);

  useEffect(() => {
    if (!isDatabaseReady) return;

    const loadTheme = async () => {
      try {
        const savedTheme = await getSetting('theme');
        if (savedTheme !== null) {
          setDarkMode(savedTheme === 'dark');
        } else {
          
          setDarkMode(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme setting:', error);
      }
    };

    loadTheme();
  }, [isDatabaseReady, systemColorScheme, setDarkMode]);

    const toggleTheme = useCallback(async () => {
    const newMode = !isDarkMode;
    setDarkMode(newMode);
    try {
      await setSetting('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme setting:', error);
    }
  }, [isDarkMode, setDarkMode]);

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
