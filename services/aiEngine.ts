
import type {
  SensorType,
  SensorReading,
  AnomalyResult,
  PredictionResult,
  RuleEvaluationResult,
  TrendDirection,
  ThresholdConfig,
} from '@/types';
import {
  ANOMALY_WINDOW_SIZE,
  ANOMALY_Z_THRESHOLD,
  PREDICTION_WINDOW_SIZE,
  PREDICTION_MINUTES_AHEAD,
  NORMAL_MOTION_START_HOUR,
  NORMAL_MOTION_END_HOUR,
} from '@/utils/constants';
import { roundTo } from '@/utils/helpers';





export function detectAnomaly(
  currentValue: number,
  recentReadings: number[],
  threshold: number = ANOMALY_Z_THRESHOLD
): AnomalyResult {
  
  if (recentReadings.length < 5) {
    return {
      isAnomaly: false,
      zScore: 0,
      mean: currentValue,
      standardDeviation: 0,
      value: currentValue,
    };
  }

  
  const window = recentReadings.slice(-ANOMALY_WINDOW_SIZE);

  
  const sum = window.reduce((acc, val) => acc + val, 0);
  const mean = sum / window.length;

  
  const squaredDiffs = window.map((val) => Math.pow(val - mean, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((acc, val) => acc + val, 0) / window.length;
  const standardDeviation = Math.sqrt(avgSquaredDiff);

  
  if (standardDeviation === 0) {
    return {
      isAnomaly: currentValue !== mean,
      zScore: currentValue !== mean ? Infinity : 0,
      mean: roundTo(mean, 2),
      standardDeviation: 0,
      value: currentValue,
    };
  }

  
  const zScore = (currentValue - mean) / standardDeviation;

  return {
    isAnomaly: Math.abs(zScore) > threshold,
    zScore: roundTo(zScore, 2),
    mean: roundTo(mean, 2),
    standardDeviation: roundTo(standardDeviation, 2),
    value: currentValue,
  };
}





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





export function predictTrend(
  readings: SensorReading[],
  minutesAhead: number = PREDICTION_MINUTES_AHEAD
): PredictionResult {
  
  if (readings.length < 3) {
    return {
      predictedValue: readings.length > 0 ? readings[readings.length - 1].value : 0,
      trend: 'stable',
      slope: 0,
      confidence: 0,
      minutesAhead,
    };
  }

  
  const window = readings.slice(-PREDICTION_WINDOW_SIZE);
  const n = window.length;

  
  const firstTime = new Date(window[0].timestamp).getTime();
  const xValues = window.map(
    (r) => (new Date(r.timestamp).getTime() - firstTime) / (60 * 1000)
  );
  const yValues = window.map((r) => r.value);

  
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
  const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);

  const denominator = n * sumX2 - sumX * sumX;

  
  if (denominator === 0) {
    return {
      predictedValue: roundTo(sumY / n, 2),
      trend: 'stable',
      slope: 0,
      confidence: 0,
      minutesAhead,
    };
  }

  
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  
  const lastX = xValues[xValues.length - 1];
  const predictedX = lastX + minutesAhead;
  const predictedValue = roundTo(slope * predictedX + intercept, 2);

  
  const yMean = sumY / n;
  const ssTotal = yValues.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
  const ssResidual = yValues.reduce((acc, y, i) => {
    const predicted = slope * xValues[i] + intercept;
    return acc + Math.pow(y - predicted, 2);
  }, 0);

  const rSquared = ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal;

  
  let trend: TrendDirection;
  const slopeThreshold = 0.01; 
  if (Math.abs(slope) < slopeThreshold) {
    trend = 'stable';
  } else if (slope > 0) {
    trend = 'rising';
  } else {
    trend = 'falling';
  }

  return {
    predictedValue,
    trend,
    slope: roundTo(slope, 4),
    confidence: roundTo(Math.max(0, rSquared), 2),
    minutesAhead,
  };
}





export interface FullAnalysisResult {
  anomaly: AnomalyResult;
  rules: RuleEvaluationResult[];
  prediction: PredictionResult;
}

export function analyzeReading(
  sensorType: SensorType,
  currentValue: number,
  recentValues: number[],
  recentReadings: SensorReading[],
  thresholdConfig?: ThresholdConfig
): FullAnalysisResult {
  
  const anomaly =
    sensorType === 'motion'
      ? {
          isAnomaly: false,
          zScore: 0,
          mean: 0,
          standardDeviation: 0,
          value: currentValue,
        }
      : detectAnomaly(currentValue, recentValues);

  const rules = evaluateRules(sensorType, currentValue, thresholdConfig);

  
  const prediction =
    sensorType === 'motion'
      ? {
          predictedValue: 0,
          trend: 'stable' as TrendDirection,
          slope: 0,
          confidence: 0,
          minutesAhead: PREDICTION_MINUTES_AHEAD,
        }
      : predictTrend(recentReadings);

  return { anomaly, rules, prediction };
}

export function getTrendDescription(
  trend: TrendDirection,
  slope: number
): string {
  const absSlope = Math.abs(slope);

  switch (trend) {
    case 'rising':
      if (absSlope > 0.5) return '↑ En forte hausse';
      if (absSlope > 0.1) return '↗ En hausse';
      return '↗ Légère hausse';
    case 'falling':
      if (absSlope > 0.5) return '↓ En forte baisse';
      if (absSlope > 0.1) return '↘ En baisse';
      return '↘ Légère baisse';
    case 'stable':
      return '→ Stable';
  }
}
