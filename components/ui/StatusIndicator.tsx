
import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { STATUS_COLORS } from '@/utils/constants';
import type { SystemStatus } from '@/types';
import { themeConfig } from '@/constants/colors';

interface StatusIndicatorProps {
    status: SystemStatus;
    label?: string;
    size?: number;
    textColor?: string;
}

const STATUS_LABELS: Record<SystemStatus, string> = {
  normal: 'Système normal',
  warning: 'Avertissement',
  critical: 'Alerte critique',
};

function StatusIndicatorComponent({
  status,
  label,
  size = 12,
  textColor,
}: StatusIndicatorProps) {
  const color = STATUS_COLORS[status];
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  
  useEffect(() => {
    if (status === 'normal') {
      pulseScale.value = 1;
      pulseOpacity.value = 0;
      return;
    }

    const speed = status === 'critical' ? 600 : 1200;

    pulseScale.value = withRepeat(
      withTiming(2, { duration: speed, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: speed, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
  }, [status, pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.dotWrapper, { width: size * 2.5, height: size * 2.5 }]}>
        {}
        <Animated.View
          style={[
            styles.pulse,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
            pulseStyle,
          ]}
        />
        {}
        <View
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      {label !== undefined && (
        <Text style={[styles.label, { color: textColor ?? color }]}>
          {label ?? STATUS_LABELS[status]}
        </Text>
      )}
    </View>
  );
}

export const StatusIndicator = memo(StatusIndicatorComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  dot: {
    shadowColor: themeConfig.colors.blackTransparent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
