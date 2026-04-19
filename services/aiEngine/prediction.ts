import type {
  SensorReading,
  PredictionResult,
  TrendDirection,
} from '@/types';
import {
  PREDICTION_WINDOW_SIZE,
  PREDICTION_MINUTES_AHEAD,
} from '@/utils/constants';
import { roundTo } from '@/utils/helpers';

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
