// db/repositories/sensorRepository.ts
import { getDatabase } from '../index';
import type { SensorReading, SensorReadingRow, SensorType } from '@/types';
import { mapRowToSensorReading, getCurrentTimestamp } from '@/utils/helpers';

export async function insertReading(
  sensorType: SensorType,
  value: number,
  unit: string,
  isAnomaly: boolean = false
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO sensor_readings (sensor_type, value, unit, timestamp, is_anomaly) VALUES (?, ?, ?, ?, ?)',
    sensorType,
    value,
    unit,
    getCurrentTimestamp(),
    isAnomaly ? 1 : 0
  );
  return result.lastInsertRowId;
}

export async function insertReadingsBatch(
  readings: Array<{
    sensorType: SensorType;
    value: number;
    unit: string;
    isAnomaly?: boolean;
  }>
): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const reading of readings) {
      await db.runAsync(
        'INSERT INTO sensor_readings (sensor_type, value, unit, timestamp, is_anomaly) VALUES (?, ?, ?, ?, ?)',
        reading.sensorType,
        reading.value,
        reading.unit,
        getCurrentTimestamp(),
        reading.isAnomaly ? 1 : 0
      );
    }
  });
}

export async function getReadings(
  sensorType?: SensorType,
  limit: number = 100,
  offset: number = 0
): Promise<SensorReading[]> {
  const db = await getDatabase();

  const hasFilter = sensorType !== undefined;
  const query = hasFilter
    ? 'SELECT * FROM sensor_readings WHERE sensor_type = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?'
    : 'SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT ? OFFSET ?';
  const params: (string | number)[] = hasFilter
    ? [sensorType, limit, offset]
    : [limit, offset];

  const rows = await db.getAllAsync<SensorReadingRow>(query, ...params);
  return rows.map(mapRowToSensorReading);
}

export async function getReadingsByDateRange(
  startDate: string,
  endDate: string,
  sensorType?: SensorType
): Promise<SensorReading[]> {
  const db = await getDatabase();

  const hasFilter = sensorType !== undefined;
  const query = hasFilter
    ? 'SELECT * FROM sensor_readings WHERE timestamp >= ? AND timestamp <= ? AND sensor_type = ? ORDER BY timestamp ASC'
    : 'SELECT * FROM sensor_readings WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC';
  const params: (string | number)[] = hasFilter
    ? [startDate, endDate, sensorType]
    : [startDate, endDate];

  const rows = await db.getAllAsync<SensorReadingRow>(query, ...params);
  return rows.map(mapRowToSensorReading);
}

export async function getLatestReadings(): Promise<SensorReading[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SensorReadingRow>(`
    SELECT sr.* FROM sensor_readings sr
    INNER JOIN (
      SELECT sensor_type, MAX(timestamp) as max_ts
      FROM sensor_readings
      GROUP BY sensor_type
    ) latest ON sr.sensor_type = latest.sensor_type AND sr.timestamp = latest.max_ts
  `);
  return rows.map(mapRowToSensorReading);
}

export async function getReadingsCount(
  sensorType?: SensorType
): Promise<number> {
  const db = await getDatabase();

  const hasFilter = sensorType !== undefined;
  const query = hasFilter
    ? 'SELECT COUNT(*) as count FROM sensor_readings WHERE sensor_type = ?'
    : 'SELECT COUNT(*) as count FROM sensor_readings';
  const params: string[] = hasFilter ? [sensorType] : [];

  const result = await db.getFirstAsync<{ count: number }>(query, ...params);
  return result?.count ?? 0;
}

export async function deleteOldReadings(beforeDate: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'DELETE FROM sensor_readings WHERE timestamp < ?',
    beforeDate
  );
  return result.changes;
}

export async function purgeAllReadings(): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM sensor_readings');
  return result.changes;
}
