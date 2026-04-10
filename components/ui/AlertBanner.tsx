
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { SEVERITY_COLORS } from '@/utils/constants';
import { formatRelativeTime } from '@/utils/helpers';
import type { Alert, SeverityLevel, MaterialIconName } from '@/types';

interface AlertBannerProps {
    alert: Alert;
    onAcknowledge?: (alertId: number) => void;
    compact?: boolean;
}

const SEVERITY_ICONS: Record<SeverityLevel, MaterialIconName> = {
  info: 'information-outline',
  warning: 'alert-outline',
  critical: 'alert-circle-outline',
};

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  info: 'Info',
  warning: 'Avertissement',
  critical: 'Critique',
};

function AlertBannerComponent({
  alert,
  onAcknowledge,
  compact = false,
}: AlertBannerProps) {
  const { colors } = useTheme();
  const severityColor = SEVERITY_COLORS[alert.severity];
  const iconName = SEVERITY_ICONS[alert.severity];

  if (compact) {
    return (
      <View
        style={[
          styles.compactBanner,
          {
            backgroundColor: `${severityColor}15`,
            borderLeftColor: severityColor,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={16}
          color={severityColor}
        />
        <Text
          style={[styles.compactMessage, { color: colors.text }]}
          numberOfLines={1}
        >
          {alert.message}
        </Text>
        <Text style={[styles.compactTime, { color: colors.textTertiary }]}>
          {formatRelativeTime(alert.timestamp)}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          borderLeftColor: severityColor,
        },
      ]}
    >
      {}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: `${severityColor}20` },
            ]}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={14}
              color={severityColor}
            />
            <Text style={[styles.severityText, { color: severityColor }]}>
              {SEVERITY_LABELS[alert.severity]}
            </Text>
          </View>
        </View>
        <Text style={[styles.timeText, { color: colors.textTertiary }]}>
          {formatRelativeTime(alert.timestamp)}
        </Text>
      </View>

      {}
      <Text style={[styles.message, { color: colors.text }]}>
        {alert.message}
      </Text>

      {}
      <View style={styles.footerRow}>
        <View
          style={[styles.sensorBadge, { backgroundColor: colors.surfaceElevated }]}
        >
          <Text style={[styles.sensorText, { color: colors.textSecondary }]}>
            {alert.sensorType}
          </Text>
        </View>

        {!alert.acknowledged && onAcknowledge && (
          <TouchableOpacity
            style={[styles.ackButton, { backgroundColor: `${severityColor}15` }]}
            onPress={() => onAcknowledge(alert.id)}
            accessible
            accessibilityLabel="Acquitter cette alerte"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="check"
              size={14}
              color={severityColor}
            />
            <Text style={[styles.ackText, { color: severityColor }]}>
              Acquitter
            </Text>
          </TouchableOpacity>
        )}

        {alert.acknowledged && (
          <View style={styles.acknowledgedBadge}>
            <MaterialCommunityIcons
              name="check-circle"
              size={14}
              color={colors.textTertiary}
            />
            <Text
              style={[styles.acknowledgedText, { color: colors.textTertiary }]}
            >
              Acquittée
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export const AlertBanner = memo(AlertBannerComponent);

const styles = StyleSheet.create({
  banner: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 11,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sensorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sensorText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  ackText: {
    fontSize: 12,
    fontWeight: '600',
  },
  acknowledgedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  acknowledgedText: {
    fontSize: 11,
  },
  
  compactBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginBottom: 6,
    gap: 8,
  },
  compactMessage: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  compactTime: {
    fontSize: 10,
  },
});
