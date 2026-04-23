import { analyzeReading } from '@/services/aiEngine';
import {
  insertAlert as dbInsertAlert,
  insertReading,
} from '@/services/database';
import { generateAllReadings } from '@/services/sensorSimulator';
import { showErrorToast } from '@/services/toastService';
import { useAppStore } from '@/store/appStore';
import type {
  Alert,
  SensorReading
} from '@/types';
import { SIMULATION_INTERVALS } from '@/types';
import { SENSOR_UNIT_MAP } from '@/utils/constants';
import { getCurrentTimestamp } from '@/utils/helpers';
import * as Haptics from 'expo-haptics';

import { useCallback, useEffect, useRef } from 'react';

export function useSensorData(enabled: boolean): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const simulationRunning = useAppStore((s) => s.simulationRunning);
  const simulationSpeed = useAppStore((s) => s.simulationSpeed);
  const alertsEnabled = useAppStore((s) => s.alertsEnabled);
  const thresholds = useAppStore((s) => s.thresholds);

  const updateSensorValue = useAppStore((s) => s.updateSensorValue);
  const setSensorPrediction = useAppStore((s) => s.setSensorPrediction);
  const addAlert = useAppStore((s) => s.addAlert);

  const tick = useCallback(async () => {
    try {
      const readings = generateAllReadings();

      for (const simReading of readings) {
        const { sensorType, value, unit, isAnomaly } = simReading;

        const sensorState = useAppStore.getState().sensors[sensorType];
        const thresholdConfig = thresholds.find(
          (t) => t.sensorType === sensorType
        );

        const analysis = analyzeReading(
          sensorType,
          value,
          sensorState.recentValues,
          sensorState.recentReadings,
          thresholdConfig
        );

        const detectedAnomaly = isAnomaly || analysis.anomaly.isAnomaly;

        const readingId = await insertReading(
          sensorType,
          value,
          unit,
          detectedAnomaly
        );

        const fullReading: SensorReading = {
          id: readingId,
          sensorType,
          value,
          unit: SENSOR_UNIT_MAP[sensorType],
          timestamp: getCurrentTimestamp(),
          isAnomaly: detectedAnomaly,
        };

        updateSensorValue(sensorType, value, detectedAnomaly, fullReading);
        setSensorPrediction(sensorType, analysis.prediction);

        if (alertsEnabled && analysis.rules.length > 0) {
          for (const rule of analysis.rules) {
            if (rule.triggered) {
              const alertId = await dbInsertAlert(
                sensorType,
                rule.message,
                rule.severity
              );

              const newAlert: Alert = {
                id: alertId,
                sensorType,
                message: rule.message,
                severity: rule.severity,
                timestamp: getCurrentTimestamp(),
                acknowledged: false,
              };

              addAlert(newAlert);

              if (rule.severity === 'critical') {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error
                ).catch(() => {});


              } else if (rule.severity === 'warning') {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Warning
                ).catch(() => {});


              }
            }
          }
        }

        if (detectedAnomaly && alertsEnabled) {
          const anomalyMessage = `Anomalie détectée sur ${sensorType}: valeur ${value} (Z-Score: ${analysis.anomaly.zScore})`;
          const alertId = await dbInsertAlert(
            sensorType,
            anomalyMessage,
            'warning'
          );

          const anomalyAlert: Alert = {
            id: alertId,
            sensorType,
            message: anomalyMessage,
            severity: 'warning',
            timestamp: getCurrentTimestamp(),
            acknowledged: false,
          };

          addAlert(anomalyAlert);


        }
      }
    } catch {
      showErrorToast('errors.sensorSimulationError');
    }
  }, [
    thresholds,
    alertsEnabled,
    updateSensorValue,
    setSensorPrediction,
    addAlert,
  ]);

  useEffect(() => {
    if (!enabled || !simulationRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const intervalMs = SIMULATION_INTERVALS[simulationSpeed];

    tick();

    intervalRef.current = setInterval(tick, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, simulationRunning, simulationSpeed, tick]);
}
