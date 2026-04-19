import type { StatsSummary } from '@/types';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundTo(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

export function calculateStats(values: number[]): StatsSummary {
  if (values.length === 0) {
    return { min: 0, max: 0, average: 0, standardDeviation: 0, count: 0 };
  }

  const count = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const average = sum / count;

  const squaredDiffs = values.map((val) => Math.pow(val - average, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((acc, val) => acc + val, 0) / count;
  const standardDeviation = Math.sqrt(avgSquaredDiff);

  return {
    min: roundTo(min, 2),
    max: roundTo(max, 2),
    average: roundTo(average, 2),
    standardDeviation: roundTo(standardDeviation, 2),
    count,
  };
}
