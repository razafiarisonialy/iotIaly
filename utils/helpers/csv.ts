import type { SensorReading, Alert } from '@/types';

export function readingsToCSV(readings: SensorReading[]): string {
  const headers = 'ID,Capteur,Valeur,Unité,Date/Heure,Anomalie\n';
  const rows = readings
    .map(
      (r) =>
        `${r.id},${r.sensorType},${r.value},${r.unit},${r.timestamp},${r.isAnomaly ? 'Oui' : 'Non'}`
    )
    .join('\n');
  return headers + rows;
}

export function alertsToCSV(alerts: Alert[]): string {
  const headers = 'ID,Capteur,Message,Sévérité,Date/Heure,Acquittée\n';
  const rows = alerts
    .map(
      (a) =>
        `${a.id},${a.sensorType},"${a.message}",${a.severity},${a.timestamp},${a.acknowledged ? 'Oui' : 'Non'}`
    )
    .join('\n');
  return headers + rows;
}
