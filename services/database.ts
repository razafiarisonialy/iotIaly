/**
 * SQLite Database Service for the IoT/AIoT application.
 * Provides full CRUD operations for sensor readings, alerts, and settings.
 * Uses expo-sqlite async API with transaction support and schema migration.
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, DATABASE_VERSION } from '@/utils/constants';
import type {
  SensorReading,
  SensorReadingRow,
  Alert,
  AlertRow,
  Setting,
  SensorType,
  SeverityLevel,
} from '@/types';
import {
  mapRowToSensorReading,
  mapRowToAlert,
  getCurrentTimestamp,
} from '@/utils/helpers';

let database: SQLite.SQLiteDatabase | null = null;

// =============================================================================
// Database Initialization
// =============================================================================

/**
 * Open and initialize the SQLite database.
 * Creates tables if they don't exist and runs schema migrations.
 * @returns The initialized database instance
 */
export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }

  database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // Enable WAL mode for better concurrent read performance
  await database.execAsync('PRAGMA journal_mode = WAL;');

  // Create tables
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS sensor_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_type TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      is_anomaly INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_type TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'info',
      timestamp TEXT NOT NULL,
      acknowledged INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );
  `);

  // Run migrations
  await runMigrations(database);

  // Create indexes for performance
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_readings_sensor_type ON sensor_readings(sensor_type);
    CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON sensor_readings(timestamp);
    CREATE INDEX IF NOT EXISTS idx_readings_sensor_timestamp ON sensor_readings(sensor_type, timestamp);
    CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
    CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
    CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
  `);

  return database;
}

/**
 * Run schema migrations based on the current database version.
 * @param db - The database instance to migrate
 */
