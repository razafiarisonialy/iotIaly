import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useTheme } from '@/hooks/useTheme';
import { useSystemStatus } from '@/store/appStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { APP_NAME } from '@/utils/constants';

interface HeaderProps {
    title?: string;
    showStatus?: boolean;
}

function HeaderComponent({ title, showStatus = true }: HeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const systemStatus = useSystemStatus();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateString = format(currentTime, 'EEEE dd MMMM yyyy', { locale: fr });
  const timeString = format(currentTime, 'HH:mm:ss');

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 8,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.appName, { color: colors.primary }]}>
            {title ?? APP_NAME}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {dateString}
          </Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={[styles.time, { color: colors.text }]}>
            {timeString}
          </Text>
          {showStatus && (
            <StatusIndicator status={systemStatus} size={10} />
          )}
        </View>
      </View>
    </View>
  );
}

export const Header = memo(HeaderComponent);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 6,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
