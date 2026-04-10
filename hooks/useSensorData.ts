/**
 * Hook for managing the sensor simulation lifecycle.
 *
 * Orchestrates the full data pipeline:
 * 1. Generate simulated readings
 * 2. Run AI analysis (anomaly detection, rules, prediction)
 * 3. Persist to SQLite database
 * 4. Update Zustand store
 * 5. Generate alerts from AI results
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { generateAllReadings } from '@/services/sensorSimulator';
import { analyzeReading } from '@/services/aiEngine';
import {
  insertReading,
  insertAlert as dbInsertAlert,
} from '@/services/database';
import type {
  SensorReading,
  SensorType,
  Alert,
} from '@/types';
import { SIMULATION_INTERVALS } from '@/types';
import { SENSOR_UNIT_MAP } from '@/utils/constants';
import { getCurrentTimestamp } from '@/utils/helpers';
import * as Haptics from 'expo-haptics';

/**
 * Hook that manages the sensor simulation loop.
 *
 * Starts/stops the simulation based on the `simulationRunning` state.
 * Runs at the interval defined by `simulationSpeed`.
 * On each tick, generates readings, analyzes them with the AI engine,
 * persists to SQLite, and updates the store.
 *
 * @param enabled - Whether the database is ready and simulation can run
 */
export function useSensorData(enabled: boolean): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const simulationRunning = useAppStore((s) => s.simulationRunning);
  const simulationSpeed = useAppStore((s) => s.simulationSpeed);
  const alertsEnabled = useAppStore((s) => s.alertsEnabled);
  const thresholds = useAppStore((s) => s.thresholds);

  const updateSensorValue = useAppStore((s) => s.updateSensorValue);
  const setSensorPrediction = useAppStore((s) => s.setSensorPrediction);
  const addAlert = useAppStore((s) => s.addAlert);

  /** Process a single simulation tick — generate, analyze, persist */
  const tick = useCallback(async () => {
    try {
      const readings = generateAllReadings();

      for (const simReading of readings) {
        const { sensorType, value, unit, isAnomaly } = simReading;

        // Get current store state for this sensor
        const sensorState = useAppStore.getState().sensors[sensorType];
        const thresholdConfig = thresholds.find(
          (t) => t.sensorType === sensorType
        );

        // Run AI analysis
        const analysis = analyzeReading(
          sensorType,
          value,
          sensorState.recentValues,
          sensorState.recentReadings,
          thresholdConfig
        );

        // Determine if this is an anomaly (either injected or AI-detected)
        const detectedAnomaly = isAnomaly || analysis.anomaly.isAnomaly;

        // Persist to SQLite
        const readingId = await insertReading(
          sensorType,
          value,
          unit,
          detectedAnomaly
        );

        // Create the full reading object
        const fullReading: SensorReading = {
          id: readingId,
          sensorType,
          value,
          unit: SENSOR_UNIT_MAP[sensorType],
          timestamp: getCurrentTimestamp(),
          isAnomaly: detectedAnomaly,
        };

        // Update store
        updateSensorValue(sensorType, value, detectedAnomaly, fullReading);
        setSensorPrediction(sensorType, analysis.prediction);

        // Process rule results into alerts
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

              // Haptic feedback for critical alerts
              if (rule.severity === 'critical') {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error
                ).catch(() => {
                  // Haptics may not be available on all devices
                });
              } else if (rule.severity === 'warning') {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Warning
                ).catch(() => {});
              }
            }
          }
        }

        // Generate anomaly alert if AI detected one
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
    } catch (error) {
      console.error('Sensor simulation tick error:', error);
    }
  }, [
    thresholds,
    alertsEnabled,
    updateSensorValue,
    setSensorPrediction,
    addAlert,
  ]);

  // Start/stop simulation based on state
  useEffect(() => {
    if (!enabled || !simulationRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const intervalMs = SIMULATION_INTERVALS[simulationSpeed];

    // Run first tick immediately
    tick();

    // Then start interval
    intervalRef.current = setInterval(tick, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, simulationRunning, simulationSpeed, tick]);
}
