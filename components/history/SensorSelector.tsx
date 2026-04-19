import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { SensorType } from '@/types';
import { SENSOR_ICONS, SENSOR_COLORS, SENSOR_LABELS, SENSOR_TYPES } from '@/utils/constants';

interface SensorSelectorProps {
  selectedSensor: SensorType;
  setSelectedSensor: (sensor: SensorType) => void;
  showSensorPicker: boolean;
  setShowSensorPicker: (show: boolean) => void;
  colors: Record<string, string>;
}

export function SensorSelector({
  selectedSensor,
  setSelectedSensor,
  showSensorPicker,
  setShowSensorPicker,
  colors,
}: SensorSelectorProps) {
  return (
    <>
      <TouchableOpacity
        style={[
          styles.sensorSelector,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => setShowSensorPicker(!showSensorPicker)}
      >
        <MaterialCommunityIcons
          name={SENSOR_ICONS[selectedSensor]}
          size={20}
          color={SENSOR_COLORS[selectedSensor]}
        />
        <Text style={[styles.selectorText, { color: colors.text }]}>
          {SENSOR_LABELS[selectedSensor]}
        </Text>
        <MaterialCommunityIcons
          name={showSensorPicker ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {showSensorPicker && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {SENSOR_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.dropdownItem,
                selectedSensor === type && {
                  backgroundColor: `${SENSOR_COLORS[type]}15`,
                },
              ]}
              onPress={() => {
                setSelectedSensor(type);
                setShowSensorPicker(false);
              }}
            >
              <MaterialCommunityIcons
                name={SENSOR_ICONS[type]}
                size={18}
                color={SENSOR_COLORS[type]}
              />
              <Text style={[styles.dropdownText, { color: colors.text }]}>
                {SENSOR_LABELS[type]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sensorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  dropdown: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
