// db/repositories/alertRepository.ts
import { getDatabase } from '../index';
import type { Alert, AlertRow, SensorType, SeverityLevel } from '@/types';
import { mapRowToAlert, getCurrentTimestamp } from '@/utils/helpers';

export async function insertAlert(
  sensorType: SensorType,
  message: string,
  severity: SeverityLevel
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO alerts (sensor_type, message, severity, timestamp, acknowledged) VALUES (?, ?, ?, ?, 0)',
    sensorType,
    message,
    severity,
    getCurrentTimestamp()
  );
  return result.lastInsertRowId;
}

export async function getAlerts(
  acknowledged?: boolean,
  limit: number = 50
): Promise<Alert[]> {
  const db = await getDatabase();

  const hasFilter = acknowledged !== undefined;
  const query = hasFilter
    ? 'SELECT * FROM alerts WHERE acknowledged = ? ORDER BY timestamp DESC LIMIT ?'
    : 'SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ?';
  const params: (number | string)[] = hasFilter
    ? [acknowledged ? 1 : 0, limit]
    : [limit];

  const rows = await db.getAllAsync<AlertRow>(query, ...params);
  return rows.map(mapRowToAlert);
}

export async function acknowledgeAlert(alertId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE alerts SET acknowledged = 1 WHERE id = ?',
    alertId
  );
}

export async function acknowledgeAllAlerts(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE alerts SET acknowledged = 1 WHERE acknowledged = 0'
  );
}

export async function getUnacknowledgedAlertCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM alerts WHERE acknowledged = 0'
  );
  return result?.count ?? 0;
}

export async function purgeAllAlerts(): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM alerts');
  return result.changes;
}