async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const versionResult = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1'
  );

  const currentVersion = versionResult?.version ?? 0;

  if (currentVersion < DATABASE_VERSION) {
    // Migration v0 → v1: Initial schema (already created above)
    if (currentVersion < 1) {
      // Set initial default settings
      await db.runAsync(
        `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
        'theme',
        'dark'
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
        'alerts_enabled',
        'true'
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
        'simulation_speed',
        'normal'
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
        'use_real_weather',
        'false'
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
        'weather_city',
        'Antananarivo'
      );
    }

    // Future migrations (v2, v3...) would go here:
    // if (currentVersion < 2) { ... }

    // Update version
    if (currentVersion === 0) {
      await db.runAsync(
        'INSERT INTO schema_version (version) VALUES (?)',
        DATABASE_VERSION
      );
    } else {
      await db.runAsync(
        'UPDATE schema_version SET version = ?',
        DATABASE_VERSION
      );
    }
  }
}

/**
 * Get the database instance, initializing if necessary.
 * @returns The database instance
 * @throws Error if database cannot be initialized
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    return initializeDatabase();
  }
  return database;
}

/**
 * Close the database connection.
 */
export async function closeDatabase(): Promise<void> {
  if (database) {
    await database.closeAsync();
    database = null;
  }
}

// =============================================================================
// Sensor Readings CRUD
// =============================================================================

/**
 * Insert a single sensor reading into the database.
 * @param sensorType - The type of sensor
 * @param value - The measured value
 * @param unit - The unit of measurement
 * @param isAnomaly - Whether this reading is an anomaly
 * @returns The ID of the inserted reading
 */
export async function insertReading(
  sensorType: SensorType,
  value: number,
  unit: string,
  isAnomaly: boolean = false
): Promise<number> {
  const db = await getDatabase();
  const timestamp = getCurrentTimestamp();

  const result = await db.runAsync(
    `INSERT INTO sensor_readings (sensor_type, value, unit, timestamp, is_anomaly) 
     VALUES (?, ?, ?, ?, ?)`,
    sensorType,
    value,
    unit,
    timestamp,
    isAnomaly ? 1 : 0
  );

  return result.lastInsertRowId;
}

/**
 * Insert multiple sensor readings in a single transaction.
 * @param readings - Array of readings to insert
 */
export async function insertReadingsBatch(
  readings: Array<{
    sensorType: SensorType;
    value: number;
    unit: string;
    isAnomaly?: boolean;
  }>
): Promise<void> {
  const db = await getDatabase();
  const timestamp = getCurrentTimestamp();

  await db.withTransactionAsync(async () => {
    for (const reading of readings) {
      await db.runAsync(
        `INSERT INTO sensor_readings (sensor_type, value, unit, timestamp, is_anomaly) 
         VALUES (?, ?, ?, ?, ?)`,
        reading.sensorType,
        reading.value,
        reading.unit,
        timestamp,
        reading.isAnomaly ? 1 : 0
      );
    }
  });
}

/**
 * Get sensor readings with optional filtering by sensor type.
 * @param sensorType - Optional sensor type filter
 * @param limit - Maximum number of readings to return (default 100)
 * @param offset - Number of readings to skip (default 0)
 * @returns Array of sensor readings ordered by timestamp descending
 */
export async function getReadings(
  sensorType?: SensorType,
  limit: number = 100,
  offset: number = 0
): Promise<SensorReading[]> {
  const db = await getDatabase();

  let query = 'SELECT * FROM sensor_readings';
  const params: (string | number)[] = [];

  if (sensorType) {
    query += ' WHERE sensor_type = ?';
    params.push(sensorType);
  }

  query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = await db.getAllAsync<SensorReadingRow>(query, ...params);
  return rows.map(mapRowToSensorReading);
}

/**
 * Get sensor readings within a date range.
 * @param startDate - Start date (ISO 8601)
 * @param endDate - End date (ISO 8601)
 * @param sensorType - Optional sensor type filter
 * @returns Array of sensor readings within the date range
 */
export async function getReadingsByDateRange(
  startDate: string,
  endDate: string,
  sensorType?: SensorType
): Promise<SensorReading[]> {
  const db = await getDatabase();

  let query =
    'SELECT * FROM sensor_readings WHERE timestamp >= ? AND timestamp <= ?';
  const params: (string | number)[] = [startDate, endDate];

  if (sensorType) {
    query += ' AND sensor_type = ?';
    params.push(sensorType);
  }

  query += ' ORDER BY timestamp ASC';

  const rows = await db.getAllAsync<SensorReadingRow>(query, ...params);
  return rows.map(mapRowToSensorReading);
}

/**
 * Get the latest reading for each sensor type.
 * @returns Array of the most recent reading per sensor
 */
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

/**
 * Get the total count of readings, optionally filtered by sensor type.
 * @param sensorType - Optional sensor type filter
 * @returns Total count of readings
 */
export async function getReadingsCount(
  sensorType?: SensorType
): Promise<number> {
  const db = await getDatabase();

  let query = 'SELECT COUNT(*) as count FROM sensor_readings';
  const params: string[] = [];

  if (sensorType) {
    query += ' WHERE sensor_type = ?';
    params.push(sensorType);
  }

  const result = await db.getFirstAsync<{ count: number }>(query, ...params);
  return result?.count ?? 0;
}

/**
 * Delete all readings older than a given date.
 * @param beforeDate - ISO 8601 date string; readings before this will be deleted
 * @returns Number of deleted readings
 */
export async function deleteOldReadings(beforeDate: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'DELETE FROM sensor_readings WHERE timestamp < ?',
    beforeDate
  );
  return result.changes;
}

/**
 * Delete ALL sensor readings from the database.
 * @returns Number of deleted readings
 */
export async function purgeAllReadings(): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM sensor_readings');
  return result.changes;
}

// =============================================================================
// Alerts CRUD
// =============================================================================

/**
 * Insert a new alert into the database.
 * @param sensorType - The sensor type that triggered the alert
 * @param message - Alert message describing the issue
 * @param severity - Alert severity level
 * @returns The ID of the inserted alert
 */
export async function insertAlert(
  sensorType: SensorType,
  message: string,
  severity: SeverityLevel
): Promise<number> {
  const db = await getDatabase();
  const timestamp = getCurrentTimestamp();

  const result = await db.runAsync(
    `INSERT INTO alerts (sensor_type, message, severity, timestamp, acknowledged)
     VALUES (?, ?, ?, ?, 0)`,
    sensorType,
    message,
    severity,
    timestamp
  );

  return result.lastInsertRowId;
}

/**
 * Get alerts with optional filtering by acknowledgment status.
 * @param acknowledged - Optional filter: true for acknowledged only, false for unacknowledged only
 * @param limit - Maximum number of alerts to return (default 50)
 * @returns Array of alerts ordered by timestamp descending
 */
export async function getAlerts(
  acknowledged?: boolean,
  limit: number = 50
): Promise<Alert[]> {
  const db = await getDatabase();

  let query = 'SELECT * FROM alerts';
  const params: (number | string)[] = [];

  if (acknowledged !== undefined) {
    query += ' WHERE acknowledged = ?';
    params.push(acknowledged ? 1 : 0);
  }

  query += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(limit);

  const rows = await db.getAllAsync<AlertRow>(query, ...params);
  return rows.map(mapRowToAlert);
}

/**
 * Mark an alert as acknowledged.
 * @param alertId - The ID of the alert to acknowledge
 */
export async function acknowledgeAlert(alertId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE alerts SET acknowledged = 1 WHERE id = ?',
    alertId
  );
}

/**
 * Mark all alerts as acknowledged.
 */
export async function acknowledgeAllAlerts(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE alerts SET acknowledged = 1 WHERE acknowledged = 0');
}

/**
 * Get the count of unacknowledged alerts.
 * @returns Number of unacknowledged alerts
 */
export async function getUnacknowledgedAlertCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM alerts WHERE acknowledged = 0'
  );
  return result?.count ?? 0;
}

/**
 * Delete ALL alerts from the database.
 * @returns Number of deleted alerts
 */
export async function purgeAllAlerts(): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM alerts');
  return result.changes;
}

// =============================================================================
// Settings CRUD
// =============================================================================

/**
 * Get a setting value by key.
 * @param key - The setting key to look up
 * @returns The setting value, or null if not found
 */
export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Setting>(
    'SELECT * FROM settings WHERE key = ?',
    key
  );
  return result?.value ?? null;
}

/**
 * Set a setting value (insert or update).
 * @param key - The setting key
 * @param value - The setting value
 */
export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value
  );
}

/**
 * Get all settings as a key-value map.
 * @returns Record of all settings
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Setting>('SELECT * FROM settings');
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

// =============================================================================
// Database Utilities
// =============================================================================

/**
 * Get the approximate size of the database in bytes.
 * @returns Database size in bytes
 */
export async function getDatabaseSize(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ page_count: number }>(
    'PRAGMA page_count'
  );
  const pageSize = await db.getFirstAsync<{ page_size: number }>(
    'PRAGMA page_size'
  );

  if (result && pageSize) {
    return result.page_count * pageSize.page_size;
  }
  return 0;
}

/**
 * Format database size for display.
 * @param bytes - Size in bytes
 * @returns Human-readable size string (e.g., "1.5 MB")
 */
export function formatDatabaseSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Purge all data from the database (readings, alerts, but keep settings).
 * @returns Object with count of deleted readings and alerts
 */
export async function purgeAllData(): Promise<{
  deletedReadings: number;
  deletedAlerts: number;
}> {
  const deletedReadings = await purgeAllReadings();
  const deletedAlerts = await purgeAllAlerts();
  return { deletedReadings, deletedAlerts };
}
