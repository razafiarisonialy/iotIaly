import type {
  SensorType,
  RuleEvaluationResult,
  ThresholdConfig,
} from '@/types';
import {
  NORMAL_MOTION_START_HOUR,
  NORMAL_MOTION_END_HOUR,
} from '@/utils/constants';

export function evaluateRules(
  sensorType: SensorType,
  value: number,
  thresholdConfig?: ThresholdConfig
): RuleEvaluationResult[] {
  const results: RuleEvaluationResult[] = [];

  switch (sensorType) {
    case 'temperature':
      if (value > (thresholdConfig?.maxWarning ?? 30)) {
        results.push({
          triggered: true,
          message: `Température élevée: ${value}°C — Système de refroidissement activé`,
          severity: 'warning',
          action: 'cooling_activated',
        });
      }
      if (value > (thresholdConfig?.maxCritical ?? 35)) {
        results.push({
          triggered: true,
          message: `Température critique: ${value}°C — Alerte surchauffe!`,
          severity: 'critical',
          action: 'overheat_alert',
        });
      }
      if (value < (thresholdConfig?.minWarning ?? 5)) {
        results.push({
          triggered: true,
          message: `Température basse: ${value}°C — Chauffage activé`,
          severity: 'warning',
          action: 'heating_activated',
        });
      }
      if (value < (thresholdConfig?.minCritical ?? 0)) {
        results.push({
          triggered: true,
          message: `Température critique: ${value}°C — Risque de gel!`,
          severity: 'critical',
          action: 'freeze_alert',
        });
      }
      break;

    case 'humidity':
      if (value > (thresholdConfig?.maxWarning ?? 75)) {
        results.push({
          triggered: true,
          message: `Humidité élevée: ${value}% — Déshumidificateur activé`,
          severity: 'warning',
          action: 'dehumidifier_activated',
        });
      }
      if (value > (thresholdConfig?.maxCritical ?? 85)) {
        results.push({
          triggered: true,
          message: `Humidité critique: ${value}% — Risque de condensation!`,
          severity: 'critical',
          action: 'condensation_alert',
        });
      }
      if (value < 30) {
        results.push({
          triggered: true,
          message: `Humidité faible: ${value}% — Humidificateur activé`,
          severity: 'info',
          action: 'humidifier_activated',
        });
      }
      break;

    case 'motion':
      if (value >= 1) {
        const hour = new Date().getHours();
        if (hour < NORMAL_MOTION_START_HOUR || hour >= NORMAL_MOTION_END_HOUR) {
          results.push({
            triggered: true,
            message: `Mouvement détecté hors heures normales (${hour}h00) — Intrusion potentielle!`,
            severity: 'critical',
            action: 'intrusion_alert',
          });
        }
      }
      break;

    case 'energy':
      if (value > (thresholdConfig?.maxWarning ?? 4.5)) {
        results.push({
          triggered: true,
          message: `Consommation élevée: ${value} kWh — Alerte surconsommation`,
          severity: 'warning',
          action: 'overconsumption_warning',
        });
      }
      if (value > (thresholdConfig?.maxCritical ?? 6)) {
        results.push({
          triggered: true,
          message: `Consommation critique: ${value} kWh — Pic de consommation!`,
          severity: 'critical',
          action: 'overconsumption_critical',
        });
      }
      break;

    case 'air_quality':
      if (value > (thresholdConfig?.maxWarning ?? 100)) {
        results.push({
          triggered: true,
          message: `Qualité d'air dégradée: AQI ${value} — Ventilation recommandée`,
          severity: 'warning',
          action: 'ventilation_recommended',
        });
      }
      if (value > (thresholdConfig?.maxCritical ?? 200)) {
        results.push({
          triggered: true,
          message: `Qualité d'air dangereuse: AQI ${value} — Restez à l'intérieur!`,
          severity: 'critical',
          action: 'air_quality_critical',
        });
      }
      break;
  }

  return results;
}
