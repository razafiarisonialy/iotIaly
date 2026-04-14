
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

export default function SettingsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: t('settings.title'), headerShown: false }} />
      <Stack.Screen name="appearance" options={{ title: t('appearance.title') }} />
      <Stack.Screen name="simulation" options={{ title: t('simulationSettings.title') }} />
      <Stack.Screen name="api" options={{ title: t('apiSettings.title') }} />
      <Stack.Screen name="data" options={{ title: t('dataSettings.title') }} />
    </Stack>
  );
}
