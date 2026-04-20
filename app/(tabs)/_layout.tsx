
import { themeConfig } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { useUnreadAlertCount } from '@/store/appStore';
import { MAX_ALERTS_IN_STORE } from '@/store/slices/alertSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const unreadCount = useUnreadAlertCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 8,
          paddingTop: 4,
          marginBottom: 8,
          marginHorizontal: 8,
          borderRadius: 16,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="weather-partly-cloudy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="simulation"
        options={{
          title: t('tabs.simulation'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t('tabs.alerts'),
          tabBarBadge: unreadCount > 0 ? (unreadCount >= MAX_ALERTS_IN_STORE ? '+99' : unreadCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.error,
            color: themeConfig.colors.white,
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            minHeight: 18,
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
